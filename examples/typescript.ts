/**
 * TypeScript-specific examples showing type safety
 */

import debug, { Debugger, DebugFactory, FilterOptions, DebugOptions } from '../index';

console.log('=== TypeScript Type Safety Examples ===\n');

// Example 1: Strongly typed debugger
console.log('Example 1: Type-safe debugger creation');

const typedLogger: Debugger = debug('typed:logger');
typedLogger('This is type-safe');

// Example 2: Type-safe options
console.log('\nExample 2: Type-safe options');

const options: DebugOptions = {
  namespace: 'custom',
  useColors: true,
  hideDate: false,
  metadata: {
    version: '1.0.0',
    build: 12345,
  },
  filter: {
    enabled: true,
    include: ['custom:*'],
  },
};

const customLogger: Debugger = debug('custom:app', options);
customLogger('Custom configured logger');

// Example 3: Type-safe filter options
console.log('\nExample 3: Type-safe filtering');

const filterOptions: FilterOptions = {
  enabled: true,
  patterns: [/^api:.*/, /^service:.*/],
  include: ['app:*'],
  exclude: ['app:test'],
  predicates: [
    (namespace: string, ...args: any[]): boolean => {
      return namespace.startsWith('api');
    },
  ],
};

debug.setGlobalFilter(filterOptions);

// Example 4: Generic type usage
console.log('\nExample 4: Using types with classes');

class TypedService {
  private logger: Debugger;

  constructor(name: string) {
    this.logger = debug(`service:${name}`);
  }

  log(message: string, data?: Record<string, any>): void {
    if (data) {
      this.logger(message, data);
    } else {
      this.logger(message);
    }
  }

  getLogger(): Debugger {
    return this.logger;
  }
}

const service = new TypedService('auth');
service.log('Service initialized', { port: 3000 });

// Example 5: Type-safe metadata operations
console.log('\nExample 5: Type-safe metadata');

interface ServiceMetadata {
  serviceName: string;
  version: string;
  uptime: number;
}

const metadataLogger = debug('service:typed');

// Type-safe metadata setting
const serviceInfo: ServiceMetadata = {
  serviceName: 'user-service',
  version: '2.0.0',
  uptime: 0,
};

Object.entries(serviceInfo).forEach(([key, value]) => {
  metadataLogger.setMetadata(key, value);
});

// Type-safe metadata getting
const serviceName = metadataLogger.getMetadata('serviceName') as string;
const version = metadataLogger.getMetadata('version') as string;
const uptime = metadataLogger.getMetadata('uptime') as number;

console.log('Service:', serviceName);
console.log('Version:', version);
console.log('Uptime:', uptime);

// Example 6: Factory pattern with types
console.log('\nExample 6: Factory pattern');

class LoggerFactory {
  private static instance: DebugFactory = debug;

  static createLogger(namespace: string, options?: DebugOptions): Debugger {
    return this.instance(namespace, options);
  }

  static enableAll(): void {
    this.instance.enable('*');
  }

  static disableAll(): string {
    return this.instance.disable();
  }

  static setFilter(filter: FilterOptions): void {
    this.instance.setGlobalFilter(filter);
  }
}

const factoryLogger = LoggerFactory.createLogger('factory:logger');
factoryLogger('Created via factory');

// Example 7: Enum-based namespaces (type-safe)
console.log('\nExample 7: Enum-based namespaces');

enum LogNamespace {
  APP = 'app',
  API = 'api',
  DATABASE = 'database',
  CACHE = 'cache',
}

enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

class StructuredLogger {
  private loggers: Map<LogNamespace, Debugger>;

  constructor() {
    this.loggers = new Map();
  }

  private getLogger(namespace: LogNamespace): Debugger {
    if (!this.loggers.has(namespace)) {
      this.loggers.set(namespace, debug(namespace));
    }
    return this.loggers.get(namespace)!;
  }

  log(namespace: LogNamespace, level: LogLevel, message: string, data?: any): void {
    const logger = this.getLogger(namespace);
    logger(`[${level.toUpperCase()}] ${message}`, data);
  }
}

const structuredLogger = new StructuredLogger();
structuredLogger.log(LogNamespace.APP, LogLevel.INFO, 'Application started');
structuredLogger.log(LogNamespace.API, LogLevel.ERROR, 'API error', { code: 500 });
structuredLogger.log(LogNamespace.DATABASE, LogLevel.WARN, 'Slow query detected');

console.log('\n--- TypeScript provides full IntelliSense and type checking ---');
