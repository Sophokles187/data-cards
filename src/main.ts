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

import { Plugin, MarkdownPostProcessorContext, MarkdownView, Notice, debounce } from 'obsidian';
import { DataCardsSettings, DEFAULT_SETTINGS } from './models/settings';
import { DataCardsSettingTab } from './ui/settings-tab';
import { ParserService } from './services/parser';
import { RendererService } from './services/renderer';
import { DataviewApiUtil } from './utils/dataview-api';
import { Logger } from './utils/logger';

export default class DataCardsPlugin extends Plugin {
  settings: DataCardsSettings;
  private parserService: ParserService;
  private rendererService: RendererService;
  private dataviewApiUtil: DataviewApiUtil;
  private isRefreshing: boolean = false;
  private lastActiveElement: Element | null = null;
  private refreshDebounceTimeout: number = 2500; // ms to wait before refreshing (1.5 seconds)

  async onload() {
    await this.loadSettings();

    // Initialize logger with debug mode setting
    Logger.setDebugMode(this.settings.debugMode);

    // Initialize services
    this.parserService = new ParserService();
    this.rendererService = new RendererService(this.app, this.settings);
    this.dataviewApiUtil = new DataviewApiUtil(this);

    // Register the datacards code block processor
    this.registerMarkdownCodeBlockProcessor('datacards', this.processDataCardsBlock.bind(this));

    // Add settings tab
    this.addSettingTab(new DataCardsSettingTab(this.app, this));

    // Register a command to refresh all datacards blocks
    this.addCommand({
      id: 'refresh-datacards',
      name: 'Refresh all DataCards',
      callback: () => {
        this.refreshAllDataCards(true); // true = show notification
      }
    });

    // Register event listener for Dataview metadata changes
    this.registerDataviewEvents();

    Logger.debug('DataCards plugin loaded');
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
    
    // Refresh the affected views with debouncing
    this.debouncedRefresh(file);
  }

  /**
   * Debounced refresh function to avoid multiple refreshes in quick succession
   * This helps prevent input field focus loss when typing quickly
   */
  private debouncedRefresh = debounce((file: any) => {
    this.refreshAffectedDataCards(file);
  }, this.refreshDebounceTimeout);

