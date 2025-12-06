/**
 * Node.js implementation of debug-utility
 */

import * as tty from 'tty';
import * as util from 'util';
import { setup } from './common';
import { EnvironmentConfig, Debugger } from './types';

/**
 * Colors for Node.js (ANSI color codes)
 */
const colors = [
  20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68, 69, 74, 75, 76, 77,
  78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164,
  165, 166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201,
  202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221,
];

/**
 * Check if supports-color is available (optional dependency)
 */
try {
  const supportsColor = require('supports-color');
  if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
    // Use extended color palette if available
  }
} catch (e) {
  // supports-color is optional
}

/**
 * Build inspect options from environment variables
 */
const inspectOpts = Object.keys(process.env)
  .filter((key) => /^debug_/i.test(key))
  .reduce((obj: Record<string, any>, key: string) => {
    // Convert DEBUG_COLORS to colors
    const prop = key
      .substring(6)
      .toLowerCase()
      .replace(/_([a-z])/g, (_, k) => k.toUpperCase());

    // Coerce string value
    let val: any = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
      val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
      val = false;
    } else if (val === 'null') {
      val = null;
    } else {
      val = Number(val);
    }

    obj[prop] = val;
    return obj;
  }, {});

/**
 * Check if colors should be used
 */
function useColors(): boolean {
  if ('colors' in inspectOpts) {
    return Boolean(inspectOpts.colors);
  }
  return tty.isatty(process.stderr.fd);
}

/**
 * Format arguments with ANSI colors
 */
function formatArgs(this: Debugger, args: any[]): void {
  const { namespace, useColors: shouldUseColors } = this;

  if (shouldUseColors) {
    const c = this.color as number;
    const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
    const prefix = `  ${colorCode};1m${namespace} \u001B[0m`;

    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push(colorCode + 'm+' + ms(this.diff) + '\u001B[0m');
  } else {
    args[0] = getDate() + namespace + ' ' + args[0];
  }
}

/**
 * Get formatted date
 */
function getDate(): string {
  if (inspectOpts.hideDate) {
    return '';
  }
  return new Date().toISOString() + ' ';
}

/**
 * Log to stderr
 */
function log(...args: any[]): void {
  process.stderr.write(util.formatWithOptions(inspectOpts, ...args) + '\n');
}

/**
 * Save namespaces to environment
 */
function save(namespaces: string): void {
  if (namespaces) {
    process.env.DEBUG = namespaces;
  } else {
    delete process.env.DEBUG;
  }
}

/**
 * Load namespaces from environment
 */
function load(): string {
  return process.env.DEBUG || '';
}

/**
 * Destroy function (deprecated)
 */
function destroy(): void {
  console.warn(
    'Instance method `debug.destroy()` is deprecated and no longer does anything.'
  );
}

/**
 * Initialize a debug instance (optional)
 */
function init(debug: Debugger): void {
  // Initialization logic can be added here if needed
  (debug as any).inspectOpts = inspectOpts;
}

// Import ms for humanizing time
import ms = require('ms');

/**
 * Create environment config for Node.js
 */
const nodeEnv: EnvironmentConfig = {
  formatArgs,
  save,
  load,
  useColors,
  colors,
  log,
  inspectOpts,
  init,
  destroy,
};

/**
 * Export the debug factory
 */
export = setup(nodeEnv);
