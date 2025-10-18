# OpenAsk API

RESTful API backend for the OpenAsk Q&A platform built with Express, TypeScript, MongoDB, and Auth0.

## Features

- 🔐 Auth0 JWT authentication
- 📝 Full CRUD operations for questions and answers
- 👍 Voting system with toggle support
- 🔍 Full-text search with relevance scoring
- 🏷️ Tag-based filtering and discovery
- 🤖 AI-powered draft answers using Google Gemini
- 📄 Pagination (max 50 items per page)
- 🛡️ Rate limiting on write endpoints
- ✨ Markdown sanitization for safe content
- 🗄️ MongoDB with text indexes for performance
- 📊 Health checks and graceful shutdown

## Prerequisites

- Node.js 18+ 
- pnpm 8+
- MongoDB 6+
- Auth0 account (for authentication)
- Google Gemini API key (optional, will use mock if not provided)

## Setup

### 1. Install Dependencies

```bash
cd apps/api
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

#### Required Variables

| Variable         | Description               | Example                               |
| ---------------- | ------------------------- | ------------------------------------- |
| `PORT`           | Server port               | `3000`                                |
| `NODE_ENV`       | Environment               | `development` / `production` / `test` |
| `MONGODB_URI`    | MongoDB connection string | `mongodb://localhost:27017/openask`   |
| `WEB_ORIGIN`     | Frontend URL (for CORS)   | `http://localhost:5173`               |
| `AUTH0_DOMAIN`   | Auth0 tenant domain       | `your-tenant.auth0.com`               |
| `AUTH0_AUDIENCE` | Auth0 API identifier      | `https://api.openask.com`             |

#### Optional Variables

| Variable               | Description                       | Default              |
| ---------------------- | --------------------------------- | -------------------- |
| `GEMINI_API_KEY`       | Google Gemini API key (AI drafts) | Uses mock if not set |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms           | `900000` (15 min)    |
| `RATE_LIMIT_MAX`       | Max requests per window           | `100`                |
| `LOG_LEVEL`            | Logging level                     | `info`               |

### 3. Start MongoDB

Ensure MongoDB is running:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or using local installation
mongod
```

### 4. Run Development Server

```bash
pnpm dev
```

The API will be available at `http://localhost:3000` (or your configured PORT).

## Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start development server with hot reload |
| `pnpm build`     | Build for production                     |
| `pnpm start`     | Start production server                  |
| `pnpm test`      | Run tests                                |
| `pnpm lint`      | Lint code with ESLint                    |
| `pnpm typecheck` | Type-check with TypeScript               |
| `pnpm seed`      | Populate database with demo data         |

## API Endpoints

All endpoints are prefixed with `/api/v1` unless otherwise noted.

### Health & Status

#### GET /health

Check API and database health.

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T10:00:00.000Z",
  "uptime": 123.45,
  "version": "1.0.0",
  "database": {
    "connected": true,
    "state": "connected"
  }
}
```

### Authentication

#### GET /api/v1/profile

Get authenticated user profile. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "sub": "auth0|123456",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Questions

#### GET /api/v1/questions

List questions with optional filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 50) - Items per page
- `q` (string) - Full-text search query
- `tag` (string) - Filter by tag
- `sort` (enum: `new`, `votes`, `answers`, default: `new`) - Sort order

**Response 200:**
```json
{
  "items": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "How do I use React hooks?",
      "body": "I'm trying to understand useState...",
      "tags": ["react", "hooks"],
      "author": {
        "sub": "auth0|123",
        "name": "Alice"
      },
      "voteCount": 5,
      "answerCount": 3,
      "userVote": 1,
      "createdAt": "2025-10-18T10:00:00.000Z",
      "updatedAt": "2025-10-18T10:00:00.000Z"
    }
  ],
  "pageInfo": {
    "currentPage": 1,
    "pageSize": 20,
    "totalItems": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### POST /api/v1/questions

Create a new question. Requires authentication. Generates AI draft answer.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "title": "How do I use TypeScript generics?",
  "body": "I'm trying to understand generic constraints...",
  "tags": ["typescript", "generics"]
}
```

**Validation:**
- `title`: 10-160 characters
- `body`: minimum 20 characters
- `tags`: 1-5 tags, each tag alphanumeric + hyphens

**Response 201:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "How do I use TypeScript generics?",
  "body": "I'm trying to understand...",
  "tags": ["typescript", "generics"],
  "author": {
    "sub": "auth0|123",
    "name": "Alice"
  },
  "voteCount": 0,
  "answerCount": 0,
  "aiDraftAnswer": "TypeScript generics allow you to...",
  "userVote": null,
  "createdAt": "2025-10-18T10:00:00.000Z",
  "updatedAt": "2025-10-18T10:00:00.000Z"
}
```

