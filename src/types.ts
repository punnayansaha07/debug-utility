/**
 * Core type definitions for debug-utility
 */

/**
 * Filter predicate function type
 */
export type FilterPredicate = (namespace: string, ...args: any[]) => boolean;

/**
 * Formatter function type
 */
export type FormatterFunction = (value: any) => string;

/**
 * Log function type
 */
export type LogFunction = (...args: any[]) => void;

/**
 * Filter options for advanced filtering
 */
export interface FilterOptions {
  /** Enable/disable filtering */
  enabled?: boolean;
  /** Regular expression patterns to match */
  patterns?: RegExp[];
  /** Custom predicate functions */
  predicates?: FilterPredicate[];
  /** Minimum log level (if using levels) */
  minLevel?: number;
  /** Maximum log level (if using levels) */
  maxLevel?: number;
  /** Custom tags to filter by */
  tags?: string[];
  /** Include these namespaces */
  include?: string[];
  /** Exclude these namespaces */
  exclude?: string[];
}

/**
 * Debug instance options
 */
export interface DebugOptions {
  /** Custom namespace */
  namespace?: string;
  /** Enable/disable colors */
  useColors?: boolean;
  /** Custom color */
  color?: string | number;
  /** Hide timestamp */
  hideDate?: boolean;
  /** Custom log function */
  log?: LogFunction;
  /** Filter options */
  filter?: FilterOptions;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Debug instance interface
 */
export interface Debugger {
  /** The namespace of this debugger instance */
  namespace: string;
  /** Whether colors are enabled */
  useColors: boolean;
  /** The color assigned to this instance */
  color: string | number;
  /** Time difference from previous log */
  diff: number;
  /** Previous log timestamp */
  prev: number;
  /** Current log timestamp */
  curr: number;
  /** Whether this debugger is enabled */
  enabled: boolean;
  /** The log function */
  log: LogFunction;
  /** Metadata attached to this instance */
  metadata: Record<string, any>;

  /** Log a message */
  (...args: any[]): void;

  /** Extend this debugger with a sub-namespace */
  extend(namespace: string, delimiter?: string): Debugger;

  /** Destroy this debugger instance (deprecated) */
  destroy(): void;

  /** Set filter options for this instance */
  setFilter(filter: FilterOptions): void;

  /** Add metadata to this instance */
  setMetadata(key: string, value: any): void;

  /** Get metadata from this instance */
  getMetadata(key: string): any;
}

/**
 * Debug factory interface
 */
export interface DebugFactory {
  /** Create a new debugger instance */
  (namespace: string, options?: DebugOptions): Debugger;

  /** Available colors */
  colors: (string | number)[];
  /** Named namespaces that are enabled */
  names: string[];
  /** Named namespaces that are skipped */
  skips: string[];
  /** Current namespace configuration */
  namespaces: string;
  /** Custom formatters */
  formatters: Record<string, FormatterFunction>;
  /** Inspect options (Node.js specific) */
  inspectOpts?: Record<string, any>;

  /** Enable debug output */
  enable(namespaces: string): void;

  /** Disable debug output */
  disable(): string;

  /** Check if a namespace is enabled */
  enabled(name: string): boolean;

  /** Humanize time differences */
  humanize: (ms: number) => string;

  /** Select a color for a namespace */
  selectColor(namespace: string): string | number;

  /** Coerce a value */
  coerce(val: any): any;

  /** Format arguments (environment-specific) */
  formatArgs(args: any[]): void;

  /** Log function (environment-specific) */
  log: LogFunction;

  /** Save namespaces (environment-specific) */
  save(namespaces: string): void;

  /** Load namespaces (environment-specific) */
  load(): string;

  /** Use colors check (environment-specific) */
  useColors(): boolean;

  /** Initialize a debug instance (environment-specific) */
  init?(debug: Debugger): void;

  /** Destroy function (deprecated) */
  destroy(): void;

  /** Set global filter options */
  setGlobalFilter(filter: FilterOptions): void;

  /** Get global filter options */
  getGlobalFilter(): FilterOptions;
}

/**
 * Environment-specific configuration
 */
export interface EnvironmentConfig {
  /** Format arguments for output */
  formatArgs: (args: any[]) => void;
  /** Save namespace configuration */
  save: (namespaces: string) => void;
  /** Load namespace configuration */
  load: () => string;
  /** Check if colors should be used */
  useColors: () => boolean;
  /** Available colors */
  colors: (string | number)[];
  /** Log function */
  log: LogFunction;
  /** Inspect options */
  inspectOpts?: Record<string, any>;
  /** Storage mechanism (browser) */
  storage?: Storage | null;
  /** Initialize function */
  init?: (debug: Debugger) => void;
  /** Destroy function */
  destroy: () => void;
}
