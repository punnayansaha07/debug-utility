/**
 * Main entry point - detects environment and loads appropriate implementation
 */

/**
 * Detect Electron renderer / nwjs process, which is node, but should
 * be treated as a browser.
 */

if (
  typeof process === 'undefined' ||
  (process as any).type === 'renderer' ||
  (process as any).browser === true ||
  (process as any).__nwjs
) {
  module.exports = require('./browser');
} else {
  module.exports = require('./node');
}

// Export types for TypeScript users
export * from './types';
export { FilterManager, globalFilter } from './filter';
