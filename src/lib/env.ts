/**
 * Environment utilities
 * Centralizes access to runtime configuration
 */

export const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
export const ENVIRONMENT = process.env['NODE_ENV'] || 'development';
export const IS_PRODUCTION = ENVIRONMENT === 'production';
export const IS_DEVELOPMENT = ENVIRONMENT === 'development';

// Feature flags
export const ENABLE_DEV_OVERLAY = IS_DEVELOPMENT;
export const ENABLE_CACHE_WARMER = IS_PRODUCTION;