#### GET /api/v1/questions/:id

Get a specific question by ID.

**Response 200:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "How do I use React hooks?",
  "body": "...",
  "tags": ["react", "hooks"],
  "author": {
    "sub": "auth0|123",
    "name": "Alice"
  },
  "voteCount": 5,
  "answerCount": 3,
  "aiDraftAnswer": "React hooks allow you to...",
  "userVote": 1,
  "createdAt": "2025-10-18T10:00:00.000Z",
  "updatedAt": "2025-10-18T10:00:00.000Z"
}
```

#### PATCH /api/v1/questions/:id

Update a question. Requires authentication and ownership.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "title": "Updated title",
  "body": "Updated body",
  "tags": ["new", "tags"]
}
```

**Response 200:** Same as GET question

### Voting

#### POST /api/v1/questions/:id/vote

Vote on a question. Requires authentication. Clicking same vote toggles it off.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "value": 1
}
```

**Validation:**
- `value`: must be `1` (upvote) or `-1` (downvote)

**Response 200:**
```json
{
  "voteCount": 6,
  "userVote": 1
}
```

#### POST /api/v1/answers/:id/vote

Vote on an answer. Same behavior as question voting.

### Answers

#### GET /api/v1/questions/:questionId/answers

List answers for a question.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 50)
- `sort` (enum: `new`, `votes`, default: `votes`)

**Response 200:**
```json
{
  "items": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "questionId": "507f1f77bcf86cd799439011",
      "body": "You can use useState like this...",
      "author": {
        "sub": "auth0|456",
        "name": "Bob"
      },
      "voteCount": 8,
      "userVote": null,
      "createdAt": "2025-10-18T11:00:00.000Z",
      "updatedAt": "2025-10-18T11:00:00.000Z"
    }
  ],
  "pageInfo": { ... }
}
```

#### POST /api/v1/questions/:questionId/answers

Create an answer. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "body": "Here's how you use React hooks..."
}
```

**Validation:**
- `body`: minimum 20 characters

**Response 201:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "questionId": "507f1f77bcf86cd799439011",
  "body": "Here's how you use React hooks...",
  "author": {
    "sub": "auth0|123",
    "name": "Alice"
  },
  "voteCount": 0,
  "userVote": null,
  "createdAt": "2025-10-18T11:00:00.000Z",
  "updatedAt": "2025-10-18T11:00:00.000Z"
}
```

#### PATCH /api/v1/answers/:id

Update an answer. Requires authentication and ownership.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "body": "Updated answer content..."
}
```

**Response 200:** Same as GET answer

### Tags

#### GET /api/v1/tags/top

Get top tags by usage count.

**Query Parameters:**
- `limit` (number, default: 20, max: 50)

**Response 200:**
```json
{
  "tags": [
    {
      "tag": "javascript",
      "count": 45
    },
    {
      "tag": "react",
      "count": 32
    }
  ]
}
```

### Search

#### GET /api/v1/search

Full-text search across questions.

**Query Parameters:**
- `q` (string, required) - Search query (1-100 chars)
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 50)
- `sort` (enum: `relevance`, `new`, `votes`, default: `relevance`)

**Response 200:** Same structure as GET questions

## Authentication

The API uses Auth0 JWT tokens for authentication.

### Getting a Token

