# Tests Directory

This directory contains all test files organized by category.

## Structure

### `/ui/` - User Interface Tests
- **test-share-cards.js** - Tests for share card generation
- **test-local-share-cards.js** - Local share card testing
- **test-footer-debug.html** - Footer rendering debug page
- **test-footer-render.js** - Footer component rendering tests

### `/api/` - API and Backend Tests
- **test-api.js** - General API endpoint testing
- **test-daily-api.js** - Daily forecast API tests
- **test-bazi-calculation.js** - Bazi calculation logic tests
- **test-caching.js** - Caching functionality tests
- **test-caching-extended.js** - Extended caching tests
- **test-local.js** - Local development API tests

### `/analytics/` - Analytics Tests
- **test-analytics.js** - General analytics testing
- **test-production-analytics.js** - Production analytics verification

### `/debug/` - Debug and Development Tools
- **debug-footer.js** - Footer debugging
- **debug-footer-comprehensive.js** - Comprehensive footer debugging
- **debug-analytics-errors.js** - Analytics error debugging
- **test-portrait-debug.js** - Portrait mode debugging

## Available Scripts

### UI Tests
```bash
npm run test-card          # Test share card generation
npm run test:ui           # Test local share cards
```

### API Tests
```bash
npm run test:api          # Test general API endpoints
npm run test-caching      # Test caching functionality
npm run test-caching-extended  # Extended caching tests
```

### Analytics Tests
```bash
npm run test:analytics    # Test analytics functionality
```

### Debug Tools
```bash
npm run test:debug        # Run footer debug tests
```

## Running Tests

### Individual Tests
```bash
# UI Tests
node tests/ui/test-share-cards.js
node tests/ui/test-local-share-cards.js

# API Tests
node tests/api/test-api.js
node tests/api/test-caching.js
node tests/api/test-daily-api.js

# Analytics Tests
node tests/analytics/test-analytics.js
node tests/analytics/test-production-analytics.js

# Debug Tools
node tests/debug/debug-footer.js
node tests/debug/debug-analytics-errors.js
```

### HTML Debug Pages
Open these files directly in your browser:
- `tests/ui/test-footer-debug.html` - Footer debugging interface

## Adding New Tests

1. **UI Tests**: Place in `/ui/` directory
2. **API Tests**: Place in `/api/` directory  
3. **Analytics Tests**: Place in `/analytics/` directory
4. **Debug Tools**: Place in `/debug/` directory

5. **Update package.json**: Add new scripts if needed
6. **Update this README**: Document new tests

## Notes

- All tests are Node.js scripts unless otherwise specified
- HTML files are for browser-based debugging
- Tests are organized by functionality, not by technology
- Debug tools are separate from regular tests for clarity 