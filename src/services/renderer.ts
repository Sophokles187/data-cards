import { App, TFile, Platform, MarkdownRenderer, Component, requestUrl } from 'obsidian'; // Added Component and requestUrl
import { DataCardsSettings, BlockSettings } from '../models/settings';
import { DEFAULT_SETTINGS } from '../models/settings';
import { Logger } from '../utils/logger';

/**
 * Service for rendering Dataview results as cards
 */
export class RendererService {
  private app: App;
  // Store the current settings for use in formatting methods
  private currentSettings: DataCardsSettings | null = null;
  private pluginSettings: DataCardsSettings;

  constructor(app: App, pluginSettings: DataCardsSettings) {
    this.app = app;
    this.pluginSettings = pluginSettings;
  }

  /**
   * Update the plugin settings reference
   *
   * @param settings The updated plugin settings
   */
  public updateSettings(settings: DataCardsSettings): void {
     this.pluginSettings = settings;
  }
  /**
   * Check if the current device is mobile or if mobile mode is forced
   *
   * @returns True if the device is mobile or if mobile mode is forced, false otherwise
   */
  private isMobileDevice(): boolean {
    // Return true if the device is actually mobile OR if force mobile mode is enabled
    return Platform.isMobile || this.pluginSettings.forceMobileMode;
  }

  /**
   * Render Dataview query results as cards
   *
   * @param container The container element to render into
   * @param results The Dataview query results
   * @param blockSettings The settings for this specific block
   * @param component The parent component for lifecycle management
   */
  public renderCards(container: HTMLElement, results: any, blockSettings: BlockSettings, component: Component): void { // Added component parameter
    // SPECIAL CHECK: Log the exact structure of the results
    Logger.debug('SPECIAL CHECK - renderCards called with results:', results);

    // IMMEDIATE DEBUG - Check if this is GROUP BY
    console.log('=== IMMEDIATE DEBUG START ===');
    console.log('Results type:', typeof results);
    console.log('Results is array:', Array.isArray(results));
    console.log('Results keys:', Object.keys(results || {}));
    console.log('Results:', results);
    console.log('=== IMMEDIATE DEBUG END ===');

    // Check if the results are empty
    let isEmpty = false;

    // Check for table-like results with empty values array
    if (results && results.values && Array.isArray(results.values) && results.values.length === 0) {
      Logger.debug('Empty table detected in renderCards');
      isEmpty = true;
    }
    // Check for empty array results
    else if (Array.isArray(results) && results.length === 0) {
      Logger.debug('Empty array detected in renderCards');
      isEmpty = true;
    }
    // Check for object with exactly 2 keys (special case from console logs)
    else if (results && typeof results === 'object' && !Array.isArray(results) && Object.keys(results).length === 2) {
      Logger.debug('Object with exactly 2 keys detected in renderCards:', Object.keys(results));
      isEmpty = true;
    }

      // If empty, render empty state and return
      if (isEmpty) {
        Logger.debug('Rendering empty state from renderCards');
        this.renderEmptyState(container, 'No notes found');
        return;
      }
    // Check if we're on mobile
    const isMobile = this.isMobileDevice();
    Logger.debug('Is mobile device:', isMobile);

    // Start with plugin settings
    let settings = { ...this.pluginSettings };
    Logger.debug('Initial settings from plugin:', {
      preset: settings.preset,
      imageHeight: settings.imageHeight,
      mobileColumns: settings.mobileColumns,
      mobilePreset: settings.mobilePreset,
      mobileImageHeight: settings.mobileImageHeight
    });

    // Apply block settings
    settings = { ...settings, ...blockSettings };
    Logger.debug('After applying block settings:', {
      preset: settings.preset,
      imageHeight: settings.imageHeight,
      mobileColumns: settings.mobileColumns,
      mobilePreset: settings.mobilePreset,
      mobileImageHeight: settings.mobileImageHeight
    });

    // If on mobile, apply mobile settings (overriding previous settings)
    if (isMobile) {
      Logger.debug('Applying mobile settings...');

      // Mobile devices use mobileColumns setting (defaults to 1)
      Logger.debug(`Using mobile columns: ${settings.mobileColumns}`);

      // Apply mobile preset
      if (settings.mobilePreset !== undefined) {
        Logger.debug(`Overriding preset: ${settings.preset} with mobilePreset: ${settings.mobilePreset}`);
        settings.preset = settings.mobilePreset;
      }

      // Apply mobile image height
      if (settings.mobileImageHeight !== undefined) {
        Logger.debug(`Overriding imageHeight: ${settings.imageHeight} with mobileImageHeight: ${settings.mobileImageHeight}`);
        settings.imageHeight = settings.mobileImageHeight;
      }

      Logger.debug('Final settings after applying mobile settings:', {
        preset: settings.preset,
        imageHeight: settings.imageHeight
      });
    }

    // Store the current settings for use in formatting methods
    this.currentSettings = settings;

    // Create the cards container
    const cardsContainer = container.createEl('div', {
      cls: 'datacards-container',
      attr: {
        'data-datacards-container': 'true' // Add a data attribute for easier selection
      }
    });

    // Add refresh button if enabled
    if (settings.showRefreshButton) {
      this.addRefreshButton(cardsContainer);
    }

    // Add preset class first
    cardsContainer.addClass(`datacards-preset-${settings.preset}`);

    // Add no-shadows class if shadows are disabled
    if (!settings.enableShadows) {
      cardsContainer.addClass('datacards-no-shadows');
    }

    // Add truncate text class if enabled
    if (settings.truncateText) {
      cardsContainer.addClass('datacards-truncate-text');
    }

    // Apply font size class if specified
    if (settings.fontSize && settings.fontSize !== 'default') {
      cardsContainer.addClass(`datacards-font-${settings.fontSize}`);
      Logger.debug(`Applied font size class: datacards-font-${settings.fontSize}`);
    } else if (settings.preset === 'dense' && (!settings.fontSize || settings.fontSize === 'default')) {
      // For dense preset, automatically use small font size if not explicitly overridden
      cardsContainer.addClass('datacards-font-small');
      Logger.debug('Applied small font size for dense preset');
    }

    // Set card spacing via data attribute
    // This allows the preset class to control preset-specific variables
    cardsContainer.setAttribute('data-card-gap', `${settings.cardSpacing}`);
    // CSS will handle setting the variables based on the data attribute

    // Determine column layout strategy based on settings hierarchy
    // Priority: per-block columns setting > per-block dynamicColumns > global dynamicColumns
    let useDynamicColumns = false;

    if (isMobile) {
      // On mobile, always use fixed columns for performance
      useDynamicColumns = false;
      Logger.debug('Mobile device detected, forcing fixed columns');
    } else {
      // Check if per-block columns setting is explicitly set
      const hasExplicitColumns = blockSettings.columns !== undefined;

      // Check if per-block dynamicColumns setting is explicitly set
      const hasExplicitDynamicColumns = blockSettings.dynamicColumns !== undefined;

      if (hasExplicitColumns) {
        // Per-block columns setting takes highest priority - always use fixed columns
        useDynamicColumns = false;
        Logger.debug('Per-block columns setting detected, using fixed columns');
      } else if (hasExplicitDynamicColumns) {
        // Per-block dynamicColumns setting overrides global setting
        useDynamicColumns = blockSettings.dynamicColumns!;
        Logger.debug(`Per-block dynamicColumns setting detected: ${useDynamicColumns}`);
      } else {
        // No explicit per-block column settings, use global dynamicColumns setting
        useDynamicColumns = this.pluginSettings.dynamicColumns;
        Logger.debug(`Using global dynamicColumns setting: ${useDynamicColumns}`);
      }
    }

    if (useDynamicColumns) {
      Logger.debug('Using dynamic columns layout');

      // Add dynamic columns class
      cardsContainer.addClass('datacards-dynamic-columns');

      // Set minimum card width
      const minCardWidth = settings.minCardWidth || '250px';

      // Ensure minCardWidth has a unit (px) if it's a number or numeric string
      let normalizedMinWidth = minCardWidth;
      if (typeof normalizedMinWidth === 'number' || /^\d+$/.test(normalizedMinWidth)) {
        normalizedMinWidth = `${normalizedMinWidth}px`;
      }

      // Set minimum card width via data attribute and CSS custom property
      cardsContainer.setAttribute('data-min-card-width', normalizedMinWidth);

      // Set the CSS custom property directly for any width value
      cardsContainer.style.setProperty('--min-card-width', normalizedMinWidth);

      // Also add predefined class if it exists (for common values)
      const widthValue = normalizedMinWidth.replace('px', '');
      const commonWidths = ['200', '220', '250', '280', '300', '320', '350', '400'];
      if (commonWidths.includes(widthValue)) {
        cardsContainer.addClass(`datacards-min-width-${widthValue}`);
      }

      Logger.debug(`Using dynamic columns with min card width: ${normalizedMinWidth}`);
    } else {
      // Use fixed columns
      let columnsToUse: number;

      if (isMobile) {
        // On mobile, use mobileColumns setting
        columnsToUse = settings.mobileColumns;
      } else {
        // On desktop, follow hierarchy: preset → plugin settings → code block settings
        let recommendedColumns = 3; // Default for grid

        if (settings.preset === 'dense') {
          recommendedColumns = 6;
        } else if (settings.preset === 'compact') {
          recommendedColumns = 4;
        } else if (settings.preset === 'square') {
          recommendedColumns = 4;
        } else if (settings.preset === 'portrait') {
          recommendedColumns = 3;
        }

        // Use the final merged settings (which includes code block overrides)
        // The settings object already contains the hierarchy: preset → plugin → code block
        columnsToUse = (settings as any).columns !== undefined ? (settings as any).columns : recommendedColumns;
      }

      Logger.debug(`Using ${columnsToUse} fixed columns`);

      // Set columns via data attribute and CSS custom property
      cardsContainer.setAttribute('data-columns', columnsToUse.toString());

      // Set the CSS custom property for any number of columns
      cardsContainer.style.setProperty('--card-columns', columnsToUse.toString());

      // Also add predefined class if it exists (for columns 1-6)
      if (columnsToUse >= 1 && columnsToUse <= 6) {
        cardsContainer.addClass(`datacards-columns-${columnsToUse}`);
      }
    }

    // Set image height and fit based on preset if not explicitly provided

    // For image height - follow hierarchy: preset → plugin settings → code block settings
    let imageHeight: string;

    // First, get preset-specific default height
    if (settings.preset === 'portrait') {
      imageHeight = '350px';
    } else if (settings.preset === 'square') {
      imageHeight = '200px';
    } else if (settings.preset === 'compact') {
      imageHeight = '200px';
    } else if (settings.preset === 'dense') {
      imageHeight = '120px';
    } else {
      // Default for grid
      imageHeight = '200px';
    }

    // Then override with the final merged settings (which includes plugin + code block settings)
    // The settings object already contains the hierarchy: preset → plugin → code block
    if (settings.imageHeight !== undefined) {
      imageHeight = settings.imageHeight;
    }

    // Ensure imageHeight has a unit (px) if it's a number or numeric string
    if (typeof imageHeight === 'number' || /^\d+$/.test(imageHeight)) {
      imageHeight = `${imageHeight}px`;
    }

    // Set image height via data attribute
    cardsContainer.setAttribute('data-image-height', imageHeight);
    // Add a class for the image height
    cardsContainer.addClass(`datacards-image-height-${imageHeight.replace('px', '')}`);

    // For image fit - follow hierarchy: preset → plugin settings → code block settings
    let imageFit: string;

    // First, get preset-specific default fit
    imageFit = settings.preset === 'portrait' ? 'contain' : 'cover';

    // Then override with the final merged settings (which includes plugin + code block settings)
    // The settings object already contains the hierarchy: preset → plugin → code block
    if (settings.imageFit !== undefined) {
      imageFit = settings.imageFit;
    }

    // Set image fit via data attribute and class
    cardsContainer.setAttribute('data-image-fit', imageFit);
    cardsContainer.addClass(`datacards-image-fit-${imageFit}`);

    // Handle different types of Dataview results
    // First check for GROUP BY results (which have a specific structure)
    console.log('STRUCTURE DEBUG - Results type:', typeof results);
    console.log('STRUCTURE DEBUG - Results keys:', Object.keys(results || {}));
    console.log('STRUCTURE DEBUG - Results.values type:', typeof results?.values);
    console.log('STRUCTURE DEBUG - Results.values is array:', Array.isArray(results?.values));
    console.log('STRUCTURE DEBUG - First few results.values items:', results?.values?.slice(0, 2));
    console.log('STRUCTURE DEBUG - Full results object:', JSON.stringify(results, null, 2));

    if (this.isGroupByResults(results)) {
      Logger.debug('Detected GROUP BY results');

      // Check if kanban preset is enabled
      if (settings.preset === 'kanban') {
        Logger.debug('Rendering GROUP BY results as kanban');

        // Handle different GROUP BY result types
        if (results.idMeaning) {
          // TABLE + GROUP BY - aggregated data, limited support
          this.renderDataviewTableGroupByKanban(cardsContainer, results, settings, component);
        } else if (results.primaryMeaning) {
          // LIST + GROUP BY - need to re-query for individual notes
          this.renderDataviewListGroupByKanban(cardsContainer, results, settings, component);
        } else {
          // Legacy GROUP BY structure - fallback to table rendering
          const groupByData = Array.isArray(results) ? results : results.values;
          this.renderGroupedResults(cardsContainer, groupByData, settings, component);
        }
      } else {
        Logger.debug('Rendering GROUP BY results as grouped cards');
        // Extract the actual GROUP BY data (might be nested in values)
        const groupByData = Array.isArray(results) ? results : results.values;
        this.renderGroupedResults(cardsContainer, groupByData, settings, component);
      }
    } else if (results && results.values && Array.isArray(results.values)) {
      Logger.debug('Detected table-like results with values array');

      // Check if kanban preset is enabled for regular queries (not GROUP BY)
      if (settings.preset === 'kanban' && results.headers && Array.isArray(results.headers)) {
        Logger.debug('Rendering regular query results as kanban (programmatic grouping)');
        this.renderProgrammaticKanban(cardsContainer, results, settings, component);
      } else if (results.headers && Array.isArray(results.headers)) {
        // Handle table-like results (most common)
        this.renderTableResults(cardsContainer, results, settings, component); // Pass component
      } else {
        Logger.debug('Table results missing headers, treating as array results');
        this.renderArrayResults(cardsContainer, results.values, settings, component);
      }
    } else if (results && Array.isArray(results)) {
      Logger.debug('Detected array results');
      // Handle array results
      this.renderArrayResults(cardsContainer, results, settings, component); // Pass component
    } else if (results && typeof results === 'object') {
      Logger.debug('Detected object results');
      // Handle object results
      this.renderObjectResults(cardsContainer, results, settings, component); // Pass component
    } else {
      Logger.debug('No valid results detected');
      // Handle error or empty results
      this.renderError(cardsContainer, 'No results or unsupported result type');
    }
  }

