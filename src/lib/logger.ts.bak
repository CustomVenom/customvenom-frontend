export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') console.log('[INFO]', message, meta);
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn('[WARN]', message, meta);
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error('[ERROR]', message, meta);
  }
};

