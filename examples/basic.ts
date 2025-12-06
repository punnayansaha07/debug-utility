/**
 * Basic usage examples for debug-utility
 */

import debug from '../index';

// Create debuggers
const app = debug('app');
const server = debug('app:server');
const db = debug('app:db');
const worker = debug('worker');

// Basic logging
app('Application starting...');
server('Server initializing on port %d', 3000);
db('Connecting to database at %s', 'localhost:5432');

// Using formatters
app('Config: %O', { port: 3000, env: 'development' });

// Extending debuggers
const serverRouter = server.extend('router');
const serverMiddleware = server.extend('middleware');

serverRouter('Registering routes...');
serverMiddleware('Loading middleware...');

// Time differences
setTimeout(() => {
  app('First delayed log');
}, 100);

setTimeout(() => {
  app('Second delayed log (note the time diff)');
}, 500);

// Worker example
function doWork() {
  worker('Processing task...');
  setTimeout(doWork, Math.random() * 1000);
}

doWork();

console.log('\n--- To see output, run with DEBUG environment variable ---');
console.log('Examples:');
console.log('  DEBUG=* node examples/basic.js');
console.log('  DEBUG=app:* node examples/basic.js');
console.log('  DEBUG=app:*,-app:db node examples/basic.js');
