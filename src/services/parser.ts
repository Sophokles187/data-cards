import { BlockSettings, ColumnAlias } from '../models/settings';
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
    
    // Extract column aliases from the query
    const columnAliases = this.extractColumnAliases(query);
    if (columnAliases.length > 0) {
      settings.columnAliases = columnAliases;
      Logger.debug('Extracted column aliases:', columnAliases);
    }
    
    return { query, settings };
  }
  
  /**
   * Extract column aliases from a Dataview query
   * Handles both simple aliases (field as "Alias") and complex expressions
   * 
   * @param query The Dataview query
   * @returns Array of column aliases
   */
  private extractColumnAliases(query: string): ColumnAlias[] {
    const aliases: ColumnAlias[] = [];
    
    // Only process TABLE queries
    if (!query.trim().toUpperCase().startsWith('TABLE')) {
      return aliases;
    }
    
    try {
      // Extract the column definitions part of the query
      // This is the part between TABLE and the first FROM, WHERE, SORT, GROUP BY, LIMIT, FLATTEN
      // Use [\s\S] instead of dot with s flag for cross-line matching
      const tableMatch = query.match(/TABLE\s+(without\s+id\s+)?([\s\S]*?)(?:\s+FROM|\s+WHERE|\s+SORT|\s+GROUP BY|\s+LIMIT|\s+FLATTEN|$)/i);
      
      if (!tableMatch || !tableMatch[2]) {
        return aliases;
      }
      
      const columnsText = tableMatch[2].trim();
      Logger.debug('Extracted columns text:', columnsText);
      
      if (!columnsText) {
        return aliases;
      }
      
      // Split the columns by commas, but handle complex expressions
      // This is a simplified approach and may not handle all cases perfectly
      const columns = this.splitColumnsPreservingExpressions(columnsText);
      
      for (const column of columns) {
        // Look for the "as" keyword, handling both quoted and unquoted aliases
        // This regex handles: field as Alias, field as "Alias", (expression) as Alias, (expression) as "Alias"
        const asMatch = column.match(/^(.*?)\s+as\s+(?:"([^"]+)"|'([^']+)'|([^\s,]+))$/i);
        
        if (asMatch) {
          const expression = asMatch[1].trim();
          // The alias could be in group 2 (double quotes), 3 (single quotes), or 4 (unquoted)
          const alias = asMatch[2] || asMatch[3] || asMatch[4];
          
          // For simple field names, use the field name as original
          // For complex expressions, use the whole expression
          let original = expression;
          
          // If it's a simple field name (no spaces, operators, etc.), use it as original
          if (/^[a-zA-Z0-9_.-]+$/.test(expression)) {
            original = expression;
          } else {
            // For complex expressions, try to extract the core field name if possible
            // This helps with expressions like ("![|60](" + cover + ")") as Cover
            const fieldMatch = expression.match(/\(\s*".*?"\s*\+\s*([a-zA-Z0-9_.-]+)\s*\+\s*".*?"\s*\)/);
            if (fieldMatch && fieldMatch[1]) {
              // Use the extracted field name as the original
              original = fieldMatch[1];
              Logger.debug(`Extracted field name from complex expression: ${original}`);
            }
          }
          
          aliases.push({
            original,
            alias,
            expression
          });
          
          Logger.debug(`Found column alias: ${original} as "${alias}"`);
        }
      }
    } catch (error) {
      Logger.error('Error extracting column aliases:', error);
    }
    
    return aliases;
  }
  
  /**
   * Split a comma-separated list of columns while preserving expressions
   * This handles nested parentheses and quotes
   * 
   * @param columnsText The text containing comma-separated columns
   * @returns Array of column expressions
   */
  private splitColumnsPreservingExpressions(columnsText: string): string[] {
    const columns: string[] = [];
    let currentColumn = '';
    let parenDepth = 0;
    let inDoubleQuote = false;
    let inSingleQuote = false;
    
    for (let i = 0; i < columnsText.length; i++) {
      const char = columnsText[i];
      
      // Handle quotes
      if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      } else if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      }
      
      // Handle parentheses (only if not in quotes)
      if (!inDoubleQuote && !inSingleQuote) {
        if (char === '(') {
          parenDepth++;
        } else if (char === ')') {
          parenDepth--;
        }
      }
      
      // Handle commas (only if not in quotes or parentheses)
      if (char === ',' && parenDepth === 0 && !inDoubleQuote && !inSingleQuote) {
        columns.push(currentColumn.trim());
        currentColumn = '';
        continue;
      }
      
      currentColumn += char;
    }
    
    // Add the last column
    if (currentColumn.trim()) {
      columns.push(currentColumn.trim());
    }
    
    return columns;
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
    } 
    // Special handling for dynamicUpdate
    else if (key === 'dynamicUpdate') {
      settings[key] = this.parseValue(value.trim());
      Logger.debug(`Parsed dynamicUpdate setting: ${settings[key]}`);
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
