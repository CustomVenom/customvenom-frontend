// Minimal stub for logger functionality
export const logger = {
  warn: (message: string, data?: unknown) => {
    console.warn(message, data);
  },
  error: (message: string, data?: unknown) => {
    console.error(message, data);
  },
  info: (message: string, data?: unknown) => {
    console.info(message, data);
  },
};
