/**
 * Browser implementation of debug-utility
 */

import { setup } from './common';
import { EnvironmentConfig, Debugger } from './types';

/**
 * Colors for browser (hex codes)
 */
const colors = [
  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF',
  '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF',
  '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33',
  '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF',
  '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33',
  '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333',
  '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF',
  '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633',
  '#FF9900', '#FF9933', '#FFCC00', '#FFCC33',
];

/**
 * Get localStorage safely
 */
function localstorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    return null;
  } catch (e) {
    return null;
  }
}

const storage = localstorage();

/**
 * Check if colors should be used in browser
 */
function useColors(): boolean {
  // Electron renderer
  if (
    typeof window !== 'undefined' &&
    (window as any).process &&
    ((window as any).process.type === 'renderer' || (window as any).process.__nwjs)
  ) {
    return true;
  }

  // Internet Explorer and Edge do not support colors
  if (
    typeof navigator !== 'undefined' &&
    navigator.userAgent &&
    navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)
  ) {
    return false;
  }

  // Check for various browser capabilities
  return (
    (typeof document !== 'undefined' &&
      document.documentElement &&
      document.documentElement.style &&
      (document.documentElement.style as any).WebkitAppearance) ||
    (typeof window !== 'undefined' &&
      (window as any).console &&
      ((window as any).console.firebug ||
        ((window as any).console.exception && (window as any).console.table))) ||
    (typeof navigator !== 'undefined' &&
      navigator.userAgent &&
      navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) &&
      parseInt(RegExp.$1, 10) >= 31) ||
    (typeof navigator !== 'undefined' &&
      navigator.userAgent &&
      navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))
  );
}

/**
 * Format arguments with browser colors
 */
function formatArgs(this: Debugger, args: any[]): void {
  args[0] =
    (this.useColors ? '%c' : '') +
    this.namespace +
    (this.useColors ? ' %c' : ' ') +
    args[0] +
    (this.useColors ? '%c ' : ' ') +
    '+' +
    ms(this.diff);

  if (!this.useColors) {
    return;
  }

  const c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // Handle %c positioning
  let index = 0;
  let lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, (match: string) => {
    if (match === '%%') {
      return match;
    }
    index++;
    if (match === '%c') {
      lastC = index;
    }
    return match;
  });

  args.splice(lastC, 0, c);
}

/**
 * Log function for browser
 */
const log =
  typeof console !== 'undefined' && typeof console.debug === 'function'
    ? console.debug.bind(console)
    : typeof console !== 'undefined' && typeof console.log === 'function'
    ? console.log.bind(console)
    : (): void => {};

/**
 * Save namespaces to localStorage
 */
function save(namespaces: string): void {
  try {
    if (namespaces) {
      storage?.setItem('debug', namespaces);
    } else {
      storage?.removeItem('debug');
    }
  } catch (error) {
    // Ignore errors (e.g., localStorage quota exceeded)
  }
}

/**
 * Load namespaces from localStorage
 */
function load(): string {
  let r: string = '';
  try {
    r = storage?.getItem('debug') || '';
  } catch (error) {
    // Ignore errors
  }

  // Also check URL query parameter
  if (typeof window !== 'undefined' && window.location) {
    const match = window.location.search.match(/[?&]debug=([^&]*)/);
    if (match) {
      r = decodeURIComponent(match[1]);
    }
  }

  return r;
}

/**
 * Destroy function (deprecated)
 */
let warnedDestroy = false;
function destroy(): void {
  if (!warnedDestroy) {
    warnedDestroy = true;
    console.warn(
      'Instance method `debug.destroy()` is deprecated and no longer does anything.'
    );
  }
}

// Import ms for humanizing time
import ms = require('ms');

/**
 * Create environment config for browser
 */
const browserEnv: EnvironmentConfig = {
  formatArgs,
  save,
  load,
  useColors,
  colors,
  log,
  storage,
  destroy,
};

/**
 * Export the debug factory
 */
export = setup(browserEnv);
