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
    });
    
    // Add preset class first
    cardsContainer.addClass(`datacards-preset-${settings.preset}`);
    
    // Add no-shadows class if shadows are disabled
    if (!settings.enableShadows) {
      cardsContainer.addClass('datacards-no-shadows');
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
    values.forEach((row: any[], rowIndex: number) => {
      Logger.debug(`Processing row ${rowIndex}`);
      const card = this.createCardElement(container);
      
      // Add image if available
      if (settings.imageProperty && headers.includes(settings.imageProperty)) {
        const imageIndex = headers.indexOf(settings.imageProperty);
        const imageValue = row[imageIndex];
        Logger.debug(`Image property '${settings.imageProperty}' value:`, imageValue);
        if (imageValue) {
          this.addImageToCard(card, imageValue);
        }
      } else if (settings.imageProperty) {
        Logger.debug(`Image property '${settings.imageProperty}' not found in headers:`, headers);
      }
      
      // Add content container
      const contentEl = card.createEl('div', { cls: 'datacards-content' });
      
      // First, add the file property separately if it exists in headers
      // This ensures it's always displayed first, directly under the image
      if (headers.includes('File') || headers.includes('file')) {
        const fileIndex = headers.findIndex((h: string) => h.toLowerCase() === 'file');
        if (fileIndex >= 0) {
          const fileValue = row[fileIndex];
          Logger.debug('File property value:', fileValue);
          
          // Add file property with special styling
          const filePropertyEl = contentEl.createEl('div', {
            cls: 'datacards-property datacards-file-property-container',
          });
          
          // Don't show label for file property
          this.formatFileProperty(filePropertyEl, fileValue);
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
          console.log(`Property '${property}' value:`, propValue);
          console.log(`Property '${property}' type:`, typeof propValue);
          
          // Special handling for wiki links in property values
          if (typeof propValue === 'string' && propValue.includes('[[') && propValue.includes(']]')) {
            console.log(`Found wiki link in property '${property}':`, propValue);
            
            // Create a special property element for wiki links
            const propertyEl = propertiesContainer.createEl('div', {
              cls: 'datacards-property',
            });
            
            // Add label if enabled
            if (settings.showLabels) {
              propertyEl.createEl('div', {
                cls: 'datacards-property-label',
                text: property,
              });
            }
            
            // Create value container
            const valueEl = propertyEl.createEl('div', {
              cls: 'datacards-property-value',
            });
            
            // Extract path and display text from wiki link
            const wikiLinkMatch = propValue.match(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/);
            if (wikiLinkMatch) {
              const path = wikiLinkMatch[1];
              const displayText = wikiLinkMatch[2] || this.getCleanFilename(path);
              
              console.log(`Creating direct link for wiki link: path="${path}", display="${displayText}"`);
              
              // Create link element directly
              const link = valueEl.createEl('a', {
                cls: 'internal-link',
                text: displayText,
                attr: { 
                  href: path,
                  'data-href': path,
                  'data-type': 'link'
                }
              });
              
              // Register the link with Obsidian's click handler
              this.app.workspace.trigger('hover-link', {
                event: new MouseEvent('mouseover'),
                source: 'preview',
                hoverEl: link,
                targetEl: link,
                linktext: path
              });
            } else {
              // Fallback to regular text if we can't parse the wiki link
              valueEl.setText(propValue);
            }
          } else {
            // Use the standard property formatting for non-wiki links
            this.addPropertyToCard(propertiesContainer, property, propValue, settings);
          }
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
      
      // First, add the file property separately if it exists
      if ('file' in item) {
        const filePropertyEl = contentEl.createEl('div', {
          cls: 'datacards-property datacards-file-property-container',
        });
        
        this.formatFileProperty(filePropertyEl, item['file']);
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
    return container.createEl('div', {
      cls: 'datacards-card',
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
        Logger.error('Error loading image:', error);
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
        Logger.error('Error loading image:', error);
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
      Logger.error('Failed to load external image with crossorigin attribute:', url, error);
      
      // Second attempt: without crossorigin attribute
      Logger.debug('Trying again without crossorigin attribute');
      img.removeAttribute('crossorigin');
      
      img.onload = () => {
        Logger.debug('External image loaded successfully without crossorigin:', url);
        placeholder.remove();
        img.addClass('loaded');
      };
      
      img.onerror = (secondError) => {
        Logger.error('Failed to load external image without crossorigin:', url, secondError);
        
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
          Logger.error('All attempts to load image failed:', url, thirdError);
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
            Logger.error('Error during final test:', e);
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
      propertyEl.createEl('div', {
        cls: 'datacards-property-label',
        text: displayName,
      });
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
    
    if (value === null || value === undefined) {
      valueEl.setText('');
    } else if (Array.isArray(value)) {
      // Format as comma-separated list
      valueEl.setText(value.join(', '));
    } else if (typeof value === 'boolean') {
      // Format as checkbox
      const checkbox = valueEl.createEl('input', {
        attr: {
          type: 'checkbox',
          checked: value ? 'checked' : '',
          disabled: 'disabled',
        },
      });
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
      
      // Check if the string contains a wiki link or URL and extract it
      // This helps with expressions that result in strings containing wiki links or URLs
      const extractedValue = this.extractImageSource(value);
      if (extractedValue !== value) {
        // If a wiki link was extracted, format it as a wiki link
        this.formatPropertyByType(propertyEl, extractedValue);
        return;
      }
      
      // Direct approach for wiki links - just set the text to the display part
      // This is a workaround for when the link is not being properly rendered
      if (typeof value === 'string' && value.includes('[[') && value.includes('|') && value.includes(']]')) {
        // Extract the display text part (after the pipe)
        const match = value.match(/\[\[.*\|(.*?)\]\]/);
        if (match && match[1]) {
          // Just use the display text directly
          valueEl.setText(match[1]);
          return;
        }
      }
      
      // More general case for wiki links
      // This handles cases where Dataview returns the full wiki link syntax as a string
      if (value.includes('[[') && value.includes(']]')) {
        console.log('DATACARDS DEBUG: Found wiki link in property value:', value);
        Logger.debug('Found wiki link in property value:', value);
        
        // Try to extract the wiki link with a more robust regex that can handle various formats
        const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/;
        const wikiLinkMatch = value.match(wikiLinkRegex);
        
        if (wikiLinkMatch) {
          console.log('DATACARDS DEBUG: Wiki link match:', wikiLinkMatch);
          Logger.debug('Wiki link match:', wikiLinkMatch);
          
          // Extract path and display text
          const path = wikiLinkMatch[1];
          // Use the display text if provided, otherwise use the clean filename
          const displayText = wikiLinkMatch[2] || this.getCleanFilename(path);
          
          console.log(`DATACARDS DEBUG: Wiki link path: "${path}", display text: "${displayText}"`);
          Logger.debug(`Wiki link path: "${path}", display text: "${displayText}"`);
          
          // Create a proper Obsidian internal link using the same approach as formatFileProperty
          console.log('DATACARDS DEBUG: Creating link element for wiki link');
          const link = valueEl.createEl('a', {
            cls: 'internal-link datacards-file-link',
            text: displayText,
            attr: { 
              href: path,
              'data-href': path,
              'data-type': 'link'
            }
          });
          console.log('DATACARDS DEBUG: Link element created:', link);
          
          // Register the link with Obsidian's click handler
          this.app.workspace.trigger('hover-link', {
            event: new MouseEvent('mouseover'),
            source: 'preview',
            hoverEl: link,
            targetEl: link,
            linktext: path
          });
          
          return;
        }
      }
      
      // Check for markdown image syntax: ![alt text](url) or ![|size](url)
      const markdownImageMatch = value.match(/!\[(.*?)\]\((.*?)\)/);
      if (markdownImageMatch) {
        Logger.debug('Found markdown image in property value');
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
          Logger.error('Failed to load property image:', imageUrl);
          // Remove the image
          img.remove();
          // Add error class and message
          valueEl.removeClass('loading');
          valueEl.addClass('image-error');
          valueEl.setText('Image not found: ' + imageUrl);
        };
        
        return;
      }
      
      if (value.startsWith('[[') && value.endsWith(']]')) {
        // Wiki link
        console.log('DATACARDS DEBUG: Processing wiki link that starts and ends with [[]]:', value);
        Logger.debug('Processing wiki link that starts and ends with [[]]:', value);
        
        // Use the same robust regex as above
        const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/;
        const wikiLinkMatch = value.match(wikiLinkRegex);
        
        if (wikiLinkMatch) {
          // Extract path and display text
          const path = wikiLinkMatch[1];
          // Use the display text if provided, otherwise use the clean filename
          const displayText = wikiLinkMatch[2] || this.getCleanFilename(path);
          
          console.log(`DATACARDS DEBUG: Wiki link path: "${path}", display text: "${displayText}"`);
          Logger.debug(`Wiki link path: "${path}", display text: "${displayText}"`);
          
          // Create a proper Obsidian internal link using the same approach as formatFileProperty
          console.log('DATACARDS DEBUG: Creating link element for wiki link (direct match)');
          const link = valueEl.createEl('a', {
            cls: 'internal-link datacards-file-link',
            text: displayText,
            attr: { 
              href: path,
              'data-href': path,
              'data-type': 'link'
            }
          });
          console.log('DATACARDS DEBUG: Link element created (direct match):', link);
          
          // Register the link with Obsidian's click handler
          this.app.workspace.trigger('hover-link', {
            event: new MouseEvent('mouseover'),
            source: 'preview',
            hoverEl: link,
            targetEl: link,
            linktext: path
          });
        } else {
          // Fallback to the old method if the regex doesn't match
          const linkText = value.substring(2, value.length - 2);
          
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
          
          Logger.debug(`Fallback wiki link path: "${path}", display text: "${displayText}"`);
          
          // Create a proper Obsidian internal link using the same approach as formatFileProperty
          const link = valueEl.createEl('a', {
            cls: 'internal-link datacards-file-link',
            text: displayText,
            attr: { 
              href: path,
              'data-href': path,
              'data-type': 'link'
            }
          });
          
          // Register the link with Obsidian's click handler
          this.app.workspace.trigger('hover-link', {
            event: new MouseEvent('mouseover'),
            source: 'preview',
            hoverEl: link,
            targetEl: link,
            linktext: path
          });
        }
      } else if (value.startsWith('#')) {
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
      } else {
        // Regular text
        valueEl.setText(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      // Check if it's a Dataview Link object
      if ('path' in value && 'type' in value && value.type === 'file') {
        console.log('Handling Dataview Link object:', value);
        
        // Extract path and display text
        const path = value.path;
        // Use display if available, otherwise use the clean filename
        const displayText = value.display || this.getCleanFilename(path);
        
        console.log(`Creating link from Dataview Link object: path="${path}", display="${displayText}"`);
        
        // Create a proper Obsidian internal link
        const link = valueEl.createEl('a', {
          cls: 'internal-link',
          text: displayText,
          attr: { 
            href: path,
            'data-href': path,
            'data-type': 'link'
          }
        });
        
        // Register the link with Obsidian's click handler
        this.app.workspace.trigger('hover-link', {
          event: new MouseEvent('mouseover'),
          source: 'preview',
          hoverEl: link,
          targetEl: link,
          linktext: path
        });
        
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
        console.log('DATACARDS DEBUG: Found wiki link with pipe character:', value);
        // Extract the display text part (after the pipe)
        const match = value.match(/\[\[.*\|(.*?)\]\]/);
        if (match && match[1]) {
          console.log('DATACARDS DEBUG: Extracted display text:', match[1]);
          // Instead of just setting text, let's try to create a proper link
          const fullMatch = value.match(/\[\[(.*?)\|(.*?)\]\]/);
          if (fullMatch) {
            const path = fullMatch[1];
            const displayText = fullMatch[2];
            console.log(`DATACARDS DEBUG: Creating link from pipe syntax - path: "${path}", display: "${displayText}"`);
            
            const link = valueEl.createEl('a', {
              cls: 'internal-link datacards-file-link',
              text: displayText,
              attr: { 
                href: path,
                'data-href': path,
                'data-type': 'link'
              }
            });
            console.log('DATACARDS DEBUG: Created link element for pipe syntax:', link);
            
            // Register the link with Obsidian's click handler
            this.app.workspace.trigger('hover-link', {
              event: new MouseEvent('mouseover'),
              source: 'preview',
              hoverEl: link,
              targetEl: link,
              linktext: path
            });
            
            return;
          } else {
            // Fallback to just text if we couldn't parse properly
            console.log('DATACARDS DEBUG: Fallback to text only for pipe syntax');
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
        return;
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
