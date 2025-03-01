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

/**
 * Logger utility for DataCards plugin
 * Provides consistent logging with different levels
 * Only error logs are shown by default in production
 */
export class Logger {
  private static debugMode = false;
  
  /**
   * Enable or disable debug mode
   * When disabled, debug logs won't be shown
   * 
   * @param enabled Whether debug mode should be enabled
   */
  static setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }
  
  /**
   * Log an error message
   * These are always shown regardless of debug mode
   * 
   * @param message The error message
   * @param args Additional arguments to log
   */
  static error(message: string, ...args: any[]): void {
    console.error(`[DataCards] ${message}`, ...args);
  }
  
  /**
   * Log a warning message
   * These are always shown regardless of debug mode
   * 
   * @param message The warning message
   * @param args Additional arguments to log
   */
  static warn(message: string, ...args: any[]): void {
    console.warn(`[DataCards] ${message}`, ...args);
  }
  
  /**
   * Log a debug message
   * These are only shown when debug mode is enabled
   * 
   * @param message The debug message
   * @param args Additional arguments to log
   */
  static debug(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.log(`[DataCards] ${message}`, ...args);
    }
  }
}