  /**
   * Render an error message
   *
   * @param container The container element
   * @param message The error message
   */
  private renderError(container: HTMLElement, message: string): void {
    container.createEl('div', {
      cls: 'datacards-error',
      text: message,
    });
  }

  /**
   * Add a refresh button to the DataCards container
   *
   * @param container The DataCards container element
   */
  private addRefreshButton(container: HTMLElement): void {
    const refreshButton = container.createEl('button', {
      cls: 'datacards-refresh-button',
      attr: {
        'aria-label': 'Refresh DataCards'
      }
    });

    // Add the refresh icon (using Unicode symbol)
    refreshButton.createEl('span', {
      cls: 'datacards-refresh-icon',
      text: '↻'
    });

    // Add click handler
    refreshButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      // Add visual feedback
      refreshButton.addClass('datacards-refresh-active');

      // Trigger refresh
      this.triggerRefresh();

      // Remove visual feedback after a short delay
      setTimeout(() => {
        refreshButton.removeClass('datacards-refresh-active');
      }, 300);
    });
  }

  /**
   * Trigger a refresh of DataCards in the current view
   */
  private triggerRefresh(): void {
    // Get the DataCards plugin instance and trigger refresh
    // We need to access the plugin through the app
    const plugin = (this.app as any).plugins?.plugins?.['data-cards'];
    if (plugin && typeof plugin.refreshActiveView === 'function') {
      plugin.refreshActiveView(false); // false = don't show notification for button clicks
    } else {
      // Fallback: dispatch a custom event that the plugin can listen to
      window.dispatchEvent(new CustomEvent('datacards-refresh-requested'));
    }
  }

  /**
   * Render an empty state message when no results are found
   *
   * @param container The container element
   * @param message The message to display
   */
  public renderEmptyState(container: HTMLElement, message: string = "No notes found"): void {
    Logger.debug('renderEmptyState called with message:', message);

    // Create the cards container to maintain consistent styling
    const cardsContainer = container.createEl('div', {
      cls: 'datacards-container',
      attr: {
        'data-datacards-container': 'true' // Add a data attribute for easier selection
      }
    });

    // Add refresh button to empty state as well if enabled
    if (this.pluginSettings.showRefreshButton) {
      this.addRefreshButton(cardsContainer);
    }

    Logger.debug('Created cards container for empty state');

    // Add the empty state message with appropriate styling
    cardsContainer.createEl('div', {
      cls: 'datacards-empty-state',
      text: message,
    });

    Logger.debug('Added empty state element with class:', 'datacards-empty-state');
  }

  /**
   * Render table-like Dataview results
   *
   * @param container The container element
   * @param results The Dataview table results
   * @param settings The merged settings
   * @param component The parent component for lifecycle management
   */
  private renderTableResults(container: HTMLElement, results: any, settings: DataCardsSettings, component: Component): void { // Added component parameter
    const { values, headers } = results;

    // Enhanced debug logging for table structure
    Logger.debug('Rendering table results:');
    Logger.debug('- Headers:', headers);
    Logger.debug('- Number of rows:', values.length);

    // Create a card for each row
    values.forEach((row: any[] & { file?: any; path?: any; source?: any; originalFile?: any }, rowIndex: number) => {
      Logger.debug(`Processing row ${rowIndex}`);

      const card = this.createCardElement(container);

      // Add image if available
      if (settings.imageProperty && row[headers.indexOf(settings.imageProperty)] !== undefined) {
        this.addImageToCard(card, row[headers.indexOf(settings.imageProperty)]);
      }

      // Add content container
      const contentEl = card.createEl('div', { cls: 'datacards-content' });

      // Try to get the file property from different sources
      let fileValue: any = null;

      // First check if file is explicitly included in headers
      if (headers.includes('File') || headers.includes('file')) {
        const fileIndex = headers.findIndex((h: string) => h.toLowerCase() === 'file');
        if (fileIndex >= 0) {
          fileValue = row[fileIndex];
        }
      }

      // If file is not in headers, try to get it from the row's metadata
      if (!fileValue && row.file) {
        fileValue = row.file;
      }

      // If still no file value, try to get it from the row's path property
      if (!fileValue && row.path) {
        fileValue = row.path;
      }

      // If still no file value, try to get it from the row's source property
      if (!fileValue && row.source) {
        fileValue = row.source;
      }

      // If still no file value, try to get it from the original file
      if (!fileValue && row.originalFile) {
        fileValue = row.originalFile;
      }

      // If we found a file value and showFileAsTitle is enabled, add it to the card
      if (fileValue && settings.showFileAsTitle) {
        const filePropertyEl = contentEl.createEl('div', {
          cls: 'datacards-property datacards-file-property-container',
        });

        this.formatFileProperty(filePropertyEl, fileValue);

        // If clickable cards are enabled, make the card clickable
        if (settings.enableClickableCards) {
          this.makeCardClickable(card, fileValue);
        }
      } else if (fileValue && settings.enableClickableCards) {
        // If we have a file value but don't want to show it as title,
        // still make the card clickable if enabled
        this.makeCardClickable(card, fileValue);
      }

      // Create a properties container
      const propertiesContainer = contentEl.createEl('div', {
        cls: 'datacards-properties-container',
      });

      // Determine if properties should be scrollable
      const shouldScroll = this.shouldUseScrollableProperties(settings);

      // Apply scrollable class and height if needed
      if (shouldScroll) {
        propertiesContainer.addClass('datacards-scrollable-properties');

        // Set content height via data attribute
        const contentHeight = this.getContentHeight(settings);
        propertiesContainer.setAttribute('data-content-height', contentHeight);
        propertiesContainer.addClass(`datacards-content-height-${contentHeight.replace('px', '')}`);
      }

      // Add properties
      let propertiesToShow: string[] = [];

      if (settings.properties === 'all') {
        propertiesToShow = [...headers];
        Logger.debug('Using all headers as properties:', propertiesToShow);
      } else if (Array.isArray(settings.properties)) {
        propertiesToShow = [...settings.properties];
        Logger.debug('Using specified properties:', propertiesToShow);
      } else {
        Logger.debug('No properties specified, using empty array');
      }

      // Filter out excluded properties and the file property (we already added it)
      let filteredProperties = propertiesToShow.filter((prop: string) =>
        !settings.exclude.includes(prop) &&
        prop !== settings.imageProperty &&
        prop.toLowerCase() !== 'file' // Exclude file property here, we already added it separately
      );

      Logger.debug('Filtered properties (after excluding file):', filteredProperties);

      // Add each property to the properties container
      filteredProperties.forEach((property: string) => {
        Logger.debug(`Checking property '${property}' in headers:`, headers.includes(property));
        if (headers.includes(property)) {
          const propIndex = headers.indexOf(property);
          const propValue = row[propIndex];

          // Log the property value for debugging
          Logger.debug(`Property '${property}' value:`, propValue);
          Logger.debug(`Property '${property}' type:`, typeof propValue);

      // Use the standard property formatting, passing the component
      this.addPropertyToCard(propertiesContainer, property, propValue, settings, component); // Pass component

        } else {
          Logger.debug(`Property '${property}' not found in headers`);
        }
      });

      // If no properties were added, add a debug message
      if (filteredProperties.length === 0 && !headers.some((h: string) => h.toLowerCase() === 'file')) {
        Logger.debug('No properties were added to the card');
        contentEl.createEl('div', {
          cls: 'datacards-property',
          text: 'No properties to display'
        });
      }
    });
  }

  /**
   * Render array Dataview results
   *
   * @param container The container element
   * @param results The Dataview array results
   * @param settings The merged settings
   * @param component The parent component for lifecycle management
   */
  private renderArrayResults(container: HTMLElement, results: any[], settings: DataCardsSettings, component: Component): void { // Added component parameter
    // Create a card for each item in the array
    results.forEach((item: any) => {
      const card = this.createCardElement(container);

      // Add image if available
      if (settings.imageProperty && item[settings.imageProperty]) {
        this.addImageToCard(card, item[settings.imageProperty]);
      }

      // Add content container
      const contentEl = card.createEl('div', { cls: 'datacards-content' });

      // Try to get the file property from different sources
      let fileValue: any = null;

      // First check if file is explicitly included
      if ('file' in item) {
        fileValue = item.file;
      }

      // If file is not found, try to get it from the path property
      if (!fileValue && 'path' in item) {
        fileValue = item.path;
      }

      // If we found a file value, add it to the card
      if (fileValue) {
        const filePropertyEl = contentEl.createEl('div', {
          cls: 'datacards-property datacards-file-property-container',
        });

        this.formatFileProperty(filePropertyEl, fileValue);

        // If clickable cards are enabled, make the card clickable
        if (settings.enableClickableCards) {
          this.makeCardClickable(card, fileValue);
        }
      }

      // Create a properties container
      const propertiesContainer = contentEl.createEl('div', {
        cls: 'datacards-properties-container',
      });

      // Determine if properties should be scrollable
      const shouldScroll = this.shouldUseScrollableProperties(settings);

      // Apply scrollable class and height if needed
      if (shouldScroll) {
        propertiesContainer.addClass('datacards-scrollable-properties');

        // Set content height via data attribute
        const contentHeight = this.getContentHeight(settings);
        propertiesContainer.setAttribute('data-content-height', contentHeight);
        propertiesContainer.addClass(`datacards-content-height-${contentHeight.replace('px', '')}`);
      }

      // Determine which properties to show
      const allProperties = Object.keys(item);
      const propertiesToShow = settings.properties === 'all'
        ? allProperties
        : Array.isArray(settings.properties) ? settings.properties : [];

      // Filter out excluded properties and the file property
      const filteredProperties = propertiesToShow.filter((prop: string) =>
        !settings.exclude.includes(prop) &&
        prop !== settings.imageProperty &&
        prop.toLowerCase() !== 'file'
      );

      // Add each property to the properties container
      filteredProperties.forEach((property: string) => {
        if (property in item) {
          this.addPropertyToCard(propertiesContainer, property, item[property], settings, component); // Pass component
        }
      });
    });
  }

  /**
   * Render object Dataview results
   *
   * @param container The container element
   * @param results The Dataview object results
   * @param settings The merged settings
   * @param component The parent component for lifecycle management
   */
  private renderObjectResults(container: HTMLElement, results: any, settings: DataCardsSettings, component: Component): void { // Added component parameter
    // Create a single card for the object
    const card = this.createCardElement(container);

    // Add image if available
    if (settings.imageProperty && results[settings.imageProperty]) {
      this.addImageToCard(card, results[settings.imageProperty]);
    }

      // Add content container
      const contentEl = card.createEl('div', { cls: 'datacards-content' });

      // First, add the file property separately if it exists
      if ('file' in results) {
        const filePropertyEl = contentEl.createEl('div', {
          cls: 'datacards-property datacards-file-property-container',
        });

        this.formatFileProperty(filePropertyEl, results['file']);

        // If clickable cards are enabled, make the card clickable
        if (settings.enableClickableCards) {
          this.makeCardClickable(card, results['file']);
        }
      }

      // Create a properties container
      const propertiesContainer = contentEl.createEl('div', {
        cls: 'datacards-properties-container',
      });

      // Determine if properties should be scrollable
      const shouldScroll = this.shouldUseScrollableProperties(settings);

      // Apply scrollable class and height if needed
      if (shouldScroll) {
        propertiesContainer.addClass('datacards-scrollable-properties');

        // Set content height via data attribute
        const contentHeight = this.getContentHeight(settings);
        propertiesContainer.setAttribute('data-content-height', contentHeight);
        propertiesContainer.addClass(`datacards-content-height-${contentHeight.replace('px', '')}`);
      }

      // Determine which properties to show
      const allProperties = Object.keys(results);
      const propertiesToShow = settings.properties === 'all'
        ? allProperties
        : Array.isArray(settings.properties) ? settings.properties : [];

      // Filter out excluded properties and the file property
      const filteredProperties = propertiesToShow.filter((prop: string) =>
        !settings.exclude.includes(prop) &&
        prop !== settings.imageProperty &&
        prop.toLowerCase() !== 'file'
      );

      // Add each property to the properties container
      filteredProperties.forEach((property: string) => {
        if (property in results) {
          this.addPropertyToCard(propertiesContainer, property, results[property], settings, component); // Pass component
        }
      });
  }

  /**
   * Create a card element
   *
   * @param container The container to add the card to
   * @returns The created card element
   */
  private createCardElement(container: HTMLElement): HTMLElement {
    const card = container.createEl('div', {
      cls: 'datacards-card',
    });

    // If clickable cards are enabled, add a class to indicate it
    if (this.currentSettings?.enableClickableCards) {
      card.addClass('datacards-clickable-card');
    }

    return card;
  }

  /**
   * Make a card clickable to open the note
   *
   * @param card The card element
   * @param fileValue The file value (path, link object, etc.)
   */
  private makeCardClickable(card: HTMLElement, fileValue: any): void {
    if (!fileValue) return;

    // Extract the path from the file value (similar to formatFileProperty)
    let path: string;

    if (typeof fileValue === 'object' && fileValue !== null) {
      if ('path' in fileValue) {
        path = fileValue.path;
      } else if ('link' in fileValue) {
        path = fileValue.link;
      } else {
        path = String(fileValue);
      }
    } else {
      path = String(fileValue);
    }

    // Extract path from wiki links if needed
    if (path.includes('[[') && path.includes(']]')) {
      const wikiLinkMatch = path.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
      if (wikiLinkMatch) {
        path = wikiLinkMatch[1];
      } else {
        path = path.substring(2, path.length - 2).split('|')[0];
      }
    }

    // Make the card itself clickable instead of wrapping it
    card.addClass('datacards-clickable-card');

    // Add a click event listener to handle navigation to the note
    card.addEventListener('click', (event) => {
      // Prevent triggering this event when clicking on inner links (like the title)
      if ((event.target as HTMLElement).closest('.internal-link')) {
        return;
      }

      // Open the note
      this.app.workspace.openLinkText(path, '', false, { active: true });

      // Prevent event bubbling
      event.stopPropagation();
    });

  }

  /**
   * Add an image to a card
   *
   * @param card The card element
   * @param imageValue The image value (path, URL, Link object, or array of images)
   */
  private addImageToCard(card: HTMLElement, imageValue: any): void {
    const imageContainer = card.createEl('div', {
      cls: 'datacards-image-container',
    });

    // Handle arrays by taking the first image
    if (Array.isArray(imageValue)) {
      Logger.debug('Image value is an array, taking first image:', imageValue);
      if (imageValue.length > 0) {
        imageValue = imageValue[0];
        Logger.debug('Using first image from array:', imageValue);
      } else {
        Logger.debug('Image array is empty');
        imageContainer.createEl('div', {
          cls: 'datacards-image-placeholder',
          text: 'No images available',
        });
        return;
      }
    }

    // Handle Dataview Link objects
    let imagePath: string;

    if (typeof imageValue === 'object' && imageValue !== null) {
      Logger.debug('Image value is an object:', imageValue);

      // Handle Dataview Link objects which have a path property
      if ('path' in imageValue) {
        imagePath = imageValue.path;
        Logger.debug('Extracted path from Link object:', imagePath);
      } else {
        // If it's some other object, convert to string
        imagePath = String(imageValue);
        Logger.debug('Converted object to string:', imagePath);
      }
    } else {
      // It's already a string
      imagePath = String(imageValue);
      Logger.debug('Image value is a string:', imagePath);
    }

    // Check if the string contains a wiki link or URL and extract it
    // This helps with expressions that result in strings containing wiki links or URLs
    imagePath = this.extractImageSource(imagePath);
    Logger.debug('After image source extraction:', imagePath);

    // Create placeholder first
    const placeholder = imageContainer.createEl('div', {
      cls: 'datacards-image-placeholder',
      text: 'Loading image...',
    });

    // Check if lazy loading is enabled
    if (this.currentSettings?.enableLazyLoading) {
      this.lazyLoadImage(imageContainer, placeholder, imagePath);
    } else {
      // Handle the Promise but don't await it since this method is not async
      this.loadImage(imageContainer, placeholder, imagePath)
        .catch(error => {
          Logger.debug('Error loading image:', error);
          placeholder.setText('Error loading image');
        });
    }
  }

  /**
   * Extract an image source from a string if present
   * This helps with handling expressions that result in wiki links or URLs
   *
   * @param value The string value that might contain a wiki link or URL
   * @returns The wiki link or URL if found, otherwise the original string
   */
  private extractImageSource(value: string): string {
    if (!value || typeof value !== 'string') {
      return String(value || '');
    }

    // First check for Obsidian embedded wiki links: ![[path|size]]
    const embeddedWikiLinkMatch = value.match(/!\[\[(.*?)(?:\|.*?)?\]\]/);
    if (embeddedWikiLinkMatch) {
      // Return just the path part from the embedded wiki link
      const path = embeddedWikiLinkMatch[1];
      Logger.debug('Extracted path from embedded wiki link:', path);
      return `[[${path}]]`; // Return as regular wiki link for processing
    }

    // Then check for markdown image syntax: ![alt text](url) or ![|size](url)
    // Use a more robust regex that can handle parentheses within the URL
    // This regex handles nested parentheses in URLs by using a non-greedy match
    const markdownImageMatch = value.match(/!\[(.*?)\]\((.*?)\)/);
    if (markdownImageMatch) {
      // Return the URL from the markdown image syntax
      const url = markdownImageMatch[2];
      Logger.debug('Extracted URL from markdown image syntax:', url);

      // Clean the URL - remove any trailing punctuation or quotes
      const cleanUrl = url.replace(/['",.;:]+$/, '');
      return cleanUrl;
    }

    // Check if the string contains a wiki link pattern
    const wikiLinkMatch = value.match(/\[\[(.*?)\]\]/);
    if (wikiLinkMatch) {
      // Return just the wiki link part
      const wikiLink = `[[${wikiLinkMatch[1]}]]`;
      Logger.debug('Extracted wiki link:', wikiLink);
      return wikiLink;
    }

    // Check if the string contains a URL pattern
    // Use a more robust regex for URLs that can handle query parameters and fragments
    // This regex is more permissive to handle various URL formats
    const urlMatch = value.match(/(https?:\/\/[^\s"'<>[\]{}]+)/);
    if (urlMatch) {
      // Return just the URL part
      const url = urlMatch[1];
      Logger.debug('Extracted URL:', url);

      // Clean the URL - remove any trailing punctuation or quotes
      const cleanUrl = url.replace(/['",.;:]+$/, '');
      return cleanUrl;
    }

    return value;
  }

  /**
   * Lazy load an image using Intersection Observer
   *
   * @param imageContainer The container element for the image
   * @param placeholder The placeholder element
   * @param imagePath The path to the image
   */
  private lazyLoadImage(imageContainer: HTMLElement, placeholder: HTMLElement, imagePath: string): void {
    Logger.debug('Lazy loading image:', imagePath);

    // Create the observer
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          Logger.debug('Image container is now visible, loading image:', imagePath);

          // Load the image - handle the Promise but don't await it
          this.loadImage(imageContainer, placeholder, imagePath)
            .catch(error => {
              Logger.debug('Error in lazy loading image:', error);
              placeholder.setText('Error loading image');
            });

          // Stop observing once the loading process has started
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '100px', // Start loading when image is 100px from viewport
      threshold: 0.1 // Trigger when at least 10% of the element is visible
    });

    // Start observing the image container
    observer.observe(imageContainer);
  }

  /**
   * Load an image immediately
   *
   * @param imageContainer The container element for the image
   * @param placeholder The placeholder element
   * @param imagePath The path to the image
   */
  private async loadImage(imageContainer: HTMLElement, placeholder: HTMLElement, imagePath: string): Promise<void> {
    // Check for markdown image syntax: ![alt text](url) or ![|size](url)
    const markdownImageMatch = imagePath.match(/!\[(.*?)\]\((.*?)\)/);
    if (markdownImageMatch) {
      // Extract the URL from the markdown image syntax
      const imageUrl = markdownImageMatch[2];
      Logger.debug('Extracted URL from markdown image syntax:', imageUrl);

      // Use the extracted URL for loading
      await this.loadImage(imageContainer, placeholder, imageUrl);
      return;
    }

    // Handle different image formats
    if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
      Logger.debug('Handling as external URL:', imagePath);

      // Clean the URL - remove any trailing punctuation or quotes that might have been included
      const cleanUrl = imagePath.replace(/['",.;:]+$/, '');
      Logger.debug('Cleaned URL:', cleanUrl);

      // Try to load the image with multiple approaches
      await this.loadExternalImage(imageContainer, placeholder, cleanUrl);
    } else if (imagePath.startsWith('[[') && imagePath.endsWith(']]')) {
      Logger.debug('Handling as wiki link');
      // Wiki link
      const linkText = imagePath.substring(2, imagePath.length - 2);

      // Handle display text if present (format: [[path|displayText]])
      let path = linkText;

      if (linkText.includes('|')) {
        const parts = linkText.split('|');
        path = parts[0];
      }

      // Use Obsidian's resource API to get the correct URL
      try {
        // Get the file from the vault
        const abstractFile = this.app.vault.getAbstractFileByPath(path);
        // Check if it's a TFile using instanceof
        if (abstractFile && abstractFile instanceof TFile) {
          Logger.debug('Found file in vault:', abstractFile);
          // Use the file directly without casting
          const resourcePath = this.app.vault.getResourcePath(abstractFile);
          Logger.debug('Resource path:', resourcePath);

          const img = imageContainer.createEl('img', {
            cls: 'datacards-image',
            attr: { src: resourcePath },
          });

          // Remove placeholder and add loaded class when image loads
          img.onload = () => {
            placeholder.remove();
            img.addClass('loaded');
          };

          // Show placeholder if image fails to load
          img.onerror = () => {
            placeholder.setText('Image not found');
          };
        } else {
          Logger.debug('File not found in vault or not a file:', path);
          // Update placeholder for missing images
          placeholder.setText('Image not found');
        }
       } catch (error) {
         // Use debug level for image loading errors since they're handled gracefully
         Logger.debug('Error loading image:', error);
         // Update placeholder for error
         placeholder.setText('Error loading image');
       }
    } else {
      Logger.debug('Handling as local path');
      // Assume local path in the vault
      try {
        // Get the file from the vault
        const abstractFile = this.app.vault.getAbstractFileByPath(imagePath);
        // Check if it's a TFile using instanceof
        if (abstractFile && abstractFile instanceof TFile) {
          Logger.debug('Found file in vault:', abstractFile);
          // Use the file directly without casting
          const resourcePath = this.app.vault.getResourcePath(abstractFile);
          Logger.debug('Resource path:', resourcePath);

          const img = imageContainer.createEl('img', {
            cls: 'datacards-image',
            attr: { src: resourcePath },
          });

          // Remove placeholder and add loaded class when image loads
          img.onload = () => {
            placeholder.remove();
            img.addClass('loaded');
          };

          // Show placeholder if image fails to load
          img.onerror = () => {
            placeholder.setText('Image not found');
          };
        } else {
          Logger.debug('File not found in vault:', imagePath);
          // Update placeholder for missing images
          placeholder.setText('Image not found');
        }
       } catch (error) {
         // Use debug level for image loading errors since they're handled gracefully
         Logger.debug('Error loading image:', error);
         // Update placeholder for error
         placeholder.setText('Error loading image');
      }
    }
  }

  /**
   * Load an external image with multiple fallback approaches
   *
   * @param imageContainer The container element for the image
   * @param placeholder The placeholder element
   * @param url The URL of the image
   */
  private async loadExternalImage(imageContainer: HTMLElement, placeholder: HTMLElement, url: string): Promise<void> {
    Logger.debug('Loading external image with URL:', url);

    // First attempt: with crossorigin attribute
    const img = imageContainer.createEl('img', {
      cls: 'datacards-image',
      attr: {
        src: url,
        // Add crossorigin attribute to help with CORS issues
        crossorigin: 'anonymous'
      },
    });

    // Remove placeholder and add loaded class when image loads
    img.onload = () => {
      Logger.debug('External image loaded successfully:', url);
      placeholder.remove();
      img.addClass('loaded');
    };

     // Show placeholder if image fails to load
     img.onerror = async () => {
       // Use debug instead of warn for CORS issues since they're expected and handled with fallbacks
       Logger.debug('Failed to load external image with crossorigin attribute:', url);

       // Second attempt: without crossorigin attribute
       Logger.debug('Trying again without crossorigin attribute');
      img.removeAttribute('crossorigin');

      img.onload = () => {
        Logger.debug('External image loaded successfully without crossorigin:', url);
        placeholder.remove();
        img.addClass('loaded');
      };

       img.onerror = async () => {
         // Use debug instead of warn for CORS issues since they're expected and handled with fallbacks
         Logger.debug('Failed to load external image without crossorigin:', url);

         // Third attempt: using requestUrl and base64 encoding
         Logger.debug('Trying with requestUrl and base64 encoding:', url);

         try {
           // Use Obsidian's requestUrl function to fetch the image without CORS issues
           const response = await requestUrl({ url: url });

           // Check if the response is an image
           if (response.arrayBuffer && response.status === 200) {
             // Convert the array buffer to base64
             const base64 = this.arrayBufferToBase64(response.arrayBuffer);

             // Determine the content type from the response headers or use a default
             const contentType = response.headers?.['content-type'] || 'image/png';

             // Create a data URL
             const dataUrl = `data:${contentType};base64,${base64}`;

             // Set the image source to the data URL
             img.src = dataUrl;

             img.onload = () => {
               Logger.debug('External image loaded successfully via requestUrl and base64:', url);
               placeholder.remove();
               img.addClass('loaded');
             };

             img.onerror = () => {
               Logger.debug('Failed to load image with base64 encoding:', url);
               placeholder.setText('Image not found - URL: ' + url);
             };
           } else {
             throw new Error(`Failed to fetch image: ${response.status}`);
           }
         } catch (e) {
           // Log as debug since this is an expected issue with external images
           Logger.debug('All attempts to load image failed:', url, e);
           placeholder.setText('Image not found - URL: ' + url);
         }
       };
     };
  }

  /**
   * Convert an ArrayBuffer to a base64 string
   *
   * @param buffer The ArrayBuffer to convert
   * @returns The base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  }

  /**
   * Add a property to a card
   *
   * @param contentEl The content element to add the property to
   * @param propertyName The name of the property
   * @param propertyValue The value of the property
   * @param settings The settings
   * @param component The parent component for lifecycle management
   */
  private addPropertyToCard(
    contentEl: HTMLElement,
    propertyName: string,
    propertyValue: any,
    settings: DataCardsSettings,
    component: Component, // Added component parameter
    cardData?: any // Optional card data for inline editing
  ): void {
    Logger.debug(`Adding property to card: ${propertyName} = ${propertyValue}`);
    Logger.debug(`Property type: ${typeof propertyValue}`);

    const propertyEl = contentEl.createEl('div', {
      cls: 'datacards-property',
    });

    // Apply text alignment class to the property element
    if (settings.propertiesAlign) {
      propertyEl.addClass(`datacards-text-${settings.propertiesAlign}`);
    }

    // Get display name from column aliases if available
    let displayName = propertyName;

    // Check if we have column aliases and if this property has an alias
    if (settings.columnAliases) {
      const aliasEntry = settings.columnAliases.find((a: { original: string }) => a.original === propertyName);
      if (aliasEntry) {
        displayName = aliasEntry.alias;
        Logger.debug(`Using alias "${displayName}" for property "${propertyName}"`);
      }
    }

    // Add label if enabled
    if (settings.showLabels) {
      const labelEl = propertyEl.createEl('div', {
        cls: 'datacards-property-label',
        text: displayName,
      });

      // Apply text alignment class to the label element
      if (settings.propertiesAlign) {
        labelEl.addClass(`datacards-text-${settings.propertiesAlign}`);
      }
    }

    // Check if this is the file property (special handling for file links)
    if (propertyName.toLowerCase() === 'file') {
      this.formatFileProperty(propertyEl, propertyValue);
    } else if (settings.preset === 'kanban' && propertyName === 'status' && cardData) {
      // Special handling for status property in kanban mode - make it editable
      this.formatEditableStatusProperty(propertyEl, propertyValue, cardData, component);
    } else {
      // Check if there's a custom formatter for this property
      const formatter = settings.propertyFormatters[propertyName];

      if (formatter) {
        // Use custom formatter
        this.formatPropertyWithCustomFormatter(propertyEl, propertyValue, formatter);
      } else {
        // Use default formatting based on value type, passing the component
        this.formatPropertyByType(propertyEl, propertyValue, component); // Pass component
      }
    }
  }

  /**
   * Format an editable status property for kanban mode
   * Creates a dropdown that allows changing the status directly
   *
   * @param propertyEl The property element
   * @param currentValue The current status value
   * @param cardData The card data containing file information
   * @param component The parent component for lifecycle management
   */
  private formatEditableStatusProperty(
    propertyEl: HTMLElement,
    currentValue: any,
    cardData: any,
    component: Component
  ): void {
    const valueEl = propertyEl.createEl('div', {
      cls: 'datacards-property-value datacards-editable-status',
    });

    // Get status options from settings (with fallback to defaults)
    const statusOptions = this.currentSettings?.kanbanStatusOptions || ['todo', 'in-progress', 'review', 'done'];
    console.log('=== STATUS DROPDOWN DEBUG ===');
    console.log('Current settings:', this.currentSettings);
    console.log('kanbanStatusOptions from settings:', this.currentSettings?.kanbanStatusOptions);
    console.log('Final status options:', statusOptions);
    console.log('=== END STATUS DEBUG ===');

    // Create a select dropdown
    const selectEl = valueEl.createEl('select', {
      cls: 'datacards-status-select'
    });

    // Add options to the select
    statusOptions.forEach(status => {
      const optionEl = selectEl.createEl('option', {
        value: status,
        text: status
      });

      if (status === String(currentValue)) {
        optionEl.selected = true;
      }
    });

    // Add change event listener
    selectEl.addEventListener('change', async (event) => {
      const newStatus = (event.target as HTMLSelectElement).value;
      await this.updateNoteStatus(cardData, newStatus);
    });
  }

  /**
   * Update the status property of a note
   *
   * @param cardData The card data containing file information
   * @param newStatus The new status value
   */
  private async updateNoteStatus(cardData: any, newStatus: string): Promise<void> {
    try {
      console.log('=== UPDATE NOTE STATUS DEBUG ===');
      console.log('Card data:', cardData);
      console.log('New status:', newStatus);
      console.log('Card data type:', typeof cardData);
      console.log('Card data keys:', Object.keys(cardData || {}));

      // Extract file information from cardData
      let file: TFile | null = null;

      // Try different ways to get the file
      if (cardData && cardData.file) {
        console.log('Found cardData.file:', cardData.file);
        if (cardData.file instanceof TFile) {
          file = cardData.file;
        } else if (cardData.file.path) {
          console.log('Getting file by path:', cardData.file.path);
          const abstractFile = this.app.vault.getAbstractFileByPath(cardData.file.path);
          if (abstractFile instanceof TFile) {
            file = abstractFile;
          }
        }
      }

      // Try other properties
      if (!file && cardData && cardData.path) {
        console.log('Trying cardData.path:', cardData.path);
        const abstractFile = this.app.vault.getAbstractFileByPath(cardData.path);
        if (abstractFile instanceof TFile) {
          file = abstractFile;
        }
      }

      // Try filePath property
      if (!file && cardData && cardData.filePath) {
        console.log('Trying cardData.filePath:', cardData.filePath);
        const abstractFile = this.app.vault.getAbstractFileByPath(cardData.filePath);
        if (abstractFile instanceof TFile) {
          file = abstractFile;
        }
      }

      // If cardData itself is a file path string
      if (!file && typeof cardData === 'string') {
        console.log('Trying cardData as string path:', cardData);
        const abstractFile = this.app.vault.getAbstractFileByPath(cardData);
        if (abstractFile instanceof TFile) {
          file = abstractFile;
        }
      }

      if (!file) {
        console.error('Could not determine file from card data. Available properties:', Object.keys(cardData || {}));
        console.error('Full card data:', JSON.stringify(cardData, null, 2));
        return;
      }

      console.log('Found file:', file.path);

      // Read the file content
      const content = await this.app.vault.read(file);
      console.log('Current file content length:', content.length);
      console.log('First 200 chars:', content.substring(0, 200));

      // Update the frontmatter
      const updatedContent = this.updateFrontmatterStatus(content, newStatus);
      console.log('Updated content length:', updatedContent.length);
      console.log('Updated first 200 chars:', updatedContent.substring(0, 200));

      // Write back to file
      await this.app.vault.modify(file, updatedContent);

      console.log('Successfully updated status to:', newStatus);
      console.log('=== UPDATE COMPLETE ===');

      // Trigger a refresh of the DataCards
      setTimeout(() => {
        this.triggerRefresh();
      }, 100);

    } catch (error) {
      console.error('Error updating note status:', error);
      console.error('Error stack:', error.stack);
    }
  }

  /**
   * Update the status property in frontmatter
   *
   * @param content The file content
   * @param newStatus The new status value
   * @returns Updated content
   */
  private updateFrontmatterStatus(content: string, newStatus: string): string {
    // Simple frontmatter parsing and updating
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      // No frontmatter, add it
      return `---\nstatus: ${newStatus}\n---\n\n${content}`;
    }

    const frontmatter = match[1];
    const statusRegex = /^status:\s*(.*)$/m;

    if (frontmatter.match(statusRegex)) {
      // Update existing status
      const updatedFrontmatter = frontmatter.replace(statusRegex, `status: ${newStatus}`);
      return content.replace(frontmatterRegex, `---\n${updatedFrontmatter}\n---`);
    } else {
      // Add status to existing frontmatter
      const updatedFrontmatter = `${frontmatter}\nstatus: ${newStatus}`;
      return content.replace(frontmatterRegex, `---\n${updatedFrontmatter}\n---`);
    }
  }

  /**
   * Format a property value using a custom formatter
   *
   * @param propertyEl The property element
   * @param value The property value
   * @param formatter The formatter configuration
   */
  private formatPropertyWithCustomFormatter(
    propertyEl: HTMLElement,
    value: any,
    formatter: { type: string; options?: any }
  ): void {
    const valueEl = propertyEl.createEl('div', {
      cls: 'datacards-property-value',
    });

    switch (formatter.type) {
      case 'stars':
        this.formatAsStars(valueEl, value, formatter.options);
        break;
      case 'badge':
        this.formatAsBadge(valueEl, value, formatter.options);
        break;
      case 'progress':
        this.formatAsProgress(valueEl, value, formatter.options);
        break;
      case 'date':
        this.formatAsDate(valueEl, value, formatter.options);
        break;
      case 'tags':
        this.formatAsTags(valueEl, value);
        break;
      default:
        // Default to text
        valueEl.setText(String(value));
    }
  }

  /**
   * Process rich text content that may contain wiki links, HTML, or both
   * This unified processor handles mixed content properly
   *
   * @param container The container element to add the processed content to
   * @param value The text value to process
   * @param component The parent component for lifecycle management
   * @returns True if the content was processed, false if it should be handled by other formatters
   */
  private processRichText(container: HTMLElement, value: string, component: Component): boolean { // Added component parameter
    if (typeof value !== 'string') {
      return false;
    }

    Logger.debug('Processing rich text:', value);

    // Check for complete HTML elements (tags with content between them)
    const hasCompleteHtml = /<([a-z][a-z0-9]*)\b[^>]*>.*?<\/\1>/i.test(value);

    // Use a more robust regex to detect HTML, including <br>
    const hasHtml = hasCompleteHtml || /<[a-z][\s\S]*>/i.test(value);
    const hasWikiLinks = value.includes('[['); // No need to check for ']]' if '[[' is present

    // If it doesn't have either, let other formatters handle it
    if (!hasWikiLinks && !hasHtml) {
      Logger.debug('Content is plain text, skipping rich text processing.');
      return false;
    }

    Logger.debug(`Content has wiki links: ${hasWikiLinks}, has HTML: ${hasHtml}, has complete HTML: ${hasCompleteHtml}`);

    // Special handling for text with complete HTML elements
    if (hasCompleteHtml) {
      Logger.debug('Rendering complete HTML elements');
      // Create a temporary div to hold the HTML content
      const tempDiv = document.createElement('div');
      // Set the HTML content
      tempDiv.innerHTML = value;

      // Append all child nodes to the container
      while (tempDiv.firstChild) {
        container.appendChild(tempDiv.firstChild);
      }

      return true;
    }

    // For other cases, tokenize the content to separate wiki links, HTML tags, and plain text
    const tokens = this.tokenizeRichText(value);
    Logger.debug('Tokens:', tokens);

    // Process each token and add to the container
    tokens.forEach(token => {
      if (token.type === 'wikilink') {
        // Process wiki link
        this.createWikiLink(container, token.content);
      } else if (token.type === 'url') {
        // Process URL as clickable link
        container.createEl('a', {
          cls: 'external-link',
          text: token.content,
          attr: {
            href: token.content,
            target: '_blank',
            rel: 'noopener'
          }
        });
      } else if (token.type === 'html' || token.type === 'text') {
        // Use MarkdownRenderer.render for HTML and Text tokens
        // This safely renders basic HTML (like <br>) and Markdown, while sanitizing scripts.
        MarkdownRenderer.render(this.app, token.content, container, '', component);
      }
      // The original 'else' block for textNode is removed as it's covered above.
    });

    return true; // Indicate that the content was processed
  }

  /**
   * Tokenize rich text into wiki links, HTML tags/entities, URLs, and plain text segments
   *
   * @param text The text to tokenize
   * @returns Array of tokens with type and content
   */
  private tokenizeRichText(text: string): Array<{type: 'wikilink' | 'html' | 'text' | 'url', content: string}> {
    const tokens: Array<{type: 'wikilink' | 'html' | 'text' | 'url', content: string}> = [];

    // First, check if the text contains complete HTML elements
    const hasCompleteHtmlElements = /<([a-z][a-z0-9]*)\b[^>]*>.*?<\/\1>/i.test(text);

    if (hasCompleteHtmlElements) {
      // If we have complete HTML elements, treat the entire text as HTML
      // This ensures proper rendering of elements like <u>underlined</u>
      tokens.push({ type: 'html', content: text });
      return tokens;
    }

    // If no complete HTML elements, use the original tokenization approach
    // Regex to find wiki links OR HTML tags/entities OR URLs
    // [[...]] captures wiki links
    // <...> captures HTML tags
    // &...; captures HTML entities
    // https?://... captures URLs
    const combinedRegex = /(\[\[.*?\]\])|(<[^>]+>|&[a-zA-Z#0-9]+;)|(https?:\/\/[^\s"'<>[\]{}]+)/g;

    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      // Add preceding plain text if any
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }

      // Add the matched token (wiki link, HTML, or URL)
      if (match[1]) { // Wiki link
        tokens.push({ type: 'wikilink', content: match[1] });
      } else if (match[2]) { // HTML tag or entity
        tokens.push({ type: 'html', content: match[2] });
      } else if (match[3]) { // URL
        tokens.push({ type: 'url', content: match[3] });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining plain text after the last match
    if (lastIndex < text.length) {
      tokens.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return tokens;
  }

  /**
   * Create a wiki link element and register hover/click handlers
   *
   * @param container The container element to add the link to
   * @param wikiLinkText The full wiki link text (e.g., "[[Page|Display]]")
   */
  private createWikiLink(container: HTMLElement, wikiLinkText: string): void {
    Logger.debug('Creating wiki link from text:', wikiLinkText);

    // Extract the link path and display text
    const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/;
    const match = wikiLinkText.match(wikiLinkRegex);

     if (!match) {
       // If somehow it's not a valid wiki link format, add as plain text
       container.appendChild(document.createTextNode(wikiLinkText));
       Logger.debug('Invalid wiki link format passed to createWikiLink:', wikiLinkText); // Changed to debug
       return;
     }

    const path = match[1];
    // Use display text if provided, otherwise use the path itself (not cleaned)
    const displayText = match[2] || path;

    Logger.debug(`Creating wiki link: path="${path}", display="${displayText}"`);

    // Create the link element
    const link = container.createEl('a', {
      cls: 'internal-link', // Use Obsidian's standard class for internal links
      text: displayText,
      attr: {
        href: path, // href attribute for navigation
        'data-href': path, // data-href for Obsidian's internal handling
        'data-type': 'link', // Indicate it's a standard link
        'target': '_blank', // Open in new tab/pane behavior
        'rel': 'noopener' // Security measure for target="_blank"
      }
    });

    // Register the link with Obsidian's hover handler for pop-up previews
    // This needs to be done carefully to avoid errors if hoverPopover is not available
    try {
      // Check if hoverPopover exists before trying to use it
      if ((this.app.workspace as any).hoverPopover) {
        this.app.workspace.trigger('hover-link', {
          event: new MouseEvent('mouseover'), // Simulate a mouseover event
          source: 'preview', // Indicate the source is a preview mode render
          hoverEl: link, // The element being hovered
          targetEl: link, // The target element for the popover
          linktext: path, // The link path
          sourcePath: this.app.workspace.getActiveFile()?.path // Optional: source file path
        });
      } else {
        Logger.debug('Hover popover not available, skipping hover registration.');
      }
     } catch (error) {
       // Silently catch errors with hover registration, log for debugging
       Logger.debug('Error registering hover link:', error); // Changed to debug
     }
   }

  /**
   * Format a property value based on its type
   *
   * @param propertyEl The property element
   * @param value The property value
   * @param component The parent component for lifecycle management
   */
  private formatPropertyByType(propertyEl: HTMLElement, value: any, component: Component): void { // Added component parameter
    // Add detailed debug logging to see exactly what we're dealing with
    Logger.debug('formatPropertyByType called with value:', value);
    Logger.debug('Value type:', typeof value);
    if (typeof value === 'string') {
      Logger.debug('String value length:', value.length);
      Logger.debug('String value exact content:', JSON.stringify(value));
    }

    const valueEl = propertyEl.createEl('div', {
      cls: 'datacards-property-value',
    });

    // Apply the same text alignment class as the parent property element
    if (propertyEl.hasClass('datacards-text-left')) {
      valueEl.addClass('datacards-text-left');
    } else if (propertyEl.hasClass('datacards-text-center')) {
      valueEl.addClass('datacards-text-center');
    } else if (propertyEl.hasClass('datacards-text-right')) {
      valueEl.addClass('datacards-text-right');
    }

    if (value === null || value === undefined) {
      valueEl.setText('');
    } else if (Array.isArray(value)) {
      Logger.debug('Processing array value:', value);

      // Process each array item
      value.forEach((item, index) => {
        // Add comma separator if not the first item
        if (index > 0) {
          valueEl.appendChild(document.createTextNode(', '));
        }

        // Handle string items (potential wiki links or plain text)
        if (typeof item === 'string') {
          // Strip surrounding quotes if present (common in YAML)
          const cleanItem = item.replace(/^["'](.*?)["']$/, '$1');
          Logger.debug(`Processing array item ${index}:`, { original: item, cleaned: cleanItem });

          // Check if the cleaned item is a wiki link
          const wikiLinkMatch = cleanItem.match(/^\[\[(.*?)\]\]$/);
          if (wikiLinkMatch) {
            // It's a wiki link, render it using createWikiLink
            Logger.debug(`Creating wiki link from array item: ${cleanItem}`);
            this.createWikiLink(valueEl, cleanItem);
          } else if (this.containsUrl(cleanItem)) {
            // Check if the item contains URLs
            Logger.debug(`Array item contains URLs: ${cleanItem}`);
            this.renderTextWithUrls(valueEl, cleanItem);
          } else {
            // Not a wiki link or URL, try processing as rich text (handles HTML like <br>)
            Logger.debug(`Treating array item as plain/rich text: ${cleanItem}`);
            // If processRichText returns false, it means it was plain text and wasn't handled
            if (!this.processRichText(valueEl, cleanItem, component)) { // Pass component
              // Explicitly add the plain text item
              valueEl.appendChild(document.createTextNode(cleanItem));
            }
          }
        } else if (typeof item === 'object' && item !== null && 'path' in item && 'type' in item && item.type === 'file') {
          // Handle Dataview Link objects within the array
          Logger.debug('Handling Dataview Link object within array:', item);
          const path = item.path;
          const displayText = item.display || this.getCleanFilename(path);
          this.createWikiLink(valueEl, `[[${path}|${displayText}]]`);
        } else {
          // Handle other types (numbers, booleans, etc.) by converting to string
          Logger.debug(`Treating array item as other type: ${item}`);
          valueEl.appendChild(document.createTextNode(String(item)));
        }
      });
    } else if (typeof value === 'boolean') {
      // Enhanced logging for boolean values
      Logger.debug(`Formatting boolean property with value: ${value} (${typeof value})`);

      // Create a container for the checkbox and text
      const booleanContainer = valueEl.createEl('div', {
        cls: 'datacards-boolean-container',
      });

      // Apply the same text alignment class as the parent property element
      if (propertyEl.hasClass('datacards-text-left')) {
        booleanContainer.addClass('datacards-text-left');
      } else if (propertyEl.hasClass('datacards-text-center')) {
        booleanContainer.addClass('datacards-text-center');
      } else if (propertyEl.hasClass('datacards-text-right')) {
        booleanContainer.addClass('datacards-text-right');
      }

      // Get the current settings for boolean display
      const displayMode = this.currentSettings?.booleanDisplayMode || 'both';
      const showLabels = this.currentSettings?.showBooleanLabels !== false;
      const trueText = this.currentSettings?.booleanTrueText || 'true';
      const falseText = this.currentSettings?.booleanFalseText || 'false';

      // Add text representation if enabled
      if ((displayMode === 'both' || displayMode === 'text') && showLabels) {
        // Create a hidden checkbox for styling purposes when in text-only mode
        if (displayMode === 'text') {
          const hiddenCheckbox = booleanContainer.createEl('input', {
            cls: 'datacards-checkbox datacards-hidden-checkbox',
            attr: {
              type: 'checkbox',
              disabled: 'disabled',
              'data-boolean-value': value.toString()
            },
          });
          hiddenCheckbox.checked = value;
        }

        booleanContainer.createEl('span', {
          cls: 'datacards-boolean-text',
          text: value ? trueText : falseText
        });
      }

      // Add checkbox if enabled
      if (displayMode === 'both' || displayMode === 'checkbox') {
        const checkbox = booleanContainer.createEl('input', {
          cls: 'datacards-checkbox',
          attr: {
            type: 'checkbox',
            disabled: 'disabled',
            'data-boolean-value': value.toString(), // Store the actual value as a data attribute
          },
        });

        // Set the checked property directly (more reliable than the attribute)
        checkbox.checked = value;

        Logger.debug(`Created checkbox with checked=${value}, data-boolean-value=${value.toString()}`);
      }
    } else if (typeof value === 'number') {
      // Format as number
      valueEl.setText(value.toString());
    } else if (value instanceof Date) {
      // Format Date objects using the date formatter
      this.formatAsDate(valueEl, value);
    } else if (typeof value === 'string') {
      // Check if the string is a date (ISO format)
      const isIsoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}[+-]\d{2}:\d{2}$/.test(value) ||
                        /^\d{4}-\d{2}-\d{2}$/.test(value);

      if (isIsoDate) {
        // It's a date string, format it using the date formatter
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          this.formatAsDate(valueEl, date);
          return;
        }
      }

      // Try processing as rich text (handles wiki links, HTML, and mixed content)
      if (this.processRichText(valueEl, value, component)) { // Pass component
        // If processed successfully, we're done
        return;
      }

      // If not processed as rich text, handle remaining string cases

      // Check for markdown image syntax: ![alt text](url) or ![|size](url)
      // This should ideally be handled by processRichText if it contains HTML, but keep as fallback
      const markdownImageMatch = value.match(/!\[(.*?)\]\((.*?)\)/);
      if (markdownImageMatch) {
        Logger.debug('Found markdown image in property value (fallback)');
        const imageUrl = markdownImageMatch[2];
        const altText = markdownImageMatch[1];

        // Add loading class initially
        valueEl.addClass('loading');

        // Create an image element with crossorigin attribute for external URLs
        const img = valueEl.createEl('img', {
          cls: 'datacards-property-image loading',
          attr: {
            src: imageUrl,
            alt: altText || 'Image',
            crossorigin: 'anonymous' // Add crossorigin attribute to help with CORS issues
          }
        });

        // Remove loading class when image loads
        img.onload = () => {
          Logger.debug('Property image loaded successfully:', imageUrl);
          img.removeClass('loading');
        };

         // Add error handling for property images
         img.onerror = () => {
           // Use debug instead of warn for image loading issues since they're expected and handled with fallbacks
           Logger.debug('Failed to load property image:', imageUrl);
           // Remove the image
           img.remove();
           // Add error class and message
          valueEl.removeClass('loading');
          valueEl.addClass('image-error');
          valueEl.setText('Image not found: ' + imageUrl);
        };

        return;
      }

      // Check for tags
      if (value.startsWith('#')) {
        // Tag - make it a clickable link
        valueEl.createEl('a', {
          cls: 'datacards-tag tag-link',
          text: value,
          attr: {
            href: value,
            'data-href': value,
            'data-type': 'tag'
          }
        });
        return;
      }

      // Check if the text contains URLs and convert them to clickable links
      if (this.containsUrl(value)) {
        Logger.debug('Text contains URLs, converting to clickable links:', value);
        this.renderTextWithUrls(valueEl, value);
      } else {
        // If no URLs, treat as plain text
        Logger.debug('Treating value as plain text:', value);
        valueEl.setText(value);
      }

    } else if (typeof value === 'object' && value !== null) {
      // Check if it's a Dataview Link object
      if ('path' in value && 'type' in value && value.type === 'file') {
        Logger.debug('Handling Dataview Link object:', value);

        // Extract path and display text
        const path = value.path;
        // Use display if available, otherwise use the clean filename
        const displayText = value.display || this.getCleanFilename(path);

        Logger.debug(`Creating link from Dataview Link object: path="${path}", display="${displayText}"`);

        // Create a proper Obsidian internal link
        this.createWikiLink(valueEl, `[[${path}|${displayText}]]`); // Use createWikiLink for consistency

        return;
      }

      // Check if it's a Dataview date object (has a 'ts' property)
      if ('ts' in value && typeof value.ts === 'number') {
        const date = new Date(value.ts);
        if (!isNaN(date.getTime())) {
          this.formatAsDate(valueEl, date);
          return;
        }
      }

      // Default to string representation for other objects
      valueEl.setText(String(value));
    } else {
      // Default to string representation
      valueEl.setText(String(value));
    }
  }


  /**
   * Format a value as stars (for ratings)
   *
   * @param container The container element
   * @param value The value to format
   * @param options Formatting options
   */
  private formatAsStars(container: HTMLElement, value: number, options?: any): void {
    const maxStars = options?.max || 5;
    const starFull = '★';
    const starEmpty = '☆';

    const starsContainer = container.createEl('div', {
      cls: 'datacards-stars',
    });

    const numStars = Math.min(Math.max(0, value), maxStars);

    // Add full stars
    for (let i = 0; i < numStars; i++) {
      starsContainer.createEl('span', {
        cls: 'datacards-star datacards-star-full',
        text: starFull,
      });
    }

    // Add empty stars
    for (let i = numStars; i < maxStars; i++) {
      starsContainer.createEl('span', {
        cls: 'datacards-star datacards-star-empty',
        text: starEmpty,
      });
    }
  }

  /**
   * Format a value as a badge
   *
   * @param container The container element
   * @param value The value to format
   * @param options Formatting options
   */
  private formatAsBadge(container: HTMLElement, value: string, options?: any): void {
    const badge = container.createEl('span', {
      cls: 'datacards-badge',
      text: value,
    });

    // Add color if specified
    if (options?.color) {
      // Map common color names to classes
      const colorMap: Record<string, string> = {
        'red': 'datacards-badge-red',
        'green': 'datacards-badge-green',
        'blue': 'datacards-badge-blue',
        'yellow': 'datacards-badge-yellow',
        'purple': 'datacards-badge-purple',
        'orange': 'datacards-badge-orange',
        'pink': 'datacards-badge-pink',
        'gray': 'datacards-badge-gray'
      };

      // Check if the color is a predefined one
      if (options.color.toLowerCase() in colorMap) {
        badge.addClass(colorMap[options.color.toLowerCase()]);
      } else {
        // For custom colors, set data attribute only
        // CSS will use this attribute to set the color
        badge.setAttribute('data-color', options.color);
      }
    } else {
      // Default color class
      badge.addClass('datacards-badge-default');
    }
  }

  /**
   * Format a value as a progress bar
   *
   * @param container The container element
   * @param value The value to format
   * @param options Formatting options
   */
  private formatAsProgress(container: HTMLElement, value: number, options?: any): void {
    const max = options?.max || 100;
    const percentage = Math.min(Math.max(0, value), max) / max * 100;

    const progressContainer = container.createEl('div', {
      cls: 'datacards-progress-container',
    });

    // Determine the appropriate width class based on percentage
    const widthClass = `datacards-progress-width-${Math.round(percentage / 10) * 10}`;

    const progressBar = progressContainer.createEl('div', {
      cls: `datacards-progress-bar ${widthClass}`,
    });

    // Set data attribute for exact percentage
    // Round to nearest 5% for CSS classes
    const roundedPercentage = Math.round(percentage / 5) * 5;
    progressBar.setAttribute('data-percentage', `${roundedPercentage}`);

    // Add text if specified
    if (options?.showText) {
      progressContainer.createEl('span', {
        cls: 'datacards-progress-text',
        text: `${Math.round(percentage)}%`,
      });
    }
  }

  /**
   * Format a value as a date
   *
   * @param container The container element
   * @param value The value to format
   * @param options Formatting options
   */
  private formatAsDate(container: HTMLElement, value: string | Date, options?: any): void {
    const date = typeof value === 'string' ? new Date(value) : value;

    if (isNaN(date.getTime())) {
      container.setText(String(value));
      return;
    }

    // Use the format from options, or from the current settings, or fall back to the default format
    const format = options?.format || (this.currentSettings ? this.currentSettings.defaultDateFormat : DEFAULT_SETTINGS.defaultDateFormat);

    // Enhanced date formatting with more tokens
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthAbbreviations = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Simple and reliable date formatting - just replace directly in the right order
    let formattedDate = format;

    // Replace tokens in order from longest to shortest to avoid conflicts
    formattedDate = formattedDate
      .replace(/YYYY/g, year.toString())
      .replace(/MMMM/g, monthNames[month - 1])
      .replace(/MMM/g, monthAbbreviations[month - 1])
      .replace(/MM/g, month.toString().padStart(2, '0'))
      .replace(/DD/g, day.toString().padStart(2, '0'))
      .replace(/YY/g, year.toString().slice(-2))
      .replace(/\bM\b/g, month.toString())  // Use word boundary to avoid partial matches
      .replace(/\bD\b/g, day.toString());   // Use word boundary to avoid partial matches

    container.setText(formattedDate);
  }

  /**
   * Format a file property as a clickable link
   * Special handling for the file property which is always a link to the note
   *
   * @param propertyEl The property element
   * @param value The file property value
   */
  private formatFileProperty(propertyEl: HTMLElement, value: any): void {
    const valueEl = propertyEl.createEl('div', {
      cls: 'datacards-property-value datacards-file-property',
    });

    // Apply title alignment if this is a file property (title)
    // Use the titleAlign setting from the current settings
    if (this.currentSettings?.titleAlign) {
      valueEl.addClass(`datacards-text-${this.currentSettings.titleAlign}`);
    } else {
      // Fallback to the same alignment as the parent property element
      // This ensures consistent alignment if titleAlign is not set
      if (propertyEl.hasClass('datacards-text-left')) {
        valueEl.addClass('datacards-text-left');
      } else if (propertyEl.hasClass('datacards-text-center')) {
        valueEl.addClass('datacards-text-center');
      } else if (propertyEl.hasClass('datacards-text-right')) {
        valueEl.addClass('datacards-text-right');
      }
    }

    if (value === null || value === undefined) {
      valueEl.setText('');
      return;
    }

    // Handle different types of file values
    let stringValue: string;

    if (typeof value === 'object' && value !== null) {
      // Dataview returns file as an object with a path property
      if ('path' in value) {
        stringValue = value.path;
      } else if ('link' in value) {
        // Or sometimes as an object with a link property
        stringValue = value.link;
      } else {
        // If it's some other object, convert to string
        stringValue = String(value);
      }
    } else {
      // If it's already a string or some other type, convert to string
      stringValue = String(value);
    }

    // Check if the string contains a wiki link or URL and extract it
    // This helps with expressions that result in strings containing wiki links or URLs
    stringValue = this.extractImageSource(stringValue);
    Logger.debug('File property after image source extraction:', stringValue);

      // Direct approach for wiki links - just set the text to the display part
      // This is a workaround for when the link is not being properly rendered
      if (typeof value === 'string' && value.includes('[[') && value.includes('|') && value.includes(']]')) {
        Logger.debug('Found wiki link with pipe character:', value);
        // Extract the display text part (after the pipe)
        const match = value.match(/\[\[.*\|(.*?)\]\]/);
        if (match && match[1]) {
          Logger.debug('Extracted display text:', match[1]);
          // Instead of just setting text, let's try to create a proper link
          const fullMatch = value.match(/\[\[(.*?)\|(.*?)\]\]/);
          if (fullMatch) {
            const path = fullMatch[1];
            const displayText = fullMatch[2];
            Logger.debug(`Creating link from pipe syntax - path: "${path}", display: "${displayText}"`);

            const link = valueEl.createEl('a', {
              cls: 'internal-link datacards-file-link',
              text: displayText,
              attr: {
                href: path,
                'data-href': path,
                'data-type': 'link'
              }
            });
            Logger.debug('Created link element for pipe syntax:', link);

            // Register the link with Obsidian's click handler
            try {
              this.app.workspace.trigger('hover-link', {
                event: new MouseEvent('mouseover'),
                source: 'preview',
                hoverEl: link,
                targetEl: link,
                linktext: path
              });
            } catch (error) {
              // Silently catch errors with hover registration to prevent uncaught exceptions
              // This prevents the "Cannot read properties of undefined (reading 'hoverPopover')" error
            }

            return;
          } else {
            // Fallback to just text if we couldn't parse properly
            Logger.debug('Fallback to text only for pipe syntax');
            valueEl.setText(match[1]);
            return;
          }
        }
      }

    // More general case for wiki links
    if (stringValue.includes('[[') && stringValue.includes(']]')) {
      Logger.debug('Found wiki link in file property:', stringValue);

      // Extract the wiki link content
      const wikiLinkMatch = stringValue.match(/\[\[([^\]]+)\]\]/);
      if (wikiLinkMatch) {
        const linkText = wikiLinkMatch[1];

        // Handle display text if present (format: [[path|displayText]])
        let displayText = linkText;
        let path = linkText;

        if (linkText.includes('|')) {
          const parts = linkText.split('|');
          path = parts[0];
          displayText = parts[1];
        } else {
          // No display text provided, extract just the filename without extension
          displayText = this.getCleanFilename(path);
        }

        // Create a proper Obsidian internal link
        valueEl.createEl('a', {
          cls: 'internal-link datacards-file-link',
          text: displayText,
          attr: {
            href: path,
            'data-href': path,
            'data-type': 'link'
          }
        });
      }
    }
    // Check if it's already a wiki link
    else if (stringValue.startsWith('[[') && stringValue.endsWith(']]')) {
      // Wiki link
      const linkText = stringValue.substring(2, stringValue.length - 2);

      // Handle display text if present (format: [[path|displayText]])
      let displayText = linkText;
      let path = linkText;

      if (linkText.includes('|')) {
        const parts = linkText.split('|');
        path = parts[0];
        displayText = parts[1];
      } else {
        // No display text provided, extract just the filename without extension
        displayText = this.getCleanFilename(path);
      }

      // Create a proper Obsidian internal link
      valueEl.createEl('a', {
        cls: 'internal-link datacards-file-link',
        text: displayText,
        attr: {
          href: path,
          'data-href': path,
          'data-type': 'link'
        }
      });
    } else {
      // Not a wiki link, create a link from the plain text
      // Assume the value is a file path or name
      // Extract just the filename without extension
      const displayText = this.getCleanFilename(stringValue);

      valueEl.createEl('a', {
        cls: 'internal-link datacards-file-link',
        text: displayText,
        attr: {
          href: stringValue,
          'data-href': stringValue,
          'data-type': 'link'
        }
      });
    }
  }

  /**
   * Extract just the filename without path and extension
   *
   * @param path The file path
   * @returns The clean filename
   */
  private getCleanFilename(path: string): string {
    // Extract just the filename without extension
    let filename = path;

    // Remove path if present (get just the filename)
    if (filename.includes('/')) {
      filename = filename.split('/').pop() || filename;
    }

    // Remove .md extension if present
    if (filename.endsWith('.md')) {
      filename = filename.substring(0, filename.length - 3);
    }

    return filename;
  }

  /**
   * Format a value as tags
   *
   * @param container The container element
   * @param value The value to format
   */
  private formatAsTags(container: HTMLElement, value: string | string[]): void {
    const tagsContainer = container.createEl('div', {
      cls: 'datacards-tags-container',
    });

    const tags = Array.isArray(value) ? value : [value];

    tags.forEach((tag: string) => {
      // Ensure tag starts with #
      const tagText = tag.startsWith('#') ? tag : `#${tag}`;

      // Create a clickable tag link
      tagsContainer.createEl('a', {
        cls: 'datacards-tag tag-link',
        text: tagText,
        attr: {
          href: tagText,
          'data-href': tagText,
          'data-type': 'tag'
        }
      });
    });
  }

  /**
   * Determine if properties should be scrollable based on settings precedence
   *
   * @param settings The merged settings
   * @returns True if properties should be scrollable, false otherwise
   */
  private shouldUseScrollableProperties(settings: DataCardsSettings): boolean {
    // Start with preset-specific defaults
    let shouldScroll = false;

    // Square and compact presets are scrollable by default
    if (settings.preset === 'square' || settings.preset === 'compact') {
      shouldScroll = true;
    }

    // Apply global plugin settings
    if (this.pluginSettings.scrollableProperties !== undefined) {
      shouldScroll = this.pluginSettings.scrollableProperties;
    }

    // Apply mobile settings if on mobile
    const isMobile = this.isMobileDevice();
    if (isMobile && this.pluginSettings.mobileScrollableProperties !== undefined) {
      shouldScroll = this.pluginSettings.mobileScrollableProperties;
    }

    // Block settings have highest priority
    if (settings.scrollableProperties !== undefined) {
      shouldScroll = settings.scrollableProperties;
    }

    return shouldScroll;
  }

  /**
   * Get the content height based on settings precedence
   *
   * @param settings The merged settings
   * @returns The content height as a string (e.g., '200px')
   */
  private getContentHeight(settings: DataCardsSettings): string {
    // Start with default
    let contentHeight = '200px';

    // Apply global plugin settings
    if (this.pluginSettings.contentHeight) {
      contentHeight = this.pluginSettings.contentHeight;
    }

    // Apply mobile settings if on mobile
    const isMobile = this.isMobileDevice();
    if (isMobile && this.pluginSettings.mobileContentHeight) {
      contentHeight = this.pluginSettings.mobileContentHeight;
    }

    // Block settings have highest priority
    if (settings.contentHeight) {
      contentHeight = settings.contentHeight;
    }

    return contentHeight;
  }

  /**
   * Check if a string contains a URL
   *
   * @param text The text to check
   * @returns True if the text contains a URL, false otherwise
   */
  private containsUrl(text: string): boolean {
    if (typeof text !== 'string') {
      return false;
    }

    // Regex to match URLs (http, https)
    const urlRegex = /(https?:\/\/[^\s"'<>[\]{}]+)/i;
    return urlRegex.test(text);
  }

  /**
   * Render text with URLs as clickable links
   *
   * @param container The container element to add the text to
   * @param text The text that may contain URLs
   */
  private renderTextWithUrls(container: HTMLElement, text: string): void {
    if (typeof text !== 'string') {
      container.setText(String(text));
      return;
    }

    // Regex to match URLs (http, https)
    const urlRegex = /(https?:\/\/[^\s"'<>[\]{}]+)/gi;

    // Use a more reliable approach to avoid duplication
    let lastIndex = 0;
    let match;

    // Reset the regex before using it in a loop
    urlRegex.lastIndex = 0;

    // Process each URL match
    while ((match = urlRegex.exec(text)) !== null) {
      // Add text before the URL
      if (match.index > lastIndex) {
        container.appendChild(document.createTextNode(
          text.substring(lastIndex, match.index)
        ));
      }

      // Add the URL as a link
      const url = match[0];
      container.createEl('a', {
        cls: 'external-link',
        text: url,
        attr: {
          href: url,
          target: '_blank',
          rel: 'noopener'
        }
      });

      // Update the last index to after this URL
      lastIndex = match.index + url.length;
    }

    // Add any remaining text after the last URL
    if (lastIndex < text.length) {
      container.appendChild(document.createTextNode(
        text.substring(lastIndex)
      ));
    }
  }

  /**
   * Check if the results are from a GROUP BY query
   * GROUP BY results have a specific structure with grouped data
   *
   * @param results The Dataview query results
   * @returns True if the results are from a GROUP BY query
   */
  private isGroupByResults(results: any): boolean {
    console.log('GROUP BY CHECK - Input results:', results);
    console.log('GROUP BY CHECK - Is array:', Array.isArray(results));

    // Check for Dataview's GROUP BY structure using idMeaning (TABLE + GROUP BY)
    if (results && typeof results === 'object' && results.idMeaning) {
      const isGroupBy = results.idMeaning.type === 'group';
      console.log('GROUP BY CHECK - Found idMeaning.type:', results.idMeaning.type);
      console.log('GROUP BY CHECK - Is GROUP BY (TABLE):', isGroupBy);
      return isGroupBy;
    }

    // Check for Dataview's GROUP BY structure using primaryMeaning (LIST + GROUP BY)
    if (results && typeof results === 'object' && results.primaryMeaning) {
      const isGroupBy = results.primaryMeaning.type === 'group';
      console.log('GROUP BY CHECK - Found primaryMeaning.type:', results.primaryMeaning.type);
      console.log('GROUP BY CHECK - Is GROUP BY (LIST):', isGroupBy);
      return isGroupBy;
    }

    // Legacy check: GROUP BY results are arrays where each item has a 'key' and 'rows' property
    if (!Array.isArray(results)) {
      // Maybe GROUP BY results are nested in a values property?
      if (results && results.values && Array.isArray(results.values)) {
        console.log('GROUP BY CHECK - Checking results.values:', results.values);
        console.log('GROUP BY CHECK - First item in values:', results.values[0]);

        const hasGroupByStructure = results.values.length > 0 && results.values.every((item: any) =>
          item &&
          typeof item === 'object' &&
          'key' in item &&
          'rows' in item &&
          Array.isArray(item.rows)
        );

        console.log('GROUP BY CHECK - Values has GROUP BY structure:', hasGroupByStructure);
        return hasGroupByStructure;
      }

      console.log('GROUP BY CHECK - Not an array and no values property');
      return false;
    }

    // Check if all items have the GROUP BY structure
    const hasGroupByStructure = results.length > 0 && results.every((item: any) =>
      item &&
      typeof item === 'object' &&
      'key' in item &&
      'rows' in item &&
      Array.isArray(item.rows)
    );

    console.log('GROUP BY CHECK - Direct array has GROUP BY structure:', hasGroupByStructure);
    return hasGroupByStructure;
  }

  /**
   * Render Dataview's TABLE + GROUP BY results as kanban columns
   * This handles the special case where Dataview returns aggregated table data
   *
   * @param container The container element
   * @param results The Dataview GROUP BY table results
   * @param settings The merged settings
   * @param component The parent component for lifecycle management
   */
  private renderDataviewTableGroupByKanban(container: HTMLElement, results: any, settings: DataCardsSettings, component: Component): void {
    console.log('=== DATAVIEW GROUP BY KANBAN ===');
    console.log('Results:', results);
    console.log('Group column:', results.idMeaning?.name);

    // Apply kanban-specific styling to container
    container.addClass('datacards-kanban-container');

    // Set kanban column width and spacing
    container.style.setProperty('--kanban-column-width', settings.kanbanColumnWidth);
    container.style.setProperty('--kanban-column-spacing', `${settings.kanbanColumnSpacing}px`);

    // Extract unique group values from the results
    const groupColumn = results.idMeaning?.name || 'status';
    const groupColumnIndex = results.headers.indexOf(groupColumn);

    if (groupColumnIndex === -1) {
      console.error('Group column not found in headers:', groupColumn);
      return;
    }

    // Get unique group values
    const groupValues = [...new Set(results.values.map((row: any[]) => row[groupColumnIndex]))];
    console.log('Group values:', groupValues);

    // For each group value, we need to query the individual notes
    // Since we can't re-query here, we'll show a message for now
    groupValues.forEach((groupValue: string) => {
      if (!groupValue) return;

      // Create column container
      const column = container.createEl('div', {
        cls: 'datacards-kanban-column'
      });

      // Create column header
      const header = column.createEl('div', {
        cls: 'datacards-kanban-header'
      });

      // Add group title
      header.createEl('span', {
        cls: 'datacards-kanban-title',
        text: groupValue
      });

      // Create cards container within the column
      const cardsContainer = column.createEl('div', {
        cls: 'datacards-kanban-cards'
      });

      // Add a message explaining the limitation
      cardsContainer.createEl('div', {
        cls: 'datacards-kanban-message',
        text: 'Kanban with TABLE + GROUP BY is not fully supported. Use LIST + GROUP BY instead.'
      });
    });
  }

  /**
   * Render GROUP BY results as grouped cards (non-kanban)
   *
   * @param container The container element
   * @param results The GROUP BY results
   * @param settings The merged settings
   * @param component The parent component for lifecycle management
   */
  private renderGroupedResults(container: HTMLElement, results: any[], settings: DataCardsSettings, component: Component): void {
    Logger.debug('Rendering grouped results with', results.length, 'groups');

    // For non-kanban grouped results, render each group as a section
    results.forEach((group: any) => {
      // Create group header
      container.createEl('div', {
        cls: 'datacards-group-header',
        text: `${group.key} (${group.rows.length})`
      });

      // Create group container
      const groupContainer = container.createEl('div', {
        cls: 'datacards-group-container'
      });

      // Render the rows in this group using array rendering logic
      if (group.rows && group.rows.length > 0) {
        // GROUP BY results have object-based rows, use array renderer
        this.renderArrayResults(groupContainer, group.rows, settings, component);
      }
    });
  }

  /**
   * Render Dataview's LIST + GROUP BY results as kanban columns
   * This handles LIST queries with GROUP BY which return group names only
   *
   * @param container The container element
   * @param results The Dataview LIST + GROUP BY results
   * @param settings The merged settings
   * @param component The parent component for lifecycle management
   */
  private renderDataviewListGroupByKanban(container: HTMLElement, results: any, settings: DataCardsSettings, component: Component): void {
    console.log('=== DATAVIEW LIST GROUP BY KANBAN ===');
    console.log('Results:', results);
    console.log('Group column:', results.primaryMeaning?.name);

    // Apply kanban-specific styling to container
    container.addClass('datacards-kanban-container');

    // Set kanban column width and spacing
    container.style.setProperty('--kanban-column-width', settings.kanbanColumnWidth);
    container.style.setProperty('--kanban-column-spacing', `${settings.kanbanColumnSpacing}px`);

    // Get group values from the LIST results
    const groupValues = results.values || [];
    console.log('Group values:', groupValues);

    // For each group value, create a column
    groupValues.forEach((groupValue: string) => {
      if (!groupValue) return;

      // Create column container
      const column = container.createEl('div', {
        cls: 'datacards-kanban-column'
      });

      // Create column header
      const header = column.createEl('div', {
        cls: 'datacards-kanban-header'
      });

      // Add group title
      header.createEl('span', {
        cls: 'datacards-kanban-title',
        text: groupValue
      });

      // Create cards container within the column
      const cardsContainer = column.createEl('div', {
        cls: 'datacards-kanban-cards'
      });

      // For now, show a message. In the future, we could re-query individual notes for this group
      cardsContainer.createEl('div', {
        cls: 'datacards-kanban-message',
        text: `Group: ${groupValue} - Use regular queries without GROUP BY for full kanban functionality.`
      });
    });
  }

  /**
   * Render regular query results as kanban by grouping them programmatically
   * This is the main kanban implementation that works with regular TABLE queries
   *
   * @param container The container element
   * @param results The regular Dataview query results
   * @param settings The merged settings
   * @param component The parent component for lifecycle management
   */
  private renderProgrammaticKanban(container: HTMLElement, results: any, settings: DataCardsSettings, component: Component): void {
    console.log('=== PROGRAMMATIC KANBAN ===');
    console.log('Results:', results);
    console.log('Headers:', results.headers);

    // Apply kanban-specific styling to container
    container.addClass('datacards-kanban-container');

    // Set kanban column width and spacing
    container.style.setProperty('--kanban-column-width', settings.kanbanColumnWidth);
    container.style.setProperty('--kanban-column-spacing', `${settings.kanbanColumnSpacing}px`);

    // Determine the grouping column (hardcoded to 'status' for now)
    const groupColumn = 'status';
    const groupColumnIndex = results.headers.indexOf(groupColumn);

    if (groupColumnIndex === -1) {
      console.error(`Kanban group column '${groupColumn}' not found in headers:`, results.headers);
      container.createEl('div', {
        cls: 'datacards-error',
        text: `Kanban group column '${groupColumn}' not found. Available columns: ${results.headers.join(', ')}`
      });
      return;
    }

    // Group the rows by the grouping column
    const groupedRows = new Map<string, any[]>();

    results.values.forEach((row: any[], index: number) => {
      const groupValue = row[groupColumnIndex];
      const groupKey = groupValue ? String(groupValue) : 'undefined';

      if (!groupedRows.has(groupKey)) {
        groupedRows.set(groupKey, []);
      }
      groupedRows.get(groupKey)!.push(row);
    });

    console.log('Grouped rows:', groupedRows);

    // Create columns for each group
    const sortedGroups = Array.from(groupedRows.entries()).sort(([a], [b]) => a.localeCompare(b));

    sortedGroups.forEach(([groupKey, rows]) => {
      this.createProgrammaticKanbanColumn(container, groupKey, rows, results.headers, settings, component);
    });
  }

  /**
   * Create a kanban column for programmatically grouped data
   *
   * @param container The parent container
   * @param groupKey The group key (status value)
   * @param rows The rows for this group
   * @param headers The table headers
   * @param settings The merged settings
   * @param component The parent component for lifecycle management
   */
  private createProgrammaticKanbanColumn(
    container: HTMLElement,
    groupKey: string,
    rows: any[][],
    headers: string[],
    settings: DataCardsSettings,
    component: Component
  ): void {
    // Create column container
    const normalizedStatus = groupKey.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const column = container.createEl('div', {
      cls: 'datacards-kanban-column',
      attr: {
        'data-status': normalizedStatus
      }
    });

    // Apply custom colors if defined
    if (settings.kanbanColors && settings.kanbanColors[groupKey]) {
      const colorName = settings.kanbanColors[groupKey];
      this.applyKanbanColumnColor(column, colorName, groupKey);
    }

    // Create column header
    const header = column.createEl('div', {
      cls: 'datacards-kanban-header'
    });

    // Add group title
    header.createEl('span', {
      cls: 'datacards-kanban-title',
      text: groupKey
    });

    // Add card count
    header.createEl('span', {
      cls: 'datacards-kanban-count',
      text: `(${rows.length})`
    });

    // Add new task button
    const newTaskBtn = header.createEl('button', {
      cls: 'datacards-new-task-btn',
      attr: {
        'aria-label': `Add new task to ${groupKey}`,
        'title': `Add new task to ${groupKey}`
      }
    });
    newTaskBtn.innerHTML = '+';

    // Add click handler for new task button
    newTaskBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showNewTaskModal(groupKey, settings, component);
    });

    // Create cards container within the column
    const cardsContainer = column.createEl('div', {
      cls: 'datacards-kanban-cards'
    });

    // Render each row as a card using the existing table rendering logic
    // But we need to modify it to pass card data for inline editing
    this.renderKanbanCards(cardsContainer, rows, headers, settings, component);
  }

  /**
   * Render kanban cards with inline editing support
   *
   * @param container The container element
   * @param rows The table rows
   * @param headers The table headers
   * @param settings The merged settings
   * @param component The parent component for lifecycle management
   */
  private renderKanbanCards(
    container: HTMLElement,
    rows: any[][],
    headers: string[],
    settings: DataCardsSettings,
    component: Component
  ): void {
    // Create a card for each row
    rows.forEach((row: any[] & { file?: any; path?: any; source?: any; originalFile?: any }, rowIndex: number) => {
      Logger.debug(`Processing kanban row ${rowIndex}`);

      const card = this.createCardElement(container);

      // Add image if available
      if (settings.imageProperty && row[headers.indexOf(settings.imageProperty)] !== undefined) {
        this.addImageToCard(card, row[headers.indexOf(settings.imageProperty)]);
      }

      // Add content container
      const contentEl = card.createEl('div', { cls: 'datacards-content' });

      // First, add the file property separately if it exists
      const fileIndex = headers.findIndex((h: string) => h.toLowerCase() === 'file');
      if (fileIndex !== -1 && row[fileIndex] !== undefined) {
        const filePropertyEl = contentEl.createEl('div', {
          cls: 'datacards-property datacards-file-property-container',
        });

        this.formatFileProperty(filePropertyEl, row[fileIndex]);

        // If clickable cards are enabled, make the card clickable
        if (settings.enableClickableCards) {
          this.makeCardClickable(card, row[fileIndex]);
        }
      }

      // Create a properties container
      const propertiesContainer = contentEl.createEl('div', {
        cls: 'datacards-properties-container',
      });

      // Determine if properties should be scrollable
      const shouldScroll = this.shouldUseScrollableProperties(settings);

      // Apply scrollable class and height if needed
      if (shouldScroll) {
        propertiesContainer.addClass('datacards-scrollable-properties');

        // Set content height via data attribute
        const contentHeight = this.getContentHeight(settings);
        propertiesContainer.setAttribute('data-content-height', contentHeight);
        propertiesContainer.addClass(`datacards-content-height-${contentHeight.replace('px', '')}`);
      }

      // Determine which properties to show
      const propertiesToShow = settings.properties === 'all'
        ? headers
        : Array.isArray(settings.properties) ? settings.properties : [];

      // Filter out excluded properties and the file property
      const filteredProperties = propertiesToShow.filter((prop: string) =>
        !settings.exclude.includes(prop) &&
        prop !== settings.imageProperty &&
        prop.toLowerCase() !== 'file'
      );

      Logger.debug(`Using all headers as properties:`, headers);
      Logger.debug(`Filtered properties (after excluding file):`, filteredProperties);

      // Add each property to the properties container
      filteredProperties.forEach((property: string) => {
        const propIndex = headers.indexOf(property);
        if (propIndex !== -1) {
          const propValue = row[propIndex];
          Logger.debug(`Checking property '${property}' in headers: true`);
          Logger.debug(`Property '${property}' value:`, propValue);
          Logger.debug(`Property '${property}' type:`, typeof propValue);
          Logger.debug(`Adding property to card: ${property} = ${propValue}`);

          // Create card data object for inline editing
          const fileData = row[fileIndex];
          console.log('File data for card:', fileData);
          console.log('File data type:', typeof fileData);
          console.log('File data keys:', Object.keys(fileData || {}));

          const cardData = {
            file: fileData,
            path: fileData?.path,
            source: fileData,
            originalFile: fileData,
            // Also try to extract the path directly if it's a string
            filePath: typeof fileData === 'string' ? fileData : fileData?.path
          };

          // Use the standard property formatting, passing the component and card data
          this.addPropertyToCard(propertiesContainer, property, propValue, settings, component, cardData);
        } else {
          Logger.debug(`Property '${property}' not found in headers`);
        }
      });

      // If no properties were added, add a debug message
      if (filteredProperties.length === 0 && !headers.some((h: string) => h.toLowerCase() === 'file')) {
        Logger.debug('No properties were added to the card');
        contentEl.createEl('div', {
          cls: 'datacards-property',
          text: 'No properties to display'
        });
      }
    });
  }

  /**
   * Show modal for creating a new task
   *
   * @param statusValue The status value for the new task (based on column)
   * @param settings The current settings
   * @param component The parent component for lifecycle management
   */
  private showNewTaskModal(statusValue: string, settings: DataCardsSettings, component: Component): void {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'datacards-new-task-modal-overlay';

    // Create modal content
    const modalContent = modal.createEl('div', {
      cls: 'datacards-new-task-modal'
    });

    // Modal header
    const header = modalContent.createEl('div', {
      cls: 'datacards-modal-header'
    });
    header.createEl('h3', {
      text: `New Task - ${statusValue}`,
      cls: 'datacards-modal-title'
    });

    // Close button
    const closeBtn = header.createEl('button', {
      cls: 'datacards-modal-close',
      text: '×'
    });

    // Modal body
    const body = modalContent.createEl('div', {
      cls: 'datacards-modal-body'
    });

    // Title input
    const titleGroup = body.createEl('div', {
      cls: 'datacards-form-group'
    });
    titleGroup.createEl('label', {
      text: 'Title *',
      cls: 'datacards-form-label'
    });
    const titleInput = titleGroup.createEl('input', {
      type: 'text',
      cls: 'datacards-form-input',
      attr: {
        placeholder: 'Enter task title...',
        required: 'true'
      }
    });

    // Template fields
    let template = settings.newTaskTemplate || {};

    // Debug the template parsing
    console.log('=== TEMPLATE DEBUG ===');
    console.log('Raw newTaskTemplate:', settings.newTaskTemplate);
    console.log('Template type:', typeof settings.newTaskTemplate);
    console.log('Template value:', template);

    // If template is a string, try to parse it as JSON
    if (typeof template === 'string') {
      try {
        template = JSON.parse(template);
        console.log('Parsed template from string:', template);
      } catch (error) {
        console.error('Failed to parse template string:', error);
        template = {};
      }
    }

    // Ensure template is an object
    if (!template || typeof template !== 'object') {
      console.log('Template is not an object, using default');
      template = {
        priority: '',
        assignee: ''
      };
    }

    console.log('Final template to use:', template);
    console.log('=== END TEMPLATE DEBUG ===');

    const templateInputs: Record<string, HTMLInputElement> = {};

    Object.entries(template).forEach(([key, defaultValue]) => {
      if (key === 'status') return; // Skip status as it's set by column

      console.log(`Creating field for: ${key} = ${defaultValue}`);

      const fieldGroup = body.createEl('div', {
        cls: 'datacards-form-group'
      });
      fieldGroup.createEl('label', {
        text: key.charAt(0).toUpperCase() + key.slice(1),
        cls: 'datacards-form-label'
      });
      const input = fieldGroup.createEl('input', {
        type: 'text',
        cls: 'datacards-form-input',
        attr: {
          placeholder: `Enter ${key}...`
        }
      });
      input.value = String(defaultValue || '');
      templateInputs[key] = input;
    });

    // Modal footer
    const footer = modalContent.createEl('div', {
      cls: 'datacards-modal-footer'
    });

    const cancelBtn = footer.createEl('button', {
      text: 'Cancel',
      cls: 'datacards-btn datacards-btn-secondary'
    });

    const createBtn = footer.createEl('button', {
      text: 'Create Task',
      cls: 'datacards-btn datacards-btn-primary'
    });

    // Event handlers
    const closeModal = () => {
      modal.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Create task handler
    createBtn.addEventListener('click', async () => {
      const title = titleInput.value.trim();
      if (!title) {
        titleInput.focus();
        titleInput.style.borderColor = 'var(--color-red)';
        return;
      }

      try {
        await this.createNewTask(title, statusValue, templateInputs, settings);
        closeModal();
      } catch (error) {
        console.error('Error creating new task:', error);
        // Could show error message in modal
      }
    });

    // Focus title input and handle Enter key
    titleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        createBtn.click();
      }
    });

    // Add modal to DOM
    document.body.appendChild(modal);
    titleInput.focus();
  }

  /**
   * Create a new task note
   *
   * @param title The task title
   * @param statusValue The status value
   * @param templateInputs The template field inputs
   * @param settings The current settings
   */
  private async createNewTask(
    title: string,
    statusValue: string,
    templateInputs: Record<string, HTMLInputElement>,
    settings: DataCardsSettings
  ): Promise<void> {
    try {
      // Build frontmatter
      const frontmatter: Record<string, any> = {
        title: title,
        status: statusValue
      };

      // Add template fields
      Object.entries(templateInputs).forEach(([key, input]) => {
        const value = input.value.trim();
        console.log(`Adding template field: ${key} = "${value}"`);
        // Always add the field, even if empty (user might want empty values)
        frontmatter[key] = value;
      });

      // Generate filename
      const filename = this.generateFilename(title);

      // Determine file path
      const folderPath = settings.newTaskPath || '';
      const fullPath = folderPath ? `${folderPath}/${filename}` : filename;

      // Create frontmatter string
      const frontmatterString = Object.entries(frontmatter)
        .map(([key, value]) => {
          // Properly quote string values
          const quotedValue = typeof value === 'string' ? `"${value}"` : value;
          return `${key}: ${quotedValue}`;
        })
        .join('\n');

      console.log('Generated frontmatter:', frontmatterString);

      // Create file content
      const content = `---\n${frontmatterString}\n---\n\n# ${title}\n\n`;

      // Create the file
      const file = await this.app.vault.create(fullPath, content);

      console.log('Created new task:', file.path);

      // Open the file
      const leaf = this.app.workspace.getLeaf(false);
      await leaf.openFile(file);

      // Trigger refresh of DataCards
      setTimeout(() => {
        this.triggerRefresh();
      }, 100);

    } catch (error) {
      console.error('Error creating task file:', error);
      throw error;
    }
  }

  /**
   * Generate a filename from a title
   *
   * @param title The task title
   * @returns Safe filename
   */
  private generateFilename(title: string): string {
    // Remove invalid characters and replace spaces with hyphens
    const safeName = title
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase();

    return `${safeName}.md`;
  }





  /**
   * Apply custom color styling to a kanban column
   *
   * @param column The column element
   * @param colorName The color name (e.g., 'blue', 'green', '#ff0000')
   * @param statusValue The status value for this column
   */
  private applyKanbanColumnColor(column: HTMLElement, colorName: string, statusValue: string): void {
    // Color mapping for common color names to CSS variables and RGB values
    const colorMap: Record<string, { cssVar: string; rgb: string; fallback: string }> = {
      'blue': { cssVar: 'var(--color-blue)', rgb: 'var(--color-blue-rgb, 0, 122, 255)', fallback: '#007aff' },
      'green': { cssVar: 'var(--color-green)', rgb: 'var(--color-green-rgb, 52, 199, 89)', fallback: '#34c759' },
      'orange': { cssVar: 'var(--color-orange)', rgb: 'var(--color-orange-rgb, 255, 149, 0)', fallback: '#ff9500' },
      'red': { cssVar: 'var(--color-red)', rgb: 'var(--color-red-rgb, 255, 59, 48)', fallback: '#ff3b30' },
      'purple': { cssVar: 'var(--color-purple)', rgb: 'var(--color-purple-rgb, 175, 82, 222)', fallback: '#af52de' },
      'pink': { cssVar: 'var(--color-pink)', rgb: 'var(--color-pink-rgb, 255, 45, 85)', fallback: '#ff2d55' },
      'yellow': { cssVar: 'var(--color-yellow)', rgb: 'var(--color-yellow-rgb, 255, 204, 0)', fallback: '#ffcc00' },
      'gray': { cssVar: 'var(--text-muted)', rgb: '142, 142, 147', fallback: '#8e8e93' },
      'grey': { cssVar: 'var(--text-muted)', rgb: '142, 142, 147', fallback: '#8e8e93' }
    };

    let statusColor: string;
    let statusRgb: string;

    if (colorMap[colorName.toLowerCase()]) {
      // Use predefined color
      const color = colorMap[colorName.toLowerCase()];
      statusColor = color.cssVar;
      statusRgb = color.rgb;
    } else if (colorName.startsWith('#')) {
      // Handle hex colors
      statusColor = colorName;
      statusRgb = this.hexToRgb(colorName);
    } else {
      // Fallback to gray
      statusColor = colorMap.gray.cssVar;
      statusRgb = colorMap.gray.rgb;
    }

    // Set CSS custom properties on the column
    column.style.setProperty('--kanban-status-color', statusColor);
    column.style.setProperty('--kanban-card-accent', statusRgb);
  }

  /**
   * Convert hex color to RGB values
   *
   * @param hex The hex color (e.g., '#ff0000')
   * @returns RGB string (e.g., '255, 0, 0')
   */
  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `${r}, ${g}, ${b}`;
    }
    return '142, 142, 147'; // Fallback to gray
  }

  /**
   * Sort groups by the specified status order
   *
   * @param groups The groups to sort
   * @param settings The settings containing status order
   * @returns Sorted groups
   */
  private sortGroupsByStatusOrder(groups: any[], settings: DataCardsSettings): any[] {
    if (!settings.kanbanStatusOrder || settings.kanbanStatusOrder.length === 0) {
      return groups;
    }

    return [...groups].sort((a, b) => {
      const aIndex = settings.kanbanStatusOrder.indexOf(a.key);
      const bIndex = settings.kanbanStatusOrder.indexOf(b.key);

      // If both are in the order array, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      // If only one is in the order array, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      // If neither is in the order array, maintain original order
      return 0;
    });
  }

  /**
   * Create a kanban column for a group
   *
   * @param container The container element
   * @param group The group data
   * @param settings The merged settings
   * @param component The parent component for lifecycle management
   */
  private createKanbanColumn(container: HTMLElement, group: any, settings: DataCardsSettings, component: Component): void {
    // Create column container
    const column = container.createEl('div', {
      cls: 'datacards-kanban-column'
    });

    // Create column header
    const header = column.createEl('div', {
      cls: 'datacards-kanban-header'
    });

    // Add group title
    const title = header.createEl('span', {
      cls: 'datacards-kanban-title',
      text: group.key
    });

    // Add card count if enabled
    if (settings.kanbanShowColumnCounts) {
      header.createEl('span', {
        cls: 'datacards-kanban-count',
        text: `(${group.rows.length})`
      });
    }

    // Create cards container within the column
    const cardsContainer = column.createEl('div', {
      cls: 'datacards-kanban-cards'
    });

    // Apply compact cards class if enabled
    if (settings.kanbanCompactCards) {
      cardsContainer.addClass('datacards-kanban-compact');
    }

    // Render the cards in this column
    if (group.rows && group.rows.length > 0) {
      console.log(`=== KANBAN COLUMN DEBUG: ${group.key} ===`);
      console.log(`Number of rows: ${group.rows.length}`);
      console.log(`First row:`, group.rows[0]);
      console.log(`First row keys:`, Object.keys(group.rows[0] || {}));
      console.log(`All rows:`, group.rows);
      console.log(`=== END COLUMN DEBUG ===`);

      // GROUP BY results have object-based rows, not array-based
      // We need to render them as array results instead of table results
      this.renderArrayResults(cardsContainer, group.rows, settings, component);
    }
  }

  /**
   * Extract headers from rows for GROUP BY results
   *
   * @param rows The rows to extract headers from
   * @returns Array of header names
   */
  private extractHeadersFromRows(rows: any[]): string[] {
    if (!rows || rows.length === 0) {
      return [];
    }

    // Get all unique keys from all rows
    const headerSet = new Set<string>();

    rows.forEach(row => {
      if (row && typeof row === 'object') {
        Object.keys(row).forEach(key => headerSet.add(key));
      }
    });

    return Array.from(headerSet);
  }
}