  /**
   * Refresh DataCards that might be affected by changes to a specific file
   * 
   * @param file The file that changed
   */
  private refreshAffectedDataCards(file: any): void {
    if (!file) return;
    
    // Save the currently focused element before refresh
    this.lastActiveElement = document.activeElement;
    
    // For now, we'll just refresh all DataCards since determining which ones
    // are affected by a specific file change would require tracking query results
    this.refreshAllDataCards(false); // false = don't show notification during typing
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
    
    // Refresh all datacards blocks to apply the new settings
    this.refreshAllDataCards(true); // true = show notification
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
    
    // Check if Dataview is enabled
    if (!this.dataviewApiUtil.isDataviewEnabled()) {
      Logger.error('Dataview plugin is not enabled');
      el.createEl('div', {
        cls: 'datacards-error',
        text: 'Dataview plugin is required but not enabled'
      });
      return;
    }
    
    // Wait for Dataview to be ready
    const isDataviewReady = await this.dataviewApiUtil.waitForDataviewReady();
    if (!isDataviewReady) {
      Logger.warn('Timed out waiting for Dataview to be ready');
      // Continue anyway, but log a warning
    }

    try {
      // Parse the code block content
      const { query, settings } = this.parserService.parseDataCardsBlock(source);
      Logger.debug('Parsed query:', query);
      Logger.debug('Parsed settings:', settings);

      // Get the source file path
      const sourcePath = ctx.sourcePath;
      
      // Create a container for the Dataview query result
      const dataviewContainer = document.createElement('div');
      dataviewContainer.style.display = 'none';
      document.body.appendChild(dataviewContainer); // Temporarily add to DOM for Dataview to work with it

      try {
        // Execute the Dataview query
        Logger.debug('Executing Dataview query');
        const result = await this.dataviewApiUtil.executeSafeQuery(query, sourcePath, dataviewContainer);

        // Remove the temporary container
        document.body.removeChild(dataviewContainer);
        
        // Add detailed logging of the result structure
        Logger.debug('Query result:', result);
        if (result && result.value) {
          Logger.debug('Result value type:', typeof result.value);
          Logger.debug('Is array?', Array.isArray(result.value));
          if (typeof result.value === 'object') {
            const keys = Object.keys(result.value);
            Logger.debug('Result value keys:', keys);
            
            // Log each key and its value
            keys.forEach(key => {
              Logger.debug(`result.value["${key}"] =`, result.value[key]);
              Logger.debug(`result.value["${key}"] type =`, typeof result.value[key]);
              Logger.debug(`result.value["${key}"] is array? =`, Array.isArray(result.value[key]));
              
              // If it's an array, log its length
              if (Array.isArray(result.value[key])) {
                Logger.debug(`result.value["${key}"] length =`, result.value[key].length);
              }
              
              // If it's an object, log its keys
              if (typeof result.value[key] === 'object' && result.value[key] !== null && !Array.isArray(result.value[key])) {
                Logger.debug(`result.value["${key}"] keys =`, Object.keys(result.value[key]));
              }
            });
            
            if ('values' in result.value) {
              Logger.debug('Result.value.values type:', typeof result.value.values);
              Logger.debug('Result.value.values is array?', Array.isArray(result.value.values));
              if (Array.isArray(result.value.values)) {
                Logger.debug('Result.value.values length:', result.value.values.length);
              }
            }
          }
        }

        if (!result) {
          Logger.error('Result is undefined or null');
          el.createEl('div', {
            cls: 'datacards-error',
            text: 'Error executing Dataview query: undefined result'
          });
          return;
        }

        if (!result.successful) {
          // Handle query error
          const errorMessage = `Error executing Dataview query: ${result.value || 'unknown error'}`;
          Logger.error(errorMessage);
          el.createEl('div', {
            cls: 'datacards-error',
            text: errorMessage
          });
          return;
        }
        
        // Check if the result value itself has a successful property and it's false
        if (result.value && typeof result.value === 'object' && 'successful' in result.value && result.value.successful === false) {
          // Handle query error in the result value
          const errorMessage = `Error executing Dataview query: ${result.value.error || 'unknown error'}`;
          Logger.error(errorMessage);
          el.createEl('div', {
            cls: 'datacards-error',
            text: errorMessage
          });
          return;
        }

        // Check if result.value is undefined, null, or empty
        if (result.value === undefined || result.value === null) {
          Logger.error('Dataview returned null or undefined value');
          el.createEl('div', {
            cls: 'datacards-error',
            text: 'Dataview returned no results. Make sure your query is correct and returns data.'
          });
          return;
        }

        // Check if the result is empty (no matching files)
        if (Array.isArray(result.value) && result.value.length === 0) {
          Logger.debug('Dataview returned empty array - using super simple approach');
          Logger.debug('Empty array detected, using simple approach');
          
          // Create a very simple message with no styling
          el.innerHTML = '<h3 style="color: red; background-color: yellow; padding: 20px; margin: 20px; border: 3px solid black;">NO NOTES FOUND (Empty Array)</h3>';
          
          // Log to console for debugging
          Logger.debug('Created simple empty state message for empty array');
          return;
        }

        if (result.value.values && Array.isArray(result.value.values) && result.value.values.length === 0) {
          Logger.debug('Dataview returned empty table - using super simple approach');
          Logger.debug('Empty table detected, using simple approach');
          
          // Create a very simple message with no styling
          el.innerHTML = '<h3 style="color: red; background-color: yellow; padding: 20px; margin: 20px; border: 3px solid black;">NO NOTES FOUND (Empty Table)</h3>';
          
          // Log to console for debugging
          Logger.debug('Created simple empty state message for empty table');
          return;
        }
        
        // Check for another type of empty result (with data property)
        if (result.value.data && Array.isArray(result.value.data) && result.value.data.length === 0) {
          Logger.debug('Dataview returned empty data array - using super simple approach');
          Logger.debug('Empty data array detected, using simple approach');
          
          // Create a very simple message with no styling
          el.innerHTML = '<h3 style="color: red; background-color: yellow; padding: 20px; margin: 20px; border: 3px solid black;">NO NOTES FOUND (Empty Data Array)</h3>';
          
          // Log to console for debugging
          Logger.debug('Created simple empty state message for empty data array');
          return;
        }
        
        // Check for yet another type of empty result (with rows property)
        if (result.value.rows && Array.isArray(result.value.rows) && result.value.rows.length === 0) {
          Logger.debug('Dataview returned empty rows array - using super simple approach');
          Logger.debug('Empty rows array detected, using simple approach');
          
          // Create a very simple message with no styling
          el.innerHTML = '<h3 style="color: red; background-color: yellow; padding: 20px; margin: 20px; border: 3px solid black;">NO NOTES FOUND (Empty Rows Array)</h3>';
          
          // Log to console for debugging
          Logger.debug('Created simple empty state message for empty rows array');
          return;
        }
        
        // Final catch-all check for any other type of empty result
        // This checks if the result.value is an object with no meaningful properties
        // or if it's an object with only empty arrays as properties
        if (typeof result.value === 'object' && result.value !== null && !Array.isArray(result.value)) {
          const keys = Object.keys(result.value).filter(key => 
            key !== 'successful' && 
            key !== 'error' && 
            key !== 'type' && 
            key !== 'headers'
          );
          
          // If there are no meaningful keys, or all values are empty arrays, consider it empty
          const isEmpty = keys.length === 0 || keys.every(key => {
            const value = result.value[key];
            return Array.isArray(value) && value.length === 0;
          });
          
          if (isEmpty) {
            Logger.debug('Dataview returned empty result (catch-all) - using super simple approach');
            Logger.debug('Empty result detected (catch-all), using simple approach');
            
            // Create a very simple message with no styling
            el.innerHTML = '<h3 style="color: red; background-color: yellow; padding: 20px; margin: 20px; border: 3px solid black;">NO NOTES FOUND (Empty Result)</h3>';
            
            // Log to console for debugging
            Logger.debug('Created simple empty state message for empty result (catch-all)');
            return;
          }
        }

        // Check if result.value is the actual data or if it's wrapped in a structure
        let dataToRender = result.value;
        
        // If the result is the response object itself, extract the actual data
        if (dataToRender && typeof dataToRender === 'object' && 'successful' in dataToRender && 'value' in dataToRender) {
          Logger.debug('Unwrapping nested result structure');
          dataToRender = dataToRender.value;
        }
        
        // Check if this specific card has a dynamic update setting
        if (settings.dynamicUpdate !== undefined) {
          Logger.debug(`Card has dynamicUpdate setting: ${settings.dynamicUpdate}`);
        }
        
        // Check if the result is empty in a way that would result in no cards being rendered
        let isEmpty = false;
        
        // Special check for the specific format we're seeing in the console logs
        Logger.debug('SPECIAL CHECK - dataToRender:', dataToRender);
        if (dataToRender && typeof dataToRender === 'object' && Object.keys(dataToRender).length === 2) {
          Logger.debug('Found object with exactly 2 keys');
          isEmpty = true;
        }
        // Check if it's an empty array
        else if (Array.isArray(dataToRender) && dataToRender.length === 0) {
          isEmpty = true;
        }
        // Check if it's an object with a values array that's empty
        else if (dataToRender && typeof dataToRender === 'object' && 'values' in dataToRender && 
                 Array.isArray(dataToRender.values) && dataToRender.values.length === 0) {
          isEmpty = true;
        }
        // Check if it's an object with a data array that's empty
        else if (dataToRender && typeof dataToRender === 'object' && 'data' in dataToRender && 
                 Array.isArray(dataToRender.data) && dataToRender.data.length === 0) {
          isEmpty = true;
        }
        // Check if it's an object with a rows array that's empty
        else if (dataToRender && typeof dataToRender === 'object' && 'rows' in dataToRender && 
                 Array.isArray(dataToRender.rows) && dataToRender.rows.length === 0) {
          isEmpty = true;
        }
        // Check if it's an object with no meaningful properties or only empty arrays
        else if (dataToRender && typeof dataToRender === 'object' && !Array.isArray(dataToRender)) {
          const keys = Object.keys(dataToRender).filter(key => 
            key !== 'successful' && 
            key !== 'error' && 
            key !== 'type' && 
            key !== 'headers'
          );
          
          isEmpty = keys.length === 0 || keys.every(key => {
            const value = dataToRender[key];
            return Array.isArray(value) && value.length === 0;
          });
        }
        
        // If empty, use the renderEmptyState method
        if (isEmpty) {
          Logger.debug('Empty result detected, using renderEmptyState');
          this.rendererService.renderEmptyState(el, 'No notes found');
          return;
        }
        
        // If not empty, render the cards with the extracted data
        this.rendererService.renderCards(el, dataToRender, settings);
      } catch (queryError) {
        // Handle query execution errors
        Logger.error('Error executing Dataview query:', queryError);
        
        // Make sure to remove the temporary container if there was an error
        if (document.body.contains(dataviewContainer)) {
          document.body.removeChild(dataviewContainer);
        }
        
        el.createEl('div', {
          cls: 'datacards-error',
          text: `Error executing Dataview query: ${queryError.message || String(queryError)}`
        });
      }
    } catch (error) {
      // Handle any other errors
      Logger.error('DataCards error:', error);
      el.createEl('div', {
        cls: 'datacards-error',
        text: `Error processing DataCards block: ${error.message || String(error)}`
      });
    }
  }

  /**
   * Refresh all datacards blocks in the current view
   * 
   * @param showNotification Whether to show a notification after refreshing
   */
  private refreshAllDataCards(showNotification: boolean = true) {
    // Prevent multiple refreshes from happening at the same time
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      // This triggers a re-render of the view, which will re-process all code blocks
      activeView.previewMode.rerender(true);
      
      // Show a notification to confirm the refresh if requested
      if (showNotification) {
        new Notice('DataCards refreshed', 2000); // Show for 2 seconds
      }
      
      // Restore focus to the previously active element if it exists
      setTimeout(() => {
        if (this.lastActiveElement && document.body.contains(this.lastActiveElement)) {
          // Try to restore focus
          (this.lastActiveElement as HTMLElement).focus();
        }
        
        // Reset the refreshing flag
        this.isRefreshing = false;
      }, 50); // Small delay to allow the DOM to update
    } else {
      if (showNotification) {
        new Notice('No active markdown view to refresh', 2000);
      }
      this.isRefreshing = false;
    }
  }
}
