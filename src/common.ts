/**
 * Common logic for both Node.js and browser implementations
 */

import ms = require('ms');
import {
  Debugger,
  DebugFactory,
  DebugOptions,
  EnvironmentConfig,
  FilterOptions,
} from './types';
import { FilterManager, globalFilter } from './filter';

/**
 * Setup function that creates the debug factory with environment-specific config
 */
export function setup(env: EnvironmentConfig): DebugFactory {
  /**
   * Create a new debugger instance
   */
  function createDebug(namespace: string, options: DebugOptions = {}): Debugger {
    let prevTime: number | undefined;
    let enableOverride: boolean | null = null;
    let namespacesCache: string;
    let enabledCache: boolean;

    // Instance-specific filter
    const instanceFilter = new FilterManager(options.filter);

    function debug(...args: any[]): void {
      // Check if disabled (using the property that will be defined below)
      if (!(debug as any).enabled) {
        return;
      }

      // Apply global and instance filters
      if (!globalFilter.shouldLog(namespace, args)) {
        return;
      }

      if (!instanceFilter.shouldLog(namespace, args)) {
        return;
      }

      const self = debug;

      // Set timestamp diffs
      const curr = Number(new Date());
      const ms = curr - (prevTime || curr);
      self.diff = ms;
      self.prev = prevTime || curr;
      self.curr = curr;
      prevTime = curr;

      args[0] = (createDebug as any).coerce(args[0]);

      if (typeof args[0] !== 'string') {
        // Inspect with %O
        args.unshift('%O');
      }

      // Apply formatters
      let index = 0;
      args[0] = args[0].replace(/%([a-zA-Z%])/g, (match: string, format: string) => {
        // Handle escaped %
        if (match === '%%') {
          return '%';
        }
        index++;
        const formatter = (createDebug as any).formatters[format];
        if (typeof formatter === 'function') {
          const val = args[index];
          match = formatter.call(self, val);
          // Remove the inlined argument
          args.splice(index, 1);
          index--;
        }
        return match;
      });

      // Apply environment-specific formatting
      (createDebug as any).formatArgs.call(self, args);

      const logFn = self.log || (createDebug as any).log;
      logFn.apply(self, args);
    }

    debug.namespace = namespace;
    debug.useColors = options.useColors ?? (createDebug as any).useColors();
    debug.color = options.color ?? (createDebug as any).selectColor(namespace);
    debug.diff = 0;
    debug.prev = 0;
    debug.curr = 0;
    debug.metadata = options.metadata || {};
    debug.log = options.log || env.log;

    debug.extend = function (ns: string, delimiter?: string): Debugger {
      const sep = typeof delimiter === 'undefined' ? ':' : delimiter;
      const newDebug = createDebug(this.namespace + sep + ns);
      newDebug.log = this.log;
      return newDebug;
    };

    debug.destroy = (createDebug as any).destroy;

    debug.setFilter = function (filter: FilterOptions) {
      instanceFilter.setOptions(filter);
    };

    debug.setMetadata = function (key: string, value: any) {
      this.metadata[key] = value;
    };

    debug.getMetadata = function (key: string) {
      return this.metadata[key];
    };

    Object.defineProperty(debug, 'enabled', {
      enumerable: true,
      configurable: false,
      get(): boolean {
        if (enableOverride !== null) {
          return enableOverride;
        }
        if (namespacesCache !== (createDebug as any).namespaces) {
          namespacesCache = (createDebug as any).namespaces;
          enabledCache = (createDebug as any).enabled(namespace);
        }
        return enabledCache;
      },
      set(v: boolean) {
        enableOverride = v;
      },
    });

    // Environment-specific initialization
    if (typeof (createDebug as any).init === 'function') {
      (createDebug as any).init(debug);
    }

    return debug as Debugger;
  }

  // Attach properties from environment config
  (createDebug as any).names = [];
  (createDebug as any).skips = [];
  (createDebug as any).formatters = {};
  (createDebug as any).namespaces = '';

  // Copy environment-specific properties
  Object.keys(env).forEach((key) => {
    (createDebug as any)[key] = (env as any)[key];
  });

  createDebug.humanize = ms;

  /**
   * Select a color for a namespace
   */
  (createDebug as any).selectColor = function (namespace: string): string | number {
    let hash = 0;
    for (let i = 0; i < namespace.length; i++) {
      hash = (hash << 5) - hash + namespace.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return (createDebug as any).colors[Math.abs(hash) % (createDebug as any).colors.length];
  };

  /**
   * Enable namespaces
   */
  (createDebug as any).enable = function (namespaces: string): void {
    (createDebug as any).save(namespaces);
    (createDebug as any).namespaces = namespaces;

    (createDebug as any).names = [];
    (createDebug as any).skips = [];

    const split = (typeof namespaces === 'string' ? namespaces : '')
      .trim()
      .replace(/\s+/g, ',')
      .split(',')
      .filter(Boolean);

    for (const ns of split) {
      if (ns[0] === '-') {
        (createDebug as any).skips.push(ns.slice(1));
      } else {
        (createDebug as any).names.push(ns);
      }
    }
  };

  /**
   * Disable all namespaces
   */
  (createDebug as any).disable = function (): string {
    const namespaces = [
      ...(createDebug as any).names,
      ...(createDebug as any).skips.map((ns: string) => '-' + ns),
    ].join(',');
    (createDebug as any).enable('');
    return namespaces;
  };

  /**
   * Check if a namespace is enabled
   */
  (createDebug as any).enabled = function (name: string): boolean {
    // Check skips first
    for (const skip of (createDebug as any).skips) {
      if (matchesTemplate(name, skip)) {
        return false;
      }
    }

    // Check names
    for (const ns of (createDebug as any).names) {
      if (matchesTemplate(name, ns)) {
        return true;
      }
    }

    return false;
  };

  /**
   * Coerce a value
   */
  (createDebug as any).coerce = function (val: any): any {
    if (val instanceof Error) {
      return val.stack || val.message;
    }
    return val;
  };

  /**
   * Destroy (deprecated)
   */
  (createDebug as any).destroy = function (): void {
    console.warn(
      'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version.'
    );
  };

  /**
   * Set global filter options
   */
  (createDebug as any).setGlobalFilter = function (filter: FilterOptions) {
    globalFilter.setOptions(filter);
  };

  /**
   * Get global filter options
   */
  (createDebug as any).getGlobalFilter = function () {
    return globalFilter.getOptions();
  };

  // Load saved namespaces
  (createDebug as any).enable((createDebug as any).load());

  return createDebug as any as DebugFactory;
}

/**
 * Match a namespace against a template with wildcards
 */
function matchesTemplate(search: string, template: string): boolean {
  let searchIndex = 0;
  let templateIndex = 0;
  let starIndex = -1;
  let matchIndex = 0;

  while (searchIndex < search.length) {
    if (
      templateIndex < template.length &&
      (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')
    ) {
      if (template[templateIndex] === '*') {
        starIndex = templateIndex;
        matchIndex = searchIndex;
        templateIndex++;
      } else {
        searchIndex++;
        templateIndex++;
      }
    } else if (starIndex !== -1) {
      templateIndex = starIndex + 1;
      matchIndex++;
      searchIndex = matchIndex;
    } else {
      return false;
    }
  }

  // Handle trailing wildcards
  while (templateIndex < template.length && template[templateIndex] === '*') {
    templateIndex++;
  }

  return templateIndex === template.length;
}

export { matchesTemplate };
