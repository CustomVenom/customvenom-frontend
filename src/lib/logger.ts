/**
 * Structured JSON logger for Frontend
 *
 * Architecture Law #4: Structured JSON Logging with Request IDs
 *
 * All logs are output as pure JSON objects with:
 * - level: Log level (info, warn, error, debug)
 * - timestamp: ISO 8601 timestamp
 * - service: Service name (defaults to 'frontend')
 * - message: Log message
 * - request_id: Request ID from API response (if available)
 * - Additional context fields merged into the log object
 *
 * In production, logs can be sent to Vercel Log Drains or analytics service.
 * In development, logs are printed as formatted JSON for readability.
 */

interface LogContext {
  request_id?: string;
  route?: string;
  service?: string;
  [key: string]: unknown;
}

interface StructuredLog {
  level: string;
  timestamp: string;
  service: string;
  message: string;
  request_id?: string;
  [key: string]: unknown;
}

class Logger {
  private readonly serviceName: string;
  private readonly isDevelopment: boolean;

  constructor() {
    this.serviceName = 'frontend';
    this.isDevelopment = typeof process !== 'undefined' && process.env['NODE_ENV'] === 'development';
  }

  /**
   * Creates a structured JSON log object
   */
  private createLogObject(level: string, message: string, context?: LogContext): StructuredLog {
    const timestamp = new Date().toISOString();
    const service = context?.service || this.serviceName;
    const requestId = context?.request_id;

    // Build base log object
    const logObject: StructuredLog = {
      level: level.toUpperCase(),
      timestamp,
      service,
      message,
    };

    // Add request_id if available
    if (requestId) {
      logObject.request_id = requestId;
    }

    // Merge additional context fields (excluding service and request_id which are already handled)
    if (context) {
      const { service: _, request_id: __, ...rest } = context;
      Object.assign(logObject, rest);
    }

    return logObject;
  }

  /**
   * Outputs log as JSON string
   * In development, pretty-prints for readability
   */
  private outputLog(level: string, logObject: StructuredLog): void {
    const jsonString = this.isDevelopment
      ? JSON.stringify(logObject, null, 2)
      : JSON.stringify(logObject);

    // Use appropriate console method based on level
    switch (level.toUpperCase()) {
      case 'ERROR':
        console.error(jsonString);
        // In production, could send to error tracking service (e.g., Sentry)
        break;
      case 'WARN':
        console.warn(jsonString);
        // In production, could send to error tracking service
        break;
      case 'DEBUG':
        console.log(jsonString);
        break;
      default:
        console.info(jsonString);
        // In production, could send to analytics/logging service
    }
  }

  info(message: string, context?: LogContext): void {
    const logObject = this.createLogObject('info', message, context);
    this.outputLog('info', logObject);
  }

  warn(message: string, context?: LogContext): void {
    const logObject = this.createLogObject('warn', message, context);
    this.outputLog('warn', logObject);
  }

  error(message: string, context?: LogContext): void {
    const logObject = this.createLogObject('error', message, context);
    this.outputLog('error', logObject);
  }

  debug(message: string, context?: LogContext): void {
    // Only log debug in development
    if (this.isDevelopment) {
      const logObject = this.createLogObject('debug', message, context);
      this.outputLog('debug', logObject);
    }
  }
}

export const logger = new Logger();
