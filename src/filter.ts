/**
 * Advanced filtering capabilities for debug-utility
 */

import { FilterOptions, FilterPredicate } from './types';

/**
 * Filter manager class for handling complex filtering logic
 */
export class FilterManager {
  private options: FilterOptions;

  constructor(options: FilterOptions = {}) {
    this.options = {
      enabled: true,
      patterns: [],
      predicates: [],
      tags: [],
      include: [],
      exclude: [],
      ...options,
    };
  }

  /**
   * Update filter options
   */
  setOptions(options: Partial<FilterOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current filter options
   */
  getOptions(): FilterOptions {
    return { ...this.options };
  }

  /**
   * Check if a namespace passes the filter
   */
  shouldLog(namespace: string, args: any[] = []): boolean {
    if (!this.options.enabled) {
      return true;
    }

    // Check exclude list first (highest priority)
    if (this.options.exclude && this.options.exclude.length > 0) {
      for (const pattern of this.options.exclude) {
        if (this.matchPattern(namespace, pattern)) {
          return false;
        }
      }
    }

    // Check include list
    if (this.options.include && this.options.include.length > 0) {
      let included = false;
      for (const pattern of this.options.include) {
        if (this.matchPattern(namespace, pattern)) {
          included = true;
          break;
        }
      }
      if (!included) {
        return false;
      }
    }

    // Check regex patterns
    if (this.options.patterns && this.options.patterns.length > 0) {
      let matched = false;
      for (const pattern of this.options.patterns) {
        if (pattern.test(namespace)) {
          matched = true;
          break;
        }
      }
      if (!matched) {
        return false;
      }
    }

    // Check custom predicates
    if (this.options.predicates && this.options.predicates.length > 0) {
      for (const predicate of this.options.predicates) {
        if (!predicate(namespace, ...args)) {
          return false;
        }
      }
    }

    // Check tags (if first argument is an object with tags)
    if (this.options.tags && this.options.tags.length > 0) {
      if (args.length > 0 && typeof args[0] === 'object' && args[0].tags) {
        const argTags = Array.isArray(args[0].tags) ? args[0].tags : [args[0].tags];
        const hasMatchingTag = argTags.some((tag: string) =>
          this.options.tags!.includes(tag)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Match a namespace against a pattern (supports wildcards)
   */
  private matchPattern(namespace: string, pattern: string): boolean {
    // Convert wildcard pattern to regex
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
      .replace(/\*/g, '.*'); // Replace * with .*

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(namespace);
  }

  /**
   * Add a custom predicate filter
   */
  addPredicate(predicate: FilterPredicate): void {
    if (!this.options.predicates) {
      this.options.predicates = [];
    }
    this.options.predicates.push(predicate);
  }

  /**
   * Add a regex pattern filter
   */
  addPattern(pattern: RegExp): void {
    if (!this.options.patterns) {
      this.options.patterns = [];
    }
    this.options.patterns.push(pattern);
  }

  /**
   * Add include pattern
   */
  addInclude(pattern: string): void {
    if (!this.options.include) {
      this.options.include = [];
    }
    this.options.include.push(pattern);
  }

  /**
   * Add exclude pattern
   */
  addExclude(pattern: string): void {
    if (!this.options.exclude) {
      this.options.exclude = [];
    }
    this.options.exclude.push(pattern);
  }

  /**
   * Add tag filter
   */
  addTag(tag: string): void {
    if (!this.options.tags) {
      this.options.tags = [];
    }
    this.options.tags.push(tag);
  }

  /**
   * Clear all filters
   */
  clear(): void {
    this.options = {
      enabled: true,
      patterns: [],
      predicates: [],
      tags: [],
      include: [],
      exclude: [],
    };
  }

  /**
   * Enable filtering
   */
  enable(): void {
    this.options.enabled = true;
  }

  /**
   * Disable filtering
   */
  disable(): void {
    this.options.enabled = false;
  }
}

/**
 * Global filter instance
 */
export const globalFilter = new FilterManager();
