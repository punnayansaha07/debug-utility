# Contributing to debug-utility

Thank you for your interest in contributing to debug-utility!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/debug-utility.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development

### Building

```bash
npm run build
```

### Watching for changes

```bash
npm run watch
```

### Running examples

```bash
# Build first
npm run build

# Run an example
DEBUG=* node dist/examples/basic.js
```

## Code Style

We use ESLint and Prettier for code formatting. Run:

```bash
npm run lint
npm run format
```

## Testing

Please ensure all tests pass before submitting a PR:

```bash
npm test
```

## Commit Messages

Please use clear and descriptive commit messages:

- `feat: Add new filtering feature`
- `fix: Resolve color issue in browser`
- `docs: Update README with examples`
- `refactor: Improve filter performance`

## Pull Requests

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md

## Questions?

Feel free to open an issue for any questions or concerns.
