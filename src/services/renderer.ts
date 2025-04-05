import { App, TFile, Platform } from 'obsidian';
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
   */
  public renderCards(container: HTMLElement, results: any, blockSettings: BlockSettings): void {
    // SPECIAL CHECK: Log the exact structure of the results
    Logger.debug('SPECIAL CHECK - renderCards called with results:', results);
    
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
    
    // Add preset class first
    cardsContainer.addClass(`datacards-preset-${settings.preset}`);
    
    // Add no-shadows class if shadows are disabled
    if (!settings.enableShadows) {
      cardsContainer.addClass('datacards-no-shadows');
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
    
    // Set only the non-preset specific CSS variables
    // This allows the preset class to control preset-specific variables
    cardsContainer.style.setProperty('--card-gap', `${settings.cardSpacing}px`);
    
    // Determine columns based on preset and device type
    let columnsToUse: number;
    
    if (isMobile) {
      // On mobile, use mobileColumns setting
      columnsToUse = settings.mobileColumns;
    } else {
      // On desktop, use preset's recommended columns or block-specific override
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
      
      // Use block-specific columns setting if provided in the code block
      columnsToUse = (blockSettings.columns !== undefined) ? blockSettings.columns : recommendedColumns;
    }
    
    Logger.debug(`Using ${columnsToUse} columns`);
    
    // Set columns with !important to override media queries
    cardsContainer.style.setProperty('--card-columns', columnsToUse.toString(), 'important');
    
    // Set image height and fit based on preset if not explicitly provided
    
    // For image height
    let imageHeight;
    if (blockSettings.imageHeight !== undefined) {
      // Use explicitly provided height from block settings
      imageHeight = settings.imageHeight;
    } else {
      // Use preset-specific default height
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
    }
    
    // Ensure imageHeight has a unit (px) if it's a number or numeric string
    if (typeof imageHeight === 'number' || /^\d+$/.test(imageHeight)) {
      imageHeight = `${imageHeight}px`;
    }
    cardsContainer.style.setProperty('--image-height', imageHeight);
    
    // For image fit
    if (blockSettings.imageFit !== undefined) {
      // Use explicitly provided fit from block settings
      cardsContainer.style.setProperty('--image-fit', settings.imageFit);
    } else {
      // Use preset-specific default fit
      const defaultFit = settings.preset === 'portrait' ? 'contain' : 'cover';
      cardsContainer.style.setProperty('--image-fit', defaultFit);
    }
    
    // Handle different types of Dataview results
    if (results && results.values && Array.isArray(results.values)) {
      Logger.debug('Detected table-like results with values array');
      // Handle table-like results (most common)
      this.renderTableResults(cardsContainer, results, settings);
    } else if (results && Array.isArray(results)) {
      Logger.debug('Detected array results');
      // Handle array results
      this.renderArrayResults(cardsContainer, results, settings);
    } else if (results && typeof results === 'object') {
      Logger.debug('Detected object results');
      // Handle object results
      this.renderObjectResults(cardsContainer, results, settings);
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
    const errorEl = container.createEl('div', {
      cls: 'datacards-error',
      text: message,
    });
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
    
    Logger.debug('Created cards container for empty state');
    
    // Add the empty state message with appropriate styling
    const emptyStateEl = cardsContainer.createEl('div', {
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
   */
  private renderTableResults(container: HTMLElement, results: any, settings: DataCardsSettings): void {
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
        
        // Set content height as CSS variable
        const contentHeight = this.getContentHeight(settings);
        propertiesContainer.style.setProperty('--content-height', contentHeight);
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
          
          // Use the standard property formatting
          this.addPropertyToCard(propertiesContainer, property, propValue, settings);

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
   */
  private renderArrayResults(container: HTMLElement, results: any[], settings: DataCardsSettings): void {
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
        
        // Set content height as CSS variable
        const contentHeight = this.getContentHeight(settings);
        propertiesContainer.style.setProperty('--content-height', contentHeight);
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
          this.addPropertyToCard(propertiesContainer, property, item[property], settings);
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
   */
  private renderObjectResults(container: HTMLElement, results: any, settings: DataCardsSettings): void {
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
        
        // Set content height as CSS variable
        const contentHeight = this.getContentHeight(settings);
        propertiesContainer.style.setProperty('--content-height', contentHeight);
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
          this.addPropertyToCard(propertiesContainer, property, results[property], settings);
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
   * @param imageValue The image value (path, URL, or Link object)
   */
  private addImageToCard(card: HTMLElement, imageValue: any): void {
    const imageContainer = card.createEl('div', {
      cls: 'datacards-image-container',
    });
    
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
      this.loadImage(imageContainer, placeholder, imagePath);
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
    
    // First check for markdown image syntax: ![alt text](url) or ![|size](url)
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
          
          // Load the image
          this.loadImage(imageContainer, placeholder, imagePath);
          
          // Stop observing once loaded
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
  private loadImage(imageContainer: HTMLElement, placeholder: HTMLElement, imagePath: string): void {
    // Check for markdown image syntax: ![alt text](url) or ![|size](url)
    const markdownImageMatch = imagePath.match(/!\[(.*?)\]\((.*?)\)/);
    if (markdownImageMatch) {
      // Extract the URL from the markdown image syntax
      const imageUrl = markdownImageMatch[2];
      Logger.debug('Extracted URL from markdown image syntax:', imageUrl);
      
      // Use the extracted URL for loading
      this.loadImage(imageContainer, placeholder, imageUrl);
      return;
    }
    
    // Handle different image formats
    if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
      Logger.debug('Handling as external URL:', imagePath);
      
      // Clean the URL - remove any trailing punctuation or quotes that might have been included
      const cleanUrl = imagePath.replace(/['",.;:]+$/, '');
      Logger.debug('Cleaned URL:', cleanUrl);
      
      // Try to load the image with multiple approaches
      this.loadExternalImage(imageContainer, placeholder, cleanUrl);
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
        // Check if it's a TFile (has a stat property which is a characteristic of TFile)
        if (abstractFile && 'stat' in abstractFile) {
          Logger.debug('Found file in vault:', abstractFile);
          // Cast to TFile and get the URL for the file
          const file = abstractFile as TFile;
          const resourcePath = this.app.vault.getResourcePath(file);
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
        // Use warn level for image loading errors since they're handled gracefully
        Logger.warn('Error loading image:', error);
        // Update placeholder for error
        placeholder.setText('Error loading image');
      }
    } else {
      Logger.debug('Handling as local path');
      // Assume local path in the vault
      try {
        // Get the file from the vault
        const abstractFile = this.app.vault.getAbstractFileByPath(imagePath);
        // Check if it's a TFile (has a stat property which is a characteristic of TFile)
        if (abstractFile && 'stat' in abstractFile) {
          Logger.debug('Found file in vault:', abstractFile);
          // Cast to TFile and get the URL for the file
          const file = abstractFile as TFile;
          const resourcePath = this.app.vault.getResourcePath(file);
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
        // Use warn level for image loading errors since they're handled gracefully
        Logger.warn('Error loading image:', error);
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
  private loadExternalImage(imageContainer: HTMLElement, placeholder: HTMLElement, url: string): void {
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
    img.onerror = (error) => {
      // Use warn instead of error for CORS issues since they're expected and handled with fallbacks
      Logger.warn('Failed to load external image with crossorigin attribute:', url);
      
      // Second attempt: without crossorigin attribute
      Logger.debug('Trying again without crossorigin attribute');
      img.removeAttribute('crossorigin');
      
      img.onload = () => {
        Logger.debug('External image loaded successfully without crossorigin:', url);
        placeholder.remove();
        img.addClass('loaded');
      };
      
      img.onerror = (secondError) => {
        // Use warn instead of error for CORS issues since they're expected and handled with fallbacks
        Logger.warn('Failed to load external image without crossorigin:', url);
        
        // Third attempt: using a proxy service if available
        // This is a common approach to bypass CORS issues
        const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
        Logger.debug('Trying with image proxy service:', proxyUrl);
        
        img.src = proxyUrl;
        
        img.onload = () => {
          Logger.debug('External image loaded successfully via proxy:', proxyUrl);
          placeholder.remove();
          img.addClass('loaded');
        };
        
        img.onerror = (thirdError) => {
          // Log as warning since this is an expected issue with external images
          Logger.warn('All attempts to load image failed:', url);
          placeholder.setText('Image not found - URL: ' + url);
          
          // Create a hidden iframe to try to load the image
          // This can help diagnose if the image exists but has CORS issues
          try {
            const testImg = document.createElement('img');
            testImg.style.display = 'none';
            testImg.src = url;
            document.body.appendChild(testImg);
            
            // Remove the test image after a short delay
            setTimeout(() => {
              if (document.body.contains(testImg)) {
                document.body.removeChild(testImg);
              }
            }, 3000);
          } catch (e) {
            // Use debug level for this diagnostic error since it's not critical
            Logger.debug('Error during final test:', e);
          }
        };
      };
    };
  }

  /**
   * Add a property to a card
   * 
   * @param contentEl The content element to add the property to
   * @param propertyName The name of the property
   * @param propertyValue The value of the property
   * @param settings The settings
   */
  private addPropertyToCard(
    contentEl: HTMLElement, 
    propertyName: string, 
    propertyValue: any, 
    settings: DataCardsSettings
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
    } else {
      // Check if there's a custom formatter for this property
      const formatter = settings.propertyFormatters[propertyName];
      
      if (formatter) {
        // Use custom formatter
        this.formatPropertyWithCustomFormatter(propertyEl, propertyValue, formatter);
      } else {
        // Use default formatting based on value type
        this.formatPropertyByType(propertyEl, propertyValue);
      }
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
        this.formatAsTags(valueEl, value, formatter.options);
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
   * @returns True if the content was processed, false if it should be handled by other formatters
   */
  private processRichText(container: HTMLElement, value: string): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    
    Logger.debug('Processing rich text:', value);
    
    // Use a more robust regex to detect HTML, including <br>
    const hasHtml = /<[a-z][\s\S]*>/i.test(value);
    const hasWikiLinks = value.includes('[['); // No need to check for ']]' if '[[' is present
    
    
    // If it doesn't have either, let other formatters handle it
    if (!hasWikiLinks && !hasHtml) {
      Logger.debug('Content is plain text, skipping rich text processing.');
      return false;
    }
    
    Logger.debug(`Content has wiki links: ${hasWikiLinks}, has HTML: ${hasHtml}`);
    
    // Tokenize the content to separate wiki links, HTML tags, and plain text
    const tokens = this.tokenizeRichText(value);
    Logger.debug('Tokens:', tokens);
    
    // Process each token and add to the container
    tokens.forEach(token => {
      if (token.type === 'wikilink') {
        // Process wiki link
        this.createWikiLink(container, token.content);
      } else if (token.type === 'html') {
        // Process HTML - use createFragment to handle tags like <br> correctly
        const fragment = document.createDocumentFragment();
        const tempDiv = fragment.createDiv();
        tempDiv.innerHTML = token.content; // Use innerHTML to parse the tag
        // Append all child nodes (including text nodes if any) from tempDiv to the container
        while (tempDiv.firstChild) {
          container.appendChild(tempDiv.firstChild);
        }
      } else {
        // Process plain text - explicitly create and append a text node
        const textNode = document.createTextNode(token.content);
        container.appendChild(textNode);
      }
    });

    return true; // Indicate that the content was processed
  }
  
  /**
   * Tokenize rich text into wiki links, HTML tags/entities, and plain text segments
   * 
   * @param text The text to tokenize
   * @returns Array of tokens with type and content
   */
  private tokenizeRichText(text: string): Array<{type: 'wikilink' | 'html' | 'text', content: string}> {
    const tokens: Array<{type: 'wikilink' | 'html' | 'text', content: string}> = [];
    
    // Regex to find wiki links OR HTML tags/entities
    // [[...]] captures wiki links
    // <...> captures HTML tags
    // &...; captures HTML entities
    const combinedRegex = /(\[\[.*?\]\])|(<[^>]+>|&[a-zA-Z#0-9]+;)/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = combinedRegex.exec(text)) !== null) {
      // Add preceding plain text if any
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      
      // Add the matched token (wiki link or HTML)
      if (match[1]) { // Wiki link
        tokens.push({ type: 'wikilink', content: match[1] });
      } else if (match[2]) { // HTML tag or entity
        tokens.push({ type: 'html', content: match[2] });
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
      Logger.warn('Invalid wiki link format passed to createWikiLink:', wikiLinkText);
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
      Logger.warn('Error registering hover link:', error);
    }
  }

  /**
   * Format a property value based on its type
   * 
   * @param propertyEl The property element
   * @param value The property value
   */
  private formatPropertyByType(propertyEl: HTMLElement, value: any): void {
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
          } else {
            // Not a wiki link, try processing as rich text (handles HTML like <br>)
            Logger.debug(`Treating array item as plain/rich text: ${cleanItem}`);
            // If processRichText returns false, it means it was plain text and wasn't handled
            if (!this.processRichText(valueEl, cleanItem)) {
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
            cls: 'datacards-checkbox',
            attr: {
              type: 'checkbox',
              disabled: 'disabled',
              'data-boolean-value': value.toString(),
              style: 'display: none;' // Hide it visually
            },
          });
          hiddenCheckbox.checked = value;
        }
        
        const textSpan = booleanContainer.createEl('span', {
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
      if (this.processRichText(valueEl, value)) {
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
          // Use warn instead of error for image loading issues since they're expected and handled with fallbacks
          Logger.warn('Failed to load property image:', imageUrl);
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
        const tag = valueEl.createEl('a', {
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
      
      // If none of the above, treat as plain text
      Logger.debug('Treating value as plain text:', value);
      valueEl.setText(value);
      
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
      badge.style.backgroundColor = options.color;
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
    
    const progressBar = progressContainer.createEl('div', {
      cls: 'datacards-progress-bar',
    });
    
    progressBar.style.width = `${percentage}%`;
    
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
    
    // Simple date formatting
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    let formattedDate = format
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day);
    
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
        const link = valueEl.createEl('a', {
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
      const link = valueEl.createEl('a', {
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
      
      const link = valueEl.createEl('a', {
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
   * @param options Formatting options
   */
  private formatAsTags(container: HTMLElement, value: string | string[], options?: any): void {
    const tagsContainer = container.createEl('div', {
      cls: 'datacards-tags-container',
    });
    
    const tags = Array.isArray(value) ? value : [value];
    
    tags.forEach((tag: string) => {
      // Ensure tag starts with #
      const tagText = tag.startsWith('#') ? tag : `#${tag}`;
      
      // Create a clickable tag link
      const tagEl = tagsContainer.createEl('a', {
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
}
