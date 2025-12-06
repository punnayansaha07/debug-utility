# debug-utility

[![npm version](https://img.shields.io/npm/v/debug-utility.svg)](https://www.npmjs.com/package/debug-utility)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)

A modern, TypeScript-based debugging utility with advanced filtering capabilities for Node.js and browser environments. Built as an enhanced version of the popular `debug` package with additional features.

## Features

- ✨ **TypeScript Support** - Full TypeScript types and definitions
- 🎯 **Advanced Filtering** - Regex patterns, predicates, and custom filters
- 🎨 **Colorized Output** - Beautiful colored output in terminal and browser console
- 🌐 **Universal** - Works in Node.js and browser environments
- ⚡ **Performance** - Lightweight with minimal overhead
- 📊 **Metadata Support** - Attach contextual data to log instances
- 🔧 **Extensible** - Easy to extend and customize

## Installation

```bash
npm install debug-utility
```

## Quick Start

### Basic Usage

```typescript
import debug from 'debug-utility';

const log = debug('app:server');

log('Server starting on port %d', 3000);
log('Connected to database');
```

### Enable Debug Output

**Node.js:**
```bash
DEBUG=* node app.js              # Enable all
DEBUG=app:* node app.js          # Enable app namespace
DEBUG=app:*,-app:verbose node app.js  # Enable app except verbose
```

**Browser:**
```javascript
localStorage.setItem('debug', 'app:*');
// Or via URL: ?debug=app:*
```

## Advanced Features

### 1. TypeScript Support

Full type safety and IntelliSense:

```typescript
import debug, { Debugger, FilterOptions } from 'debug-utility';

const log: Debugger = debug('my-app');

const filterOpts: FilterOptions = {
  enabled: true,
  patterns: [/^api:.*/],
  exclude: ['api:debug'],
};
```

### 2. Advanced Filtering

#### Pattern-Based Filtering

```typescript
import debug from 'debug-utility';

// Set global filter
debug.setGlobalFilter({
  include: ['app:*', 'api:*'],
  exclude: ['*:verbose', '*:debug'],
});

const log = debug('app:main');
log('This will be shown');

const verboseLog = debug('app:verbose');
verboseLog('This will be hidden');
```

#### Regex Filtering

```typescript
import debug from 'debug-utility';

debug.setGlobalFilter({
  patterns: [
    /^api:.*$/,        // Match all api namespaces
    /^app:(server|db)$/,  // Match specific namespaces
  ],
});
```

#### Custom Predicate Filters

```typescript
import debug from 'debug-utility';

debug.setGlobalFilter({
  predicates: [
    // Only log during business hours
    (namespace: string) => {
      const hour = new Date().getHours();
      return hour >= 9 && hour <= 17;
    },
    // Only log errors and warnings
    (namespace: string, ...args: any[]) => {
      const msg = args[0]?.toString() || '';
      return msg.includes('error') || msg.includes('warning');
    },
  ],
});
```

#### Instance-Specific Filtering

```typescript
import debug from 'debug-utility';

const log = debug('app:main', {
  filter: {
    enabled: true,
    predicates: [
      (namespace, ...args) => {
        // Custom logic for this instance
        return args[0]?.priority === 'high';
      },
    ],
  },
});

log({ priority: 'high' }, 'Important message');  // Shown
log({ priority: 'low' }, 'Regular message');     // Hidden
```

### 3. Metadata Support

Attach contextual data to debugger instances:

```typescript
import debug from 'debug-utility';

const log = debug('api:user', {
  metadata: {
    service: 'user-service',
    version: '1.0.0',
  },
});

log.setMetadata('requestId', '12345');
log('Processing request');

console.log(log.getMetadata('service')); // 'user-service'
```

### 4. Custom Formatters

```typescript
import debug from 'debug-utility';

// Add custom formatter
debug.formatters.j = (v: any) => {
  return JSON.stringify(v, null, 2);
};

const log = debug('app');
log('Config: %j', { port: 3000, host: 'localhost' });
```

### 5. Extending Debuggers

Create sub-namespaces:

```typescript
import debug from 'debug-utility';

const app = debug('app');
const server = app.extend('server');
const db = app.extend('db');

app('Application started');      // app
server('Server listening');      // app:server
db('Connected to database');     // app:db
```

### 6. Custom Options

```typescript
import debug from 'debug-utility';

const log = debug('app', {
  useColors: true,
  hideDate: false,
  metadata: { environment: 'production' },
  log: (...args) => {
    // Custom log function
    console.log('[CUSTOM]', ...args);
  },
});
```

## API Reference

### Factory Function

```typescript
debug(namespace: string, options?: DebugOptions): Debugger
```

#### Options

- `namespace`: String identifier for the debugger instance
- `useColors`: Enable/disable colors (default: auto-detected)
- `hideDate`: Hide timestamp in output
- `log`: Custom log function
- `filter`: Instance-specific filter options
- `metadata`: Additional contextual data

### Debugger Instance

#### Methods

- `log(...args)`: Log a message
- `extend(namespace, delimiter?)`: Create a sub-debugger
- `setFilter(filter)`: Update filter options
- `setMetadata(key, value)`: Set metadata
- `getMetadata(key)`: Get metadata

#### Properties

- `namespace`: The namespace string
- `enabled`: Whether this debugger is enabled
- `useColors`: Whether colors are used
- `color`: Assigned color
- `diff`: Time difference from previous log

### Global Methods

```typescript
debug.enable(namespaces: string): void
debug.disable(): string
debug.enabled(name: string): boolean
debug.setGlobalFilter(filter: FilterOptions): void
debug.getGlobalFilter(): FilterOptions
```

### Filter Options

```typescript
interface FilterOptions {
  enabled?: boolean;
  patterns?: RegExp[];
  predicates?: FilterPredicate[];
  include?: string[];
  exclude?: string[];
  tags?: string[];
  minLevel?: number;
  maxLevel?: number;
}
```

## Environment Variables (Node.js)

- `DEBUG`: Enable namespaces (e.g., `DEBUG=app:*`)
- `DEBUG_COLORS`: Force colors on/off
- `DEBUG_HIDE_DATE`: Hide timestamps
- `DEBUG_SHOW_HIDDEN`: Show hidden properties in objects

## Browser Console

In browser environments, you can:

1. Set via localStorage: `localStorage.setItem('debug', 'app:*')`
2. Set via URL parameter: `?debug=app:*`
3. Use browser console: `debug.enable('app:*')`

## Examples

### Express Server

```typescript
import debug from 'debug-utility';
import express from 'express';

const app = express();
const log = debug('server');
const reqLog = debug('server:request');
const errLog = debug('server:error');

app.use((req, res, next) => {
  reqLog('%s %s', req.method, req.url);
  next();
});

app.get('/', (req, res) => {
  log('Handling root request');
  res.send('Hello World');
});

app.use((err, req, res, next) => {
  errLog('Error: %O', err);
  res.status(500).send('Internal Server Error');
});

const PORT = 3000;
app.listen(PORT, () => {
  log('Server started on port %d', PORT);
});
```

### Microservice with Filtering

```typescript
import debug from 'debug-utility';

// Only log errors and warnings in production
if (process.env.NODE_ENV === 'production') {
  debug.setGlobalFilter({
    predicates: [
      (namespace, ...args) => {
        const msg = JSON.stringify(args);
        return msg.includes('error') || msg.includes('warn');
      },
    ],
  });
}

const log = debug('service:main');
const errorLog = debug('service:error');

log('Service starting...'); // Hidden in production
errorLog('Critical error occurred!'); // Always shown
```

## Migration from `debug`

`debug-utility` is designed to be a drop-in replacement for the `debug` package:

```typescript
// Before
const debug = require('debug');
const log = debug('app');

// After
import debug from 'debug-utility';
const log = debug('app');
```

All existing functionality is preserved, with additional features available when needed.

## Performance

`debug-utility` is designed with performance in mind:

- Disabled debuggers have near-zero overhead
- Filtering is evaluated lazily
- No dependencies beyond `ms` for time formatting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11+ (with polyfills)

## Node.js Support

- Node.js >= 18.0.0 (LTS)

## License

MIT © Your Name

## Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

## Credits

Inspired by the excellent [debug](https://github.com/debug-js/debug) package by TJ Holowaychuk and contributors.

## Changelog

### 1.0.0
- Initial release
- TypeScript support
- Advanced filtering capabilities
- Metadata support
- Full backward compatibility with `debug`
