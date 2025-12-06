/**
 * Advanced filtering examples for debug-utility
 */

import debug from '../index';

// Example 1: Pattern-based filtering
console.log('=== Example 1: Pattern-Based Filtering ===\n');

debug.setGlobalFilter({
  include: ['api:*', 'service:*'],
  exclude: ['*:verbose'],
});

const api = debug('api:users');
const apiVerbose = debug('api:verbose');
const service = debug('service:auth');
const app = debug('app:main');

api('Fetching users'); // Shown
apiVerbose('Detailed API call info'); // Hidden
service('Authenticating user'); // Shown
app('App started'); // Hidden

// Example 2: Regex filtering
console.log('\n=== Example 2: Regex Filtering ===\n');

debug.setGlobalFilter({
  patterns: [/^api:(users|posts)$/, /^service:.*$/],
});

const apiUsers = debug('api:users');
const apiPosts = debug('api:posts');
const apiComments = debug('api:comments');
const serviceDb = debug('service:db');

apiUsers('User query'); // Shown
apiPosts('Post query'); // Shown
apiComments('Comment query'); // Hidden
serviceDb('Database connected'); // Shown

// Example 3: Predicate filtering
console.log('\n=== Example 3: Predicate Filtering ===\n');

debug.setGlobalFilter({
  enabled: true,
  predicates: [
    // Only log errors and warnings
    (namespace: string, ...args: any[]) => {
      const msg = JSON.stringify(args).toLowerCase();
      return msg.includes('error') || msg.includes('warn');
    },
  ],
});

const logger = debug('app');
logger('Normal log'); // Hidden
logger('Warning: Low memory'); // Shown
logger('Error: Connection failed'); // Shown
logger('Info message'); // Hidden

// Example 4: Time-based filtering
console.log('\n=== Example 4: Time-Based Filtering ===\n');

debug.setGlobalFilter({
  predicates: [
    // Only log during working hours (9 AM - 5 PM)
    () => {
      const hour = new Date().getHours();
      return hour >= 9 && hour <= 17;
    },
  ],
});

const timeLogger = debug('time-based');
const currentHour = new Date().getHours();
timeLogger('Current time check (hour: %d)', currentHour);

if (currentHour >= 9 && currentHour <= 17) {
  console.log('✓ Logs shown during business hours');
} else {
  console.log('✗ Logs hidden outside business hours');
}

// Example 5: Instance-specific filtering
console.log('\n=== Example 5: Instance-Specific Filtering ===\n');

// Reset global filter
debug.setGlobalFilter({ enabled: false });

const filteredLogger = debug('filtered', {
  filter: {
    enabled: true,
    predicates: [
      (namespace: string, ...args: any[]) => {
        // Only log high priority messages
        return args[0]?.priority === 'high';
      },
    ],
  },
});

filteredLogger({ priority: 'high' }, 'Important message'); // Shown
filteredLogger({ priority: 'low' }, 'Regular message'); // Hidden
filteredLogger({ priority: 'medium' }, 'Medium priority'); // Hidden

// Example 6: Complex filtering
console.log('\n=== Example 6: Complex Multi-Layer Filtering ===\n');

debug.setGlobalFilter({
  enabled: true,
  include: ['app:*', 'api:*'],
  exclude: ['*:debug'],
  predicates: [
    (namespace: string) => {
      // Exclude test namespaces
      return !namespace.includes('test');
    },
  ],
});

const complexApp = debug('app:main');
const complexTest = debug('app:test');
const complexDebug = debug('app:debug');
const complexApi = debug('api:handler');

complexApp('Main app log'); // Shown
complexTest('Test log'); // Hidden (by predicate)
complexDebug('Debug log'); // Hidden (by exclude)
complexApi('API handler'); // Shown

console.log('\n--- Run with DEBUG=* to see filtered output ---');
