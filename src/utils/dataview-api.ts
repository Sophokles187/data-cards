import { Plugin } from 'obsidian';
import { Logger } from './logger';

/**
 * Interface for the Dataview API
 * This is a simplified version based on the Dataview documentation
 */
export interface DataviewApi {
  query(query: string, sourcePath: string, container: HTMLElement): Promise<any>;
  tryQuery(query: string, sourcePath: string, container: HTMLElement): Promise<{ successful: boolean; value: any }>;
  page(path: string): any;
  pages(path: string): any[];
  index: {
    pages: any[];
    tags: Record<string, any[]>;
    initialized: boolean;
  };
}

/**
 * Utility class for interacting with the Dataview API
 */
export class DataviewApiUtil {
  private plugin: Plugin;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  /**
   * Check if Dataview plugin is installed and enabled
   */
  public isDataviewEnabled(): boolean {
    // @ts-ignore - Accessing the global app object
    return this.plugin.app.plugins.plugins.dataview !== undefined;
  }

  /**
   * Get the Dataview API
   * @returns The Dataview API or null if not available
   */
  public getDataviewApi(): DataviewApi | null {
    if (!this.isDataviewEnabled()) {
      return null;
    }

    // @ts-ignore - Accessing the global app object
    return this.plugin.app.plugins.plugins.dataview.api;
  }

  /**
   * Execute a Dataview query
   * @param query The Dataview query string
   * @param sourcePath The source file path
   * @param container The container element for rendering
   * @returns The query result or null if Dataview is not available
   */
  public async executeQuery(query: string, sourcePath: string, container: HTMLElement): Promise<any | null> {
    const api = this.getDataviewApi();
    if (!api) {
      return null;
    }

    try {
      return await api.query(query, sourcePath, container);
    } catch (error) {
      Logger.error('Error executing Dataview query:', error);
      throw error;
    }
  }

  /**
   * Wait for Dataview to complete indexing
   * @returns A promise that resolves to true if Dataview is ready, false if timed out
   */
  public async waitForDataviewReady(): Promise<boolean> {
    const api = this.getDataviewApi();
    if (!api) return false;
    
    // If Dataview is already indexed, return immediately
    if (api.index && api.index.initialized) {
      Logger.debug('Dataview index is already initialized');
      return true;
    }
    
    Logger.debug('Waiting for Dataview index to be ready...');
    
    // Otherwise, wait for the index-ready event
    return new Promise(resolve => {
      const app = this.plugin.app;
      
      // Set up event listener for index-ready
      // @ts-ignore - Accessing the metadataCache events
      const eventRef = app.metadataCache.on('dataview:index-ready', () => {
        Logger.debug('Dataview index is now ready');
        // @ts-ignore - Accessing the metadataCache events
        app.metadataCache.offref(eventRef);
        resolve(true);
      });
      
      // Set a timeout in case the event never fires
      setTimeout(() => {
        Logger.warn('Timed out waiting for Dataview index');
        // @ts-ignore - Accessing the metadataCache events
        app.metadataCache.offref(eventRef);
        resolve(false);
      }, 5000); // 5 second timeout
    });
  }

  /**
   * Execute a Dataview query safely, returning an object indicating success or failure
   * @param query The Dataview query string
   * @param sourcePath The source file path
   * @param container The container element for rendering
   * @param retryCount Optional retry count for internal use
   * @returns An object with the query result or error
   */
  public async executeSafeQuery(
    query: string, 
    sourcePath: string, 
    container: HTMLElement,
    retryCount: number = 0
  ): Promise<{ successful: boolean; value: any }> {
    const api = this.getDataviewApi();
    if (!api) {
      Logger.error('Dataview API not found. Make sure Dataview plugin is enabled.');
      return { successful: false, value: 'Dataview plugin is not enabled' };
    }

    if (!query || query.trim() === '') {
      Logger.error('Empty Dataview query');
      return { successful: false, value: 'Empty query' };
    }

    Logger.debug('Executing Dataview query:', query);
    Logger.debug('Source path:', sourcePath);

    try {
      // Try using the regular query method directly
      if (typeof api.query === 'function') {
        Logger.debug('Using api.query method');
        try {
          const result = await api.query(query, sourcePath, container);
          Logger.debug('Direct query result type:', typeof result);
          
          // Check if result is undefined or null
          if (result === undefined || result === null) {
            Logger.error('Direct query returned undefined or null');
            return { successful: false, value: 'No results returned' };
          }
          
          // Check if the result has the expected structure for a table query
          if (result && typeof result === 'object') {
            if ('values' in result && Array.isArray(result.values)) {
              Logger.debug('Result contains a values array with length:', result.values.length);
            }
            
            if ('headers' in result && Array.isArray(result.headers)) {
              Logger.debug('Result contains headers:', result.headers);
            }
          }
          
          // Check if we got an empty result but Dataview might still be indexing
          if (result && 
              typeof result === 'object' && 
              'values' in result && 
              Array.isArray(result.values) && 
              result.values.length === 0 && 
              retryCount < 3) {
            
            // If we have an empty result and we haven't retried too many times,
            // wait a bit and try again
            Logger.debug(`Empty result, retrying (attempt ${retryCount + 1}/3)...`);
            return new Promise(resolve => {
              setTimeout(async () => {
                const retryResult = await this.executeSafeQuery(query, sourcePath, container, retryCount + 1);
                resolve(retryResult);
              }, 500); // Wait 500ms before retrying
            });
          }
          
          return { successful: true, value: result };
        } catch (queryError) {
          Logger.error('Error in direct query:', queryError);
          return { 
            successful: false, 
            value: queryError ? (queryError.message || String(queryError)) : 'Error in query execution' 
          };
        }
      } else {
        Logger.error('Dataview API query method not found.');
        return { successful: false, value: 'Incompatible Dataview API version' };
      }
    } catch (error) {
      Logger.error('Error executing Dataview query:', error);
      return { 
        successful: false, 
        value: error ? (error.message || String(error)) : 'Unknown error' 
      };
    }
  }
}
