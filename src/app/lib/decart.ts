/**
 * @module decart
 * @description Structured logger for the virtual try-on pipeline.
 * All messages are prefixed with [TRYON] for easy filtering.
 * Never logs secrets or API keys.
 */

const PREFIX = "[TRYON]";

const isDev = process.env.NODE_ENV === "development";

/**
 * Structured development logger. Reduces verbose output in production.
 */
export const logger = {
  /** Log informational messages (dev only). */
  info: (...args: unknown[]) => {
    if (isDev) console.log(PREFIX, ...args);
  },

  /** Log warnings (always). */
  warn: (...args: unknown[]) => {
    console.warn(PREFIX, ...args);
  },

  /** Log errors (always). */
  error: (...args: unknown[]) => {
    console.error(PREFIX, ...args);
  },
};
