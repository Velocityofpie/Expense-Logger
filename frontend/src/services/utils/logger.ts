// src/services/utils/logger.ts
export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
  }
  
  export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    stack?: string;
  }
  
  export interface LoggerOptions {
    minLevel: LogLevel;
    enableConsole?: boolean;
    endpoint?: string;
  }
  
  class Logger {
    private options: LoggerOptions;
    
    constructor(options: LoggerOptions) {
      this.options = {
        enableConsole: true,
        ...options
      };
    }
    
    private shouldLog(level: LogLevel): boolean {
      const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
      const minLevelIndex = levels.indexOf(this.options.minLevel);
      const currentLevelIndex = levels.indexOf(level);
      
      return currentLevelIndex >= minLevelIndex;
    }
    
    private createLogEntry(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
      return {
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
        stack: error?.stack
      };
    }
    
    private async sendToServer(entry: LogEntry): Promise<void> {
      if (!this.options.endpoint) return;
      
      try {
        await fetch(this.options.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entry)
        });
      } catch (e) {
        // Fallback to console if server logging fails
        if (this.options.enableConsole) {
          console.error('Failed to send log to server:', e);
        }
      }
    }
    
    debug(message: string, context?: Record<string, unknown>): void {
      if (!this.shouldLog(LogLevel.DEBUG)) return;
      
      const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
      
      if (this.options.enableConsole) {
        console.debug(message, context || '');
      }
      
      this.sendToServer(entry);
    }
    
    info(message: string, context?: Record<string, unknown>): void {
      if (!this.shouldLog(LogLevel.INFO)) return;
      
      const entry = this.createLogEntry(LogLevel.INFO, message, context);
      
      if (this.options.enableConsole) {
        console.info(message, context || '');
      }
      
      this.sendToServer(entry);
    }
    
    warn(message: string, context?: Record<string, unknown>): void {
      if (!this.shouldLog(LogLevel.WARN)) return;
      
      const entry = this.createLogEntry(LogLevel.WARN, message, context);
      
      if (this.options.enableConsole) {
        console.warn(message, context || '');
      }
      
      this.sendToServer(entry);
    }
    
    error(message: string, error?: Error, context?: Record<string, unknown>): void {
      if (!this.shouldLog(LogLevel.ERROR)) return;
      
      const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
      
      if (this.options.enableConsole) {
        console.error(message, error || '', context || '');
      }
      
      this.sendToServer(entry);
    }
  }
  
  // Create and export a default logger instance
  export default new Logger({
    minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
    enableConsole: process.env.NODE_ENV !== 'production',
    endpoint: process.env.REACT_APP_LOG_ENDPOINT
  });