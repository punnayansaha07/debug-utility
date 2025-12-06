/**
 * Metadata examples for debug-utility
 */

import debug from '../index';

console.log('=== Metadata Examples ===\n');

// Example 1: Initial metadata
console.log('Example 1: Creating logger with initial metadata');
const logger = debug('app:service', {
  metadata: {
    service: 'user-service',
    version: '1.0.0',
    environment: 'production',
  },
});

console.log('Service:', logger.getMetadata('service'));
console.log('Version:', logger.getMetadata('version'));
console.log('Environment:', logger.getMetadata('environment'));

logger('Service initialized');

// Example 2: Dynamic metadata
console.log('\nExample 2: Adding metadata dynamically');
const requestLogger = debug('app:request');

// Simulate handling a request
function handleRequest(requestId: string, userId: string) {
  requestLogger.setMetadata('requestId', requestId);
  requestLogger.setMetadata('userId', userId);
  requestLogger.setMetadata('timestamp', new Date().toISOString());

  requestLogger('Processing request');

  console.log('Request ID:', requestLogger.getMetadata('requestId'));
  console.log('User ID:', requestLogger.getMetadata('userId'));
  console.log('Timestamp:', requestLogger.getMetadata('timestamp'));
}

handleRequest('req-12345', 'user-789');

// Example 3: Metadata with filtering
console.log('\nExample 3: Using metadata in filters');

debug.setGlobalFilter({
  predicates: [
    (namespace: string, ...args: any[]) => {
      // Check if metadata indicates production environment
      // In a real scenario, you'd pass the debugger instance
      return true; // Simplified for example
    },
  ],
});

const prodLogger = debug('app:main', {
  metadata: {
    environment: 'production',
    region: 'us-east-1',
  },
});

prodLogger('Production log with metadata');

// Example 4: Metadata inheritance with extend
console.log('\nExample 4: Metadata with extended loggers');
const parentLogger = debug('parent', {
  metadata: {
    app: 'my-app',
    version: '2.0.0',
  },
});

const childLogger = parentLogger.extend('child');
childLogger.setMetadata('component', 'auth');

console.log('Parent app:', parentLogger.getMetadata('app'));
console.log('Child component:', childLogger.getMetadata('component'));

parentLogger('Parent log');
childLogger('Child log');

// Example 5: Request tracing with metadata
console.log('\nExample 5: Request tracing scenario');

class RequestTracer {
  private logger;

  constructor(requestId: string) {
    this.logger = debug('tracer', {
      metadata: {
        requestId,
        startTime: Date.now(),
      },
    });
  }

  trace(message: string, data?: any) {
    const elapsed = Date.now() - this.logger.getMetadata('startTime');
    this.logger.setMetadata('elapsed', elapsed);

    this.logger(message, data);
    console.log(
      `[${this.logger.getMetadata('requestId')}] ${message} (${elapsed}ms)`
    );
  }

  complete() {
    const totalTime = Date.now() - this.logger.getMetadata('startTime');
    console.log(
      `Request ${this.logger.getMetadata('requestId')} completed in ${totalTime}ms`
    );
  }
}

const tracer = new RequestTracer('req-abc-123');
tracer.trace('Request received');
setTimeout(() => tracer.trace('Database query executed'), 50);
setTimeout(() => tracer.trace('Response prepared'), 100);
setTimeout(() => tracer.complete(), 150);
