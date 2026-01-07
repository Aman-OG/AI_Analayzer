# Testing Guide

## Overview

This project uses comprehensive testing strategies across both frontend and backend to ensure code quality and reliability.

## Backend Testing (Jest)

### Test Structure

```
server/
├── __tests__/
│   └── integration/
│       └── api.integration.test.js
├── controllers/
│   ├── authController.test.js
│   ├── jobController.test.js
│   └── resumeController.test.js (enhanced)
├── middleware/
│   └── authMiddleware.test.js
├── services/
│   └── geminiService.test.js (enhanced)
├── utils/
│   └── fileValidator.test.js
└── jest.config.js
```

### Running Backend Tests

```bash
cd server

# Run all tests with coverage
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Watch mode for development
npm run test:watch

# Verbose output
npm run test:verbose
```

### Coverage Thresholds

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Writing Backend Tests

**Controller Tests**:
```javascript
describe('POST /api/jobs', () => {
  it('should create a new job successfully', async () => {
    const response = await request(app)
      .post('/api/jobs')
      .send({ title: 'Test Job', descriptionText: 'Description' });
    
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe('Test Job');
  });
});
```

**Utility Tests**:
```javascript
describe('validateFileSize', () => {
  it('should pass for valid file size', () => {
    const result = validateFileSize(1024 * 1024);
    expect(result.isValid).toBe(true);
  });
});
```

## Frontend Testing (Vitest + Testing Library)

### Test Structure

```
client/src/
├── __tests__/
│   └── setup.ts
├── lib/
│   └── __tests__/
│       └── fileValidation.test.ts
├── pages/
│   └── __tests__/
│       └── ResumeUploadForm.test.tsx
└── vitest.config.ts
```

### Running Frontend Tests

```bash
cd client

# Run all tests with coverage
npm test

# Watch mode for development
npm run test:watch

# UI mode (interactive)
npm run test:ui
```

### Writing Frontend Tests

**Component Tests**:
```typescript
describe('ResumeUploadForm', () => {
  it('should render upload form', () => {
    render(<ResumeUploadForm jobId="test-123" />);
    expect(screen.getByLabelText(/Select Resume File/i)).toBeInTheDocument();
  });
});
```

**Utility Tests**:
```typescript
describe('validateFileSize', () => {
  it('should pass for valid file size', () => {
    const file = new File(['test'], 'test.pdf');
    const result = validateFileSize(file);
    expect(result.isValid).toBe(true);
  });
});
```

## Test Categories

### Unit Tests
- Test individual functions and components in isolation
- Mock external dependencies
- Fast execution
- High coverage

### Integration Tests
- Test multiple components working together
- Test API endpoints end-to-end
- Use in-memory database (MongoDB Memory Server)
- Verify data flow and business logic

### Component Tests
- Test React components with user interactions
- Use Testing Library for DOM queries
- Test accessibility and user experience
- Mock external services

## Best Practices

### 1. Test Naming
```javascript
describe('ComponentName or FunctionName', () => {
  it('should do something specific', () => {
    // Test implementation
  });
});
```

### 2. Arrange-Act-Assert Pattern
```javascript
it('should validate file size', () => {
  // Arrange
  const file = createTestFile();
  
  // Act
  const result = validateFileSize(file);
  
  // Assert
  expect(result.isValid).toBe(true);
});
```

### 3. Mock External Dependencies
```javascript
// Mock API calls
vi.mock('@/services/apiClient', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

// Mock Supabase
jest.mock('../config/supabaseClient', () => ({
  getSupabase: jest.fn(),
}));
```

### 4. Clean Up After Tests
```javascript
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
```

### 5. Test Error Cases
```javascript
it('should handle upload failure', async () => {
  mockUpload.mockRejectedValue(new Error('Upload failed'));
  
  await uploadFile(file);
  
  expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
});
```

## Continuous Integration

### GitHub Actions (Recommended)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd server && npm install
          cd ../client && npm install
      
      - name: Run backend tests
        run: cd server && npm test
      
      - name: Run frontend tests
        run: cd client && npm test
```

## Debugging Tests

### Backend (Jest)
```bash
# Run specific test file
npm test -- authController.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should create"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Frontend (Vitest)
```bash
# Run specific test file
npm test -- fileValidation.test.ts

# Run tests matching pattern
npm test -- --grep="should validate"

# UI mode for debugging
npm run test:ui
```

## Coverage Reports

After running tests with coverage, view reports:

**Backend**:
```bash
cd server
open coverage/index.html  # macOS
start coverage/index.html # Windows
```

**Frontend**:
```bash
cd client
open coverage/index.html  # macOS
start coverage/index.html # Windows
```

## Common Issues

### Issue: Tests timeout
**Solution**: Increase timeout in test or use `--testTimeout` flag
```javascript
it('slow test', async () => {
  // ...
}, 10000); // 10 second timeout
```

### Issue: MongoDB Memory Server fails
**Solution**: Ensure MongoDB binaries are downloaded
```bash
npm install --save-dev mongodb-memory-server
```

### Issue: React Testing Library queries fail
**Solution**: Use `waitFor` for async updates
```javascript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Supertest](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
