/*
 * DataCards for Obsidian
 * Copyright (C) 2025 Sophokles187
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Plugin, MarkdownPostProcessorContext, MarkdownView, Notice } from 'obsidian';
import { DataCardsSettings, DEFAULT_SETTINGS } from './models/settings';
import { DataCardsSettingTab } from './ui/settings-tab';
import { ParserService } from './services/parser';
import { RendererService } from './services/renderer';
import { DataviewApiUtil } from './utils/dataview-api';
import { Logger } from './utils/logger';
import { debounce } from './utils/throttle';

// Define BindTargetDeclaration interface based on Meta Bind's structure
interface BindTargetDeclaration {
  storageType: string;
  storagePath: string;
  storageProp: any;
  listenToChildren: boolean;
}

export default class DataCardsPlugin extends Plugin {
  settings: DataCardsSettings;
  private parserService: ParserService;
  private rendererService: RendererService;
  private dataviewApiUtil: DataviewApiUtil;
  private metaBindPlugin: any; // To hold the Meta Bind plugin instance
  private isRefreshing: boolean = false;
  private lastActiveElement: Element | null = null;
  private debouncedRefresh: any; // Will hold the debounced refresh function

  async onload() {
    await this.loadSettings();

    // Initialize logger with debug mode setting
    Logger.setDebugMode(this.settings.debugMode);

    // Initialize services
    this.parserService = new ParserService();
    this.rendererService = new RendererService(this.app, this.settings);
    this.dataviewApiUtil = new DataviewApiUtil(this);

    // Create the debounced refresh function with the configured delay
    this.updateDebouncedRefresh();

    // Register the datacards code block processor
    this.registerMarkdownCodeBlockProcessor('datacards', this.processDataCardsBlock.bind(this));

    // Add settings tab
    this.addSettingTab(new DataCardsSettingTab(this.app, this));

    // Register a command to refresh all datacards blocks
    this.addCommand({
      id: 'refresh-datacards',
      name: 'Refresh DataCards in active view',
      callback: () => {
        this.refreshActiveView(true); // true = show notification
      }
    });

    // Register event listener for Dataview metadata changes
    this.registerDataviewEvents();

    // Detect and register Meta Bind events
    this.registerMetaBindEvents();

    Logger.debug('DataCards plugin loaded');
  }

  /**
   * Update the debounced refresh function with the current delay setting
   */
  private updateDebouncedRefresh(): void {
    // Create a new debounced refresh function with the current delay setting
    this.debouncedRefresh = debounce(() => {
      Logger.debug(`Debounced refresh executing after ${this.settings.refreshDelay}ms`);
      this.refreshActiveView(false); // false = don't show notification during typing
    }, this.settings.refreshDelay);
  }

  /**
   * Detect Meta Bind plugin and register event listeners
   */
  private registerMetaBindEvents(): void {
    this.app.workspace.onLayoutReady(() => {
      // Use type assertion to access plugins if necessary
      this.metaBindPlugin = (this.app as any).plugins?.plugins['meta-bind'];

      if (!this.metaBindPlugin) {
        Logger.debug('Meta Bind plugin not found or Obsidian plugins structure not accessible as expected. Skipping Meta Bind event registration.');
        return;
      }

      Logger.debug('Meta Bind plugin found. Registering event listeners.');

      // Register for general Obsidian metadata changes to catch all property updates
      this.registerEvent(
        this.app.metadataCache.on('changed', (file: TFile) => {
          if (file && file.path) {
            Logger.debug(`Obsidian metadata changed for file: ${file.path}`);
            this.handleMetaBindChange(file.path, null, null);
          }
        })
      );

      // Try high-level API first
      if (this.metaBindPlugin.api && typeof this.metaBindPlugin.api.onChange === 'function') {
        Logger.debug('Registering using Meta Bind api.onChange');
        this.registerEvent(
          // @ts-ignore - Using Meta Bind's specific API signature
          this.metaBindPlugin.api.onChange((file: TFile | string, key: string, value: any) => {
            // Extract file path if TFile object is provided
            const filePath = typeof file === 'string' ? file : file?.path;
            if (filePath) {
              // Add special logging for toggle inputs
              if (typeof value === 'boolean') {
                Logger.debug(`Meta Bind onChange event (TOGGLE): file=${filePath}, key=${key}, value=${JSON.stringify(value)}`);
              } else {
                Logger.debug(`Meta Bind onChange event: file=${filePath}, key=${key}, value=${JSON.stringify(value)}`);
              }
              
              // Force immediate refresh for toggle inputs to ensure they update properly
              if (typeof value === 'boolean') {
                Logger.debug(`Toggle input detected - using immediate refresh`);
                // Use a very short delay for toggle inputs to ensure the UI updates quickly
                setTimeout(() => {
                  this.refreshActiveView(false);
                }, 50);
              } else {
                this.handleMetaBindChange(filePath, key, value);
              }
            } else {
              Logger.warn('Meta Bind onChange event received without a valid file path.');
            }
          })
        );
      }
      
      // Also register with metadata manager events for comprehensive coverage
      if (this.metaBindPlugin.metadataManager && typeof this.metaBindPlugin.metadataManager.on === 'function') {
        Logger.debug('Registering using Meta Bind metadataManager events');
        
        // Listen for 'changed' events
        this.registerEvent(
          // @ts-ignore - Using Meta Bind's specific API signature
          this.metaBindPlugin.metadataManager.on('changed', (bindTarget: BindTargetDeclaration, value: any) => {
            if (bindTarget && bindTarget.storagePath) {
              // Add special logging for toggle inputs
              if (typeof value === 'boolean') {
                Logger.debug(`Meta Bind metadataManager 'changed' event (TOGGLE): path=${bindTarget.storagePath}, prop=${JSON.stringify(bindTarget.storageProp)}, value=${JSON.stringify(value)}`);
                
                // Force immediate refresh for toggle inputs to ensure they update properly
                Logger.debug(`Toggle input detected in metadataManager - using immediate refresh`);
                // Use a very short delay for toggle inputs to ensure the UI updates quickly
                setTimeout(() => {
                  this.refreshActiveView(false);
                }, 50);
              } else {
                Logger.debug(`Meta Bind metadataManager 'changed' event: path=${bindTarget.storagePath}, prop=${JSON.stringify(bindTarget.storageProp)}, value=${JSON.stringify(value)}`);
                this.handleMetaBindChange(bindTarget.storagePath, bindTarget.storageProp, value);
              }
            } else {
              Logger.warn('Meta Bind metadataManager "changed" event received without a valid bindTarget.');
            }
          })
        );
        
        // Listen for 'deleted' events
        this.registerEvent(
          // @ts-ignore - Using Meta Bind's specific API signature
          this.metaBindPlugin.metadataManager.on('deleted', (bindTarget: BindTargetDeclaration) => {
            if (bindTarget && bindTarget.storagePath) {
              Logger.debug(`Meta Bind metadataManager 'deleted' event: path=${bindTarget.storagePath}, prop=${JSON.stringify(bindTarget.storageProp)}`);
              this.handleMetaBindChange(bindTarget.storagePath, bindTarget.storageProp, null);
            }
          })
        );
      }
      
      // Try to register for specific input field events if available
      if (this.metaBindPlugin.api && typeof this.metaBindPlugin.api.onFieldChanged === 'function') {
        Logger.debug('Registering using Meta Bind api.onFieldChanged');
        this.registerEvent(
          // @ts-ignore - Using Meta Bind's specific API signature
          this.metaBindPlugin.api.onFieldChanged((fieldType: string, filePath: string, key: string, value: any) => {
            if (filePath) {
              Logger.debug(`Meta Bind onFieldChanged event: fieldType=${fieldType}, file=${filePath}, key=${key}, value=${JSON.stringify(value)}`);
              
              // Special handling for toggle fields
              if (fieldType === 'toggle' || typeof value === 'boolean') {
                Logger.debug(`Toggle field changed - using immediate refresh`);
                // Use a very short delay for toggle inputs to ensure the UI updates quickly
                setTimeout(() => {
                  this.refreshActiveView(false);
                }, 50);
              } else {
                this.handleMetaBindChange(filePath, key, value);
              }
            }
          })
        );
      }
    });
  }

  /**
   * Register event listeners for Dataview events
   */
  private registerDataviewEvents(): void {
    // Wait for Dataview to be ready before registering events
    this.app.workspace.onLayoutReady(() => {
      // Check if Dataview is enabled
      if (!this.dataviewApiUtil.isDataviewEnabled()) {
        Logger.warn('Dataview plugin is not enabled, cannot register for metadata change events');
        return;
      }

      // Register for the metadata-change event
      // Use type assertion to handle the Dataview custom event
      this.registerEvent(
        // @ts-ignore - Dataview adds custom events to metadataCache
        this.app.metadataCache.on('dataview:metadata-change', (type: string, file: any) => {
          this.handleMetadataChange(type, file);
        })
      );

      Logger.debug('Registered for Dataview metadata change events');
    });
  }

  /**
   * Handle Dataview metadata changes
   * 
   * @param type The type of change
   * @param file The file that changed
   */
  private handleMetadataChange(type: string, file: any): void {
    // Only process if dynamic updates are enabled globally
    if (!this.settings.enableDynamicUpdates) {
      Logger.debug('Dynamic updates are disabled globally, ignoring metadata change');
      return;
    }

    Logger.debug(`Dataview metadata changed: ${type} for file ${file?.path}`);

    // Use the debounced refresh
    this.debouncedRefresh();
  }

  /**
   * Handle Meta Bind property changes
   *
   * @param filePath The path of the file that changed
   * @param property The property that changed (key or BindTargetDeclaration.storageProp)
   * @param value The new value
   */
  private handleMetaBindChange(filePath: string, property: any, value: any): void {
    // Only process if dynamic updates are enabled globally
    if (!this.settings.enableDynamicUpdates) {
      Logger.debug('Dynamic updates are disabled globally, ignoring Meta Bind change');
      return;
    }

    Logger.debug(`Meta Bind property changed: ${property} in file ${filePath}, value: ${JSON.stringify(value)}`);

    // Special handling for boolean values (toggle inputs)
    if (typeof value === 'boolean') {
      Logger.debug(`Toggle value detected in handleMetaBindChange: ${value}`);
      
      // For toggle inputs, we need to force a Dataview cache refresh
      this.forceDataviewCacheRefresh(filePath);
      
      // For toggle inputs, we'll use a shorter delay to ensure they update quickly
      setTimeout(() => {
        this.refreshActiveView(false);
      }, 50);
      return;
    }

    // Use the debounced refresh for other input types
    this.debouncedRefresh();
  }
  
  /**
   * Force Dataview to refresh its cache for a specific file
   * This is particularly important for boolean properties which might not be properly updated otherwise
   * 
   * @param filePath The path of the file to refresh
   */
  private forceDataviewCacheRefresh(filePath: string): void {
    Logger.debug(`Forcing Dataview cache refresh for file: ${filePath}`);
    
    // Check if Dataview is enabled
    if (!this.dataviewApiUtil.isDataviewEnabled()) {
      Logger.warn('Dataview plugin is not enabled, cannot force cache refresh');
      return;
    }
    
    try {
      // Get the Dataview API
      const dataviewApi = this.dataviewApiUtil.getDataviewApi();
      if (!dataviewApi) {
        Logger.warn('Dataview API not available, cannot force cache refresh');
        return;
      }
      
      // Get the file from the vault
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (!file || !('stat' in file)) {
        Logger.warn(`File not found or not a file: ${filePath}`);
        return;
      }
      
      // Force Dataview to refresh its cache for this file
      // This is a bit of a hack, but it's the most reliable way to ensure the cache is refreshed
      // We're using the internal index method which is not officially part of the API
      try {
        // Access the internal API using type assertion to avoid TypeScript errors
        const dataviewIndex = dataviewApi.index as any;
        if (dataviewIndex && typeof dataviewIndex.refreshFile === 'function') {
          dataviewIndex.refreshFile(file);
          Logger.debug(`Successfully forced Dataview cache refresh for file: ${filePath}`);
        } else {
          // Fallback: trigger a metadata-change event
          // This is less reliable but might work in some cases
          this.app.metadataCache.trigger('dataview:metadata-change', 'update', file);
          Logger.debug(`Triggered dataview:metadata-change event for file: ${filePath}`);
        }
      } catch (refreshError) {
        Logger.warn(`Error accessing Dataview internal API: ${refreshError}`);
        // Fallback: trigger a metadata-change event
        this.app.metadataCache.trigger('dataview:metadata-change', 'update', file);
        Logger.debug(`Triggered dataview:metadata-change event for file: ${filePath}`);
      }
    } catch (error) {
      Logger.warn(`Error forcing Dataview cache refresh: ${error}`);
    }
  }

  onunload() {
    Logger.debug('DataCards plugin unloaded');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    
    // Update logger debug mode if it changed
    Logger.setDebugMode(this.settings.debugMode);
    
    // Update the renderer service with the new settings
    this.rendererService.updateSettings(this.settings);
    
    // Update the debounced refresh function with the new delay
    this.updateDebouncedRefresh();
    
    // Refresh active view's datacards blocks to apply the new settings
    this.refreshActiveView(true); // true = show notification
  }

  /**
   * Process a datacards code block
   * 
   * @param source The content of the code block
   * @param el The HTML element to render into
   * @param ctx The markdown post processor context
   */
  private async processDataCardsBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
    Logger.debug('Processing DataCards block');

    try {
      // Parse the block content
      const { query, settings } = this.parserService.parseDataCardsBlock(source);
      
      // Check if this is a TABLE WITHOUT ID query
      const isTableWithoutId = query.toLowerCase().includes('table without id');
      
      // If it's a TABLE WITHOUT ID query, we need to modify it to include the file
      let modifiedQuery = query;
      if (isTableWithoutId) {
        // Add file to the query if it's not already included
        if (!query.toLowerCase().includes('file')) {
          modifiedQuery = query.replace(/table without id/i, 'TABLE WITHOUT ID file,');
        }
      }
      
      // Get the source file path
      const sourcePath = ctx.sourcePath;
      
      // Create a container for the Dataview query result
      const dataviewContainer = document.createElement('div');
      dataviewContainer.style.display = 'none';
      document.body.appendChild(dataviewContainer); // Temporarily add to DOM for Dataview to work with it
      
      // Execute the Dataview query
      const result = await this.dataviewApiUtil.executeSafeQuery(modifiedQuery, sourcePath, dataviewContainer);
      
      // Remove the temporary container
      document.body.removeChild(dataviewContainer);
      
      // Check if the result is empty (no matching files)
      if (Array.isArray(result.value) && result.value.length === 0) {
        Logger.debug('Dataview returned empty array');
        this.rendererService.renderEmptyState(el, 'No notes found');
        return;
      }

      if (result.value.values && Array.isArray(result.value.values) && result.value.values.length === 0) {
        Logger.debug('Dataview returned empty table');
        this.rendererService.renderEmptyState(el, 'No notes found');
        return;
      }

      // Check if result.value is the actual data or if it's wrapped in a structure
      let dataToRender = result.value;
      
      // If the result is the response object itself, extract the actual data
      if (dataToRender && typeof dataToRender === 'object' && 'successful' in dataToRender && 'value' in dataToRender) {
        Logger.debug('Unwrapping nested result structure');
        dataToRender = dataToRender.value;
      }
      
      // If not empty, render the cards with the extracted data
      this.rendererService.renderCards(el, dataToRender, settings);
    } catch (queryError) {
      // Handle query execution errors
      Logger.error('Error executing Dataview query:', queryError);
      
      el.createEl('div', {
        cls: 'datacards-error',
        text: `Error executing Dataview query: ${queryError.message || String(queryError)}`
      });
    }
  }

  /**
   * Refresh all datacards blocks in the current view
   * 
   * @param showNotification Whether to show a notification after refreshing
   */
  private refreshActiveView(showNotification: boolean = true) {
    // Prevent multiple refreshes from happening concurrently
    if (this.isRefreshing) {
      Logger.debug('Refresh already in progress, skipping.');
      return;
    }

    this.isRefreshing = true;
    Logger.debug('Starting refreshActiveView...');

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView.previewMode) {
      // Trigger a rerender of the preview mode
      activeView.previewMode.rerender(true);

      // Show notification if requested
      if (showNotification) {
        new Notice('DataCards refreshed', 2000);
      }

      // Reset the refreshing flag after a short delay
      setTimeout(() => {
        this.isRefreshing = false;
        Logger.debug('Refresh finished.');
      }, 250);
    } else {
      if (showNotification) {
        new Notice('No active markdown view to refresh', 2000);
      }
      this.isRefreshing = false; // Reset flag if no view found
      Logger.debug('No active markdown view found.');
    }
  }
}

// Placeholder for TFile if not imported - adjust import if necessary
declare class TFile {
    path: string;
}
