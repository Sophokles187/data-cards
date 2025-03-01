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

export default class DataCardsPlugin extends Plugin {
  settings: DataCardsSettings;
  private parserService: ParserService;
  private rendererService: RendererService;
  private dataviewApiUtil: DataviewApiUtil;

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
        this.refreshAllDataCards();
      }
    });

    Logger.debug('DataCards plugin loaded');
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
    this.refreshAllDataCards();
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
          Logger.debug('Dataview returned empty array');
          el.createEl('div', {
            cls: 'datacards-info',
            text: 'No files match your query criteria.'
          });
          return;
        }

        if (result.value.values && Array.isArray(result.value.values) && result.value.values.length === 0) {
          Logger.debug('Dataview returned empty table');
          el.createEl('div', {
            cls: 'datacards-info',
            text: 'No files match your query criteria.'
          });
          return;
        }

        // Check if result.value is the actual data or if it's wrapped in a structure
        let dataToRender = result.value;
        
        // If the result is the response object itself, extract the actual data
        if (dataToRender && typeof dataToRender === 'object' && 'successful' in dataToRender && 'value' in dataToRender) {
          Logger.debug('Unwrapping nested result structure');
          dataToRender = dataToRender.value;
        }
        
        // Render the cards with the extracted data
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
   */
  private refreshAllDataCards() {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      // This triggers a re-render of the view, which will re-process all code blocks
      activeView.previewMode.rerender(true);
      
      // Show a notification to confirm the refresh
      new Notice('DataCards refreshed', 3000); // Show for 3 seconds
    } else {
      new Notice('No active markdown view to refresh', 3000);
    }
  }
}