1. Configure Auth0 application (SPA or Regular Web App)
2. Set up Auth0 API with identifier matching `AUTH0_AUDIENCE`
3. Use Auth0 SDK in your frontend to get access token
4. Include token in `Authorization` header: `Bearer <token>`

### Protected Endpoints

These endpoints require authentication:
- `POST /api/v1/questions`
- `PATCH /api/v1/questions/:id`
- `POST /api/v1/questions/:id/vote`
- `POST /api/v1/questions/:questionId/answers`
- `PATCH /api/v1/answers/:id`
- `POST /api/v1/answers/:id/vote`
- `GET /api/v1/profile`

## Rate Limiting

Write endpoints are rate-limited to prevent abuse:

- **Window:** 15 minutes (configurable via `RATE_LIMIT_WINDOW_MS`)
- **Max requests:** 100 per window (configurable via `RATE_LIMIT_MAX`)

Rate limit headers are included in responses:
- `RateLimit-Limit`: Maximum requests
- `RateLimit-Remaining`: Remaining requests
- `RateLimit-Reset`: Time until limit resets

## Error Responses

All errors follow this structure:

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": { /* optional additional info */ }
}
```

### Common Error Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 400  | Bad Request - Validation error          |
| 401  | Unauthorized - Missing or invalid token |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource doesn't exist      |
| 409  | Conflict - Vote conflict                |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error                   |

## Data Models

### Question

```typescript
{
  _id: ObjectId
  title: string (10-160 chars)
  body: string (min 20 chars, markdown)
  tags: string[] (1-5 tags)
  author: ObjectId (ref: User)
  authorSub: string (Auth0 sub)
  authorName: string
  voteCount: number
  answerCount: number
  aiDraftAnswer?: string
  createdAt: Date
  updatedAt: Date
}
```

### Answer

```typescript
{
  _id: ObjectId
  question: ObjectId (ref: Question)
  body: string (min 20 chars, markdown)
  author: ObjectId (ref: User)
  authorSub: string
  authorName: string
  voteCount: number
  createdAt: Date
  updatedAt: Date
}
```

### Vote

```typescript
{
  targetType: 'question' | 'answer'
  targetId: ObjectId
  userId: string (Auth0 sub)
  value: 1 | -1
  createdAt: Date
  updatedAt: Date
}
```

## Development

### Running Tests

```bash
pnpm test
```

Tests use `mongodb-memory-server` for isolated testing.

### Seeding Demo Data

```bash
pnpm seed
```

Creates:
- 4 demo users
- 5 questions with tags
- 6 answers
- Random votes

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

## Production Deployment

### Build

```bash
pnpm build
```

Output: `dist/` directory

### Start Production Server

```bash
NODE_ENV=production pnpm start
```

### Environment Checklist

- ✅ Set `NODE_ENV=production`
- ✅ Use strong `MONGODB_URI` with authentication
- ✅ Configure proper `WEB_ORIGIN` for CORS
- ✅ Set up Auth0 production tenant
- ✅ Provide `GEMINI_API_KEY` for AI features
- ✅ Configure rate limits appropriately
- ✅ Set `LOG_LEVEL=error` or `warn`
- ✅ Enable MongoDB replica set for production
- ✅ Set up monitoring and logging
- ✅ Configure reverse proxy (nginx/Caddy)

## Architecture

### Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 4
- **Language:** TypeScript 5 (strict mode, ESM)
- **Database:** MongoDB 6+ via Mongoose 8
- **Auth:** Auth0 (express-oauth2-jwt-bearer)
- **AI:** Google Generative AI (Gemini 1.5 Flash)
- **Validation:** Zod
- **Testing:** Vitest + Supertest
- **Logging:** Pino

### Key Features

- **Text Search:** MongoDB text indexes on question title/body
- **Indexes:** Compound indexes on votes, optimized queries
- **Graceful Shutdown:** SIGTERM/SIGINT handlers with 10s timeout
- **Retry Logic:** MongoDB connection with exponential backoff
- **Security:** helmet, CORS, rate limiting, markdown sanitization
- **Observability:** Structured logging, health checks

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
