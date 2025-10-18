// Vitest setup for API tests
// Set test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.MONGODB_URI = 'mongodb://localhost:27017/openask-test';
process.env.WEB_ORIGIN = 'http://localhost:5173';
process.env.AUTH0_DOMAIN = 'test.auth0.com';
process.env.AUTH0_AUDIENCE = 'https://api.test.com';
process.env.LOG_LEVEL = 'error';
