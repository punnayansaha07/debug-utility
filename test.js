/**
 * Simple test file to verify debug-utility functionality
 */

const debug = require('./dist/index');

console.log('=== Testing debug-utility ===\n');

// Enable all debug output
debug.enable('*');

// Test 1: Basic logging
console.log('Test 1: Basic logging');
const log = debug('test:basic');
log('Hello from debug-utility!');
log('Testing with multiple arguments: %s %d', 'string', 42);

// Test 2: Extended loggers
console.log('\nTest 2: Extended loggers');
const parent = debug('app');
const child = parent.extend('child');
parent('Parent log');
child('Child log');

// Test 3: Filtering
console.log('\nTest 3: Advanced filtering');
debug.setGlobalFilter({
  include: ['test:*'],
  exclude: ['test:hidden'],
});

const visible = debug('test:visible');
const hidden = debug('test:hidden');
const other = debug('other:log');

visible('This should be visible');
hidden('This should be hidden');
other('This should also be hidden');

// Test 4: Metadata
console.log('\nTest 4: Metadata');
const metaLogger = debug('test:meta');
metaLogger.setMetadata('user', 'john');
metaLogger.setMetadata('sessionId', '12345');
metaLogger('Log with metadata');
console.log('User metadata:', metaLogger.getMetadata('user'));
console.log('Session metadata:', metaLogger.getMetadata('sessionId'));

// Test 5: Custom filters with predicates
console.log('\nTest 5: Custom predicate filters');
debug.setGlobalFilter({
  enabled: true,
  predicates: [
    (namespace, ...args) => {
      const msg = JSON.stringify(args).toLowerCase();
      return msg.includes('important');
    },
  ],
});

const predicateLog = debug('test:predicate');
predicateLog('This is an important message');
predicateLog('This is a regular message');

console.log('\n=== All tests completed ===');
console.log('\nTo see colored output in terminal, run with DEBUG=* node test.js');
