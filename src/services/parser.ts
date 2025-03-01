import { BlockSettings } from '../models/settings';
import { Logger } from '../utils/logger';

// Type for dynamic property access
interface DynamicBlockSettings extends BlockSettings {
  [key: string]: any;
}

/**
 * Result of parsing a datacards code block
 */
export interface ParseResult {
  query: string;
  settings: BlockSettings;
}

/**
 * Service for parsing datacards code blocks
 */
export class ParserService {
  /**
   * Parse a datacards code block content
   * Separates the query from the settings section
   * 
   * @param source The content of the datacards code block
   * @returns An object containing the query and settings
   */
  public parseDataCardsBlock(source: string): ParseResult {
    Logger.debug('Parsing datacards block');
    
    // Look for the separator line (three or more hyphens on a line by itself)
    // or a line starting with "// Settings" or "/* Settings */"
    const separatorRegex = /\n-{3,}\n|\n\/\/\s*Settings.*|\n\/\*\s*Settings\s*\*\/.*/;
    const separatorMatch = source.match(separatorRegex);
    
    // Also check if the block starts with "// Settings" (no newline before it)
    const startsWithSettingsRegex = /^\/\/\s*Settings.*/;
    const startsWithSettingsMatch = source.match(startsWithSettingsRegex);
    
    let query: string;
    let settingsText: string;
    
    if (separatorMatch && separatorMatch.index !== undefined) {
      // Split into query and settings
      Logger.debug('Found settings separator at index:', separatorMatch.index);
      query = source.substring(0, separatorMatch.index).trim();
      settingsText = source.substring(separatorMatch.index + separatorMatch[0].length).trim();
    } else if (startsWithSettingsMatch) {
      // The block starts with "// Settings"
      Logger.debug('Block starts with settings marker');
      query = ''; // No query part
      settingsText = source.substring(startsWithSettingsMatch[0].length).trim();
    } else {
      // No separator found, treat everything as query
      Logger.debug('No settings separator found');
      query = source.trim();
      settingsText = '';
    }
    
    Logger.debug('Extracted query:', query);
    
    // Ensure the query has a type (TABLE, LIST, TASK, CALENDAR)
    query = this.ensureQueryType(query);
    
    // Parse settings (YAML-like format)
    const settings = this.parseSettings(settingsText);
    
    return { query, settings };
  }

  /**
   * Ensure the query has a type (TABLE, LIST, TASK, CALENDAR)
   * If no type is specified, add TABLE as the default
   * 
   * @param query The Dataview query
   * @returns The query with a type
   */
  private ensureQueryType(query: string): string {
    // Check if the query already has a type
    const hasType = /\b(TABLE|LIST|TASK|CALENDAR)\b/i.test(query);
    
    if (!hasType) {
      // Add TABLE as the default type
      // First, find the first line that's not a comment
      const lines = query.split('\n');
      let firstNonCommentLine = -1;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('//') && !line.startsWith('/*')) {
          firstNonCommentLine = i;
          break;
        }
      }
      
      if (firstNonCommentLine >= 0) {
        // Get the settings to determine which properties to include in the query
        const settings = this.parseSettings(lines.slice(firstNonCommentLine + 1).join('\n'));
        
        // Determine which properties to include in the query
        let propertiesToInclude = '';
        const propertiesToIncludeArray = [];
        
        // Add the image property if specified
        if (settings.imageProperty) {
          propertiesToIncludeArray.push(settings.imageProperty);
        }
        
        // For simplicity, let's just use a basic TABLE query without specifying properties
        // Dataview will automatically include all properties
        propertiesToInclude = '';
        
        Logger.debug('Using simple TABLE query without property list');
        
        // Insert TABLE with properties before the first non-comment line
        // Make sure there's no space between TABLE and FROM if there are no properties
        if (propertiesToInclude.trim() === '') {
          lines[firstNonCommentLine] = 'TABLE ' + lines[firstNonCommentLine];
        } else {
          lines[firstNonCommentLine] = 'TABLE' + propertiesToInclude + ' ' + lines[firstNonCommentLine];
        }
        return lines.join('\n');
      } else {
        // If there are no non-comment lines, just prepend TABLE
        return 'TABLE ' + query;
      }
    }
    
    return query;
  }

  /**
   * Parse the settings section of a datacards code block
   * 
   * @param settingsText The settings text to parse
   * @returns The parsed settings object
   */
  private parseSettings(settingsText: string): BlockSettings {
    if (!settingsText) {
      return {};
    }

    const settings: DynamicBlockSettings = {};
    
    // Split the settings text into lines
    const lines = settingsText.split('\n');
    
    Logger.debug('Parsing settings from text');
    
    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('//') || line.trim().startsWith('/*') || !line.trim()) {
        continue;
      }
      
      // Look for key-value pairs (key: value)
      const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:\s*(.+)\s*$/);
      if (match) {
        const [, key, value] = match;
        Logger.debug(`Found setting: ${key} = ${value}`);
        
        // Special handling for properties
        if (key === 'properties' && value.trim().startsWith('[') && value.trim().endsWith(']')) {
          Logger.debug('Detected properties array');
          const arrayContent = value.substring(1, value.length - 1).trim();
          if (arrayContent) {
            const properties = arrayContent.split(',').map(item => item.trim());
            settings[key] = properties;
          } else {
            settings[key] = [];
          }
        } else {
    // Special handling for defaultDateFormat
    if (key === 'defaultDateFormat') {
      settings[key] = value.trim();
    } else {
      // Parse other values based on their format
      settings[key] = this.parseValue(value.trim());
    }
        }
      }
    }
    
    return settings;
  }

  /**
   * Parse a value from the settings section
   * 
   * @param value The value to parse
   * @returns The parsed value
   */
  private parseValue(value: string): any {
    Logger.debug('Parsing value:', value);
    
    // Try to parse as JSON
    try {
      const jsonValue = JSON.parse(value);
      return jsonValue;
    } catch (e) {
      // Not valid JSON, continue with other parsing methods
    }
    
    // Check for arrays in the format [item1, item2, item3]
    if (value.startsWith('[') && value.endsWith(']')) {
      Logger.debug('Detected array syntax');
      const arrayContent = value.substring(1, value.length - 1).trim();
      if (arrayContent) {
        // Split by commas, but handle the case where there are no spaces after commas
        const items = arrayContent.split(',').map(item => {
          const trimmedItem = item.trim();
          // Don't recursively parse array items to avoid issues with property names
          // Just return the trimmed string for property names
          return trimmedItem;
        });
        return items;
      }
      return [];
    }
    
    // Check for numbers
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return Number(value);
    }
    
    // Check for booleans
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Default to string
    return value;
  }
}
