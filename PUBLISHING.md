# Publishing debug-utility to npm

This guide will help you publish your debug-utility package to npm.

## Prerequisites

1. **Create an npm account** (if you don't have one):
   - Go to https://www.npmjs.com/signup
   - Or run: `npm adduser`

2. **Login to npm**:
   ```bash
   npm login
   ```

## Pre-Publishing Checklist

1. **Update package.json**:
   - Change `author` to your name
   - Update `repository.url` to your GitHub repository
   - Ensure `name` is unique (check on npmjs.com)
   - Set appropriate `version` (start with 1.0.0)

2. **Test your package locally**:
   ```bash
   npm run build
   npm test
   ```

3. **Test the package installation locally**:
   ```bash
   cd /path/to/test-project
   npm install /path/to/debug-utility
   ```

## Publishing Steps

### 1. Build the Package

```bash
npm run clean
npm run build
```

### 2. Verify Package Contents

Check what will be published:

```bash
npm pack --dry-run
```

This shows you exactly what files will be included in your package.

### 3. Publish to npm

**For first-time publishing**:

```bash
npm publish
```

**For scoped packages** (if you want to use @yourname/debug-utility):

```bash
npm publish --access public
```

### 4. Verify Publication

After publishing, verify your package:

```bash
npm info debug-utility
```

Or visit: https://www.npmjs.com/package/debug-utility

## Updating Your Package

When you make changes and want to publish a new version:

### 1. Update Version

Use semantic versioning:

```bash
# For bug fixes (1.0.0 -> 1.0.1)
npm version patch

# For new features (1.0.0 -> 1.1.0)
npm version minor

# For breaking changes (1.0.0 -> 2.0.0)
npm version major
```

This automatically:
- Updates the version in package.json
- Creates a git commit
- Creates a git tag

### 2. Build and Publish

```bash
npm run build
npm publish
```

### 3. Push to Git

```bash
git push
git push --tags
```

## Package Name Considerations

Since "debug-utility" might already be taken, you have options:

### Option 1: Use a Scoped Package

Update package.json:
```json
{
  "name": "@yourusername/debug-utility",
  ...
}
```

Then publish with:
```bash
npm publish --access public
```

Users install with:
```bash
npm install @yourusername/debug-utility
```

### Option 2: Choose a Different Name

Some suggestions:
- `debug-utility-enhanced`
- `ts-debug-utility`
- `debug-advanced`
- `debugger-plus`
- `yourusername-debug`

## Installing Your Published Package

Once published, users can install it:

```bash
npm install debug-utility
```

Or for scoped:
```bash
npm install @yourusername/debug-utility
```

## Usage by Others

```javascript
// CommonJS
const debug = require('debug-utility');

// ES6 (with TypeScript)
import debug from 'debug-utility';
import { Debugger, FilterOptions } from 'debug-utility';

const log = debug('my-app');
log('Hello world!');
```

## Continuous Integration (Optional)

You can automate publishing with GitHub Actions.

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Best Practices

1. **Always test before publishing**
2. **Use semantic versioning**
3. **Keep your README updated**
4. **Add a CHANGELOG.md** to track changes
5. **Include examples** in your documentation
6. **Respond to issues** on GitHub/npm
7. **Consider adding badges** to README (version, downloads, license)

## Unpublishing (Emergency Only)

If you need to remove a version (within 72 hours):

```bash
npm unpublish debug-utility@1.0.0
```

**Warning**: Unpublishing can break other projects that depend on your package. Use with caution!

## Getting Help

- npm documentation: https://docs.npmjs.com/
- npm support: https://www.npmjs.com/support
- Semantic versioning: https://semver.org/

## Next Steps

1. Create a GitHub repository for your package
2. Add continuous integration (CI)
3. Write comprehensive tests
4. Create more examples
5. Build a community around your package

Good luck with your npm package! 🚀
