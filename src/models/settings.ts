/**
 * Settings interfaces for the DataCards plugin
 */

/**
 * Preset options for card display
 */
export type CardPreset = 'grid' | 'portrait' | 'square' | 'compact' | 'dense';

/**
 * Image fitting options
 */
export type ImageFit = 'cover' | 'contain';

/**
 * Property formatter types
 */
export type PropertyFormatterType = 'text' | 'stars' | 'badge' | 'progress' | 'date' | 'tags';

/**
 * Property formatter configuration
 */
export interface PropertyFormatter {
  type: PropertyFormatterType;
  options?: Record<string, any>;
}

/**
 * Main settings interface for the DataCards plugin
 */
export interface DataCardsSettings {
  // Preset settings
  preset: CardPreset;
  
  // Image settings
  imageProperty: string;
  imageHeight: string;
  imageFit: ImageFit;
  
  // Content settings
  properties: string[] | 'all';
  exclude: string[];
  scrollableProperties: boolean; // Enable scrolling for properties
  contentHeight: string; // Height of the scrollable content area
  
  // Display settings
  showLabels: boolean;
  cardSpacing: number;
  enableShadows: boolean;
  
  // Formatting settings
  defaultDateFormat: string;
  propertyFormatters: {
    [propertyName: string]: PropertyFormatter;
  };
  
  // Mobile settings
  mobileColumns: number;
  mobilePreset: CardPreset;
  mobileImageHeight: string;
  mobileScrollableProperties: boolean; // Enable scrolling for properties on mobile
  mobileContentHeight: string; // Height of the scrollable content area on mobile
  forceMobileMode: boolean; // Force mobile mode for testing
  
  // Performance settings
  enableLazyLoading: boolean;
  
  // Debug settings
  debugMode: boolean; // Enable debug logging
  
  // Column aliases (for display names)
  columnAliases?: ColumnAlias[]; // Mapping of original property names to display names
}

/**
 * Default settings for the DataCards plugin
 */
export const DEFAULT_SETTINGS: DataCardsSettings = {
  // Preset settings
  preset: 'grid',
  
  // Image settings
  imageProperty: 'cover',
  imageHeight: '200px',
  imageFit: 'cover',
  
  // Content settings
  properties: 'all',
  exclude: [],
  scrollableProperties: false, // Default to non-scrollable for most presets
  contentHeight: '200px', // Default height for scrollable content
  
  // Display settings
  showLabels: true,
  cardSpacing: 16,
  enableShadows: true,
  
  // Formatting settings
  defaultDateFormat: 'YYYY-MM-DD',
  propertyFormatters: {},
  
  // Mobile settings
  mobileColumns: 1,
  mobilePreset: 'grid',
  mobileImageHeight: '150px',
  mobileScrollableProperties: true, // Default to scrollable on mobile
  mobileContentHeight: '150px', // Default height for mobile scrollable content
  forceMobileMode: false, // Disabled by default
  
  // Performance settings
  enableLazyLoading: false,
  
  // Debug settings
  debugMode: false // Disabled by default
};

/**
 * Column alias mapping
 */
export interface ColumnAlias {
  original: string;  // Original property name
  alias: string;     // Display name (alias)
  expression: string; // Original expression (if complex)
}

/**
 * Settings for a specific datacards code block
 * This can override the global settings
 */
export interface BlockSettings extends Partial<DataCardsSettings> {
  // Block-specific settings
  columns?: number; // Allow columns to be set in code blocks
  columnAliases?: ColumnAlias[]; // Mapping of original property names to display names
}
