/**
 * Structured logger for Frontend
 *
 * Provides consistent logging with context and log levels.
 * In production, logs are sent to analytics/logging service.
 * In development, logs are printed to console.
 */

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment()) {
      const formatted = this.formatMessage('INFO', message, context);
      console.info(formatted);
    }
    // In production, could send to analytics/logging service
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('WARN', message, context);
    console.warn(formatted);
    // In production, could send to error tracking service
  }

  error(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('ERROR', message, context);
    console.error(formatted);
    // In production, send to error tracking service (e.g., Sentry)
  }

  debug(message: string, context?: LogContext): void {
    // Only log debug in development
    if (this.isDevelopment()) {
      const formatted = this.formatMessage('DEBUG', message, context);
      console.log(formatted);
    }
  }
}

export const logger = new Logger();
