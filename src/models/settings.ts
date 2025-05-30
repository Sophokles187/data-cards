/**
 * Settings interfaces for the DataCards plugin
 */

/**
 * Preset options for card display
 */
export type CardPreset = 'grid' | 'portrait' | 'square' | 'compact' | 'dense';

/**
 * Font size options
 */
export type FontSize = 'larger' | 'large' | 'default' | 'small' | 'smaller';

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
 * Boolean display mode options
 */
export type BooleanDisplayMode = 'both' | 'checkbox' | 'text';

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
  propertiesAlign: 'left' | 'center' | 'right'; // Alignment for properties and labels
  titleAlign: 'left' | 'center' | 'right'; // Alignment for the title (filename)
  fontSize: FontSize; // Font size for all text elements

  // Boolean display settings
  booleanDisplayMode: BooleanDisplayMode; // How to display boolean values
  showBooleanLabels: boolean; // Whether to show text labels for boolean values
  booleanTrueText: string; // Custom text for true values
  booleanFalseText: string; // Custom text for false values

  // Card interaction settings
  enableClickableCards: boolean; // Make the entire card clickable to open the note

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

  // Update settings
  enableDynamicUpdates: boolean; // Enable automatic updates when properties change
  refreshDelay: number; // Delay in milliseconds before refreshing after a property change

  // Debug settings
  debugMode: boolean; // Enable debug logging

  // Column aliases (for display names)
  columnAliases?: ColumnAlias[]; // Mapping of original property names to display names

  // New setting
  showFileAsTitle: boolean;

  // Dynamic columns settings
  dynamicColumns: boolean; // Enable dynamic column layout based on container width
  minCardWidth: string; // Minimum card width for dynamic layout (e.g., "250px")
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
  propertiesAlign: 'left', // Default to left alignment
  titleAlign: 'left', // Default to left alignment
  fontSize: 'default', // Default font size

  // Boolean display settings
  booleanDisplayMode: 'both', // Default to showing both checkbox and text
  showBooleanLabels: true, // Default to showing labels
  booleanTrueText: 'true', // Default text for true values
  booleanFalseText: 'false', // Default text for false values

  // Card interaction settings
  enableClickableCards: false, // Disabled by default

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

  // Update settings
  enableDynamicUpdates: false, // Disabled by default to avoid performance issues
  refreshDelay: 2500, // Default to 2.5 seconds (2500ms)

  // Debug settings
  debugMode: false, // Disabled by default

  // New setting
  showFileAsTitle: true,

  // Dynamic columns settings
  dynamicColumns: false, // Default to fixed columns for backward compatibility
  minCardWidth: '250px', // Default minimum card width
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
  dynamicUpdate?: boolean; // Enable/disable dynamic updates for this specific block
  dynamicColumns?: boolean; // Allow dynamic columns to be set in code blocks
  minCardWidth?: string; // Allow minimum card width to be set in code blocks
}
