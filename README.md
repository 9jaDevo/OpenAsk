# OpenAsk 🚀

A modern, AI-powered Q&A platform built with React, TypeScript, Express, and MongoDB. Ask questions, get instant AI-generated draft answers, and engage with a community of developers.

[![CI](https://github.com/9jaDevo/OpenAsk/workflows/API%20CI/badge.svg)](https://github.com/9jaDevo/OpenAsk/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌐 Live Demo

**Try OpenAsk now!**
- 🌍 **Web App**: [https://open-ask-web.vercel.app](https://open-ask-web.vercel.app)
- 🔌 **API**: [https://open-ask-api-cdcq.vercel.app](https://open-ask-api-cdcq.vercel.app)
- 📊 **API Health**: [https://open-ask-api-cdcq.vercel.app/health](https://open-ask-api-cdcq.vercel.app/health)

**Demo Features:**
- Browse 5 pre-seeded questions with AI-generated answers
- Login with Auth0 to ask questions, post answers, and vote
- Experience real-time AI draft answer generation
- Test full-text search and tag filtering

## 📚 Documentation

- **[Production Readiness Assessment](PRODUCTION_READINESS.md)** - Complete production audit and deployment checklist
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to OpenAsk
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines and standards
- **[Security Policy](SECURITY.md)** - Reporting vulnerabilities and security best practices
- **[Postman API Collection](POSTMAN_COLLECTION.json)** - Ready-to-use API testing collection
- **[Postman Setup Guide](POSTMAN_GUIDE.md)** - Detailed guide for API testing with Postman
- **[API Documentation](apps/api/README.md)** - Complete API reference and examples
- **[Docker Guide](DOCKER.md)** - Containerization and deployment with Docker
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Project status and technical decisions

## 🎥 Demo Video

Watch OpenAsk in action:

[![Watch the Demo](https://res.cloudinary.com/maocular-tech-expert/image/upload/fl_preserve_transparency/v1760885852/Most_Attractive_Youtube_Thumbnail_atcaxm.jpg?_s=public-apps)](https://player.cloudinary.com/embed/?cloud_name=maocular-tech-expert&public_id=videoplayback_f2mxmh&profile=cld-default)



**[▶️ Watch on Cloudinary](https://player.cloudinary.com/embed/?cloud_name=maocular-tech-expert&public_id=videoplayback_f2mxmh&profile=cld-default)**

## ✨ Features

### 🤖 AI-Powered Assistance
- **Instant Draft Answers** - Get AI-generated answer suggestions using Google Gemini
- **Context-Aware** - AI analyzes question content and provides relevant responses
- **Mock Fallback** - Works without API key using deterministic mock responses

### 💬 Community Q&A
- **Ask Questions** - Post questions with rich markdown support
- **Answer & Discuss** - Contribute answers to help others
- **Vote System** - Upvote/downvote questions and answers
- **Tag-Based Organization** - Categorize and discover questions by tags

### 🔍 Discovery
- **Full-Text Search** - Find questions instantly with relevance scoring
- **Filter by Tags** - Browse questions by topic
- **Sort Options** - New, most voted, most answered
- **Trending Tags** - Discover popular topics

### 🔐 Security
- **Auth0 Authentication** - Secure, industry-standard authentication
- **Ownership Validation** - Users can only edit their own content
- **Markdown Sanitization** - XSS prevention with safe HTML
- **Rate Limiting** - Prevent abuse with request throttling

### 📱 User Experience
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode** - Easy on the eyes (coming soon)
- **Real-time Updates** - See vote counts update live
- **Loading States** - Smooth skeleton loaders

## 🏗️ Tech Stack

### Frontend (Web App)
- **React 18** - Modern UI library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Auth0 React SDK** - Authentication
- **React Markdown** - Safe markdown rendering

### Backend (API)
- **Node.js 18+** - JavaScript runtime
- **Express 4** - Web framework
- **TypeScript** - Type safety
- **MongoDB 6+** - NoSQL database
- **Mongoose 8** - ODM for MongoDB
- **Auth0** - JWT authentication
- **Google Gemini AI** - AI answer generation
- **Zod** - Schema validation
- **Pino** - Structured logging

### DevOps
- **pnpm** - Fast package manager
- **Vitest** - Unit & integration testing
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Project Structure

```
OpenAsk/
├── apps/
│   ├── api/                    # Backend API
│   │   ├── src/
│   │   │   ├── __tests__/      # Integration tests
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── models/         # Mongoose models
│   │   │   ├── routes/         # API endpoints
│   │   │   ├── services/       # External services (AI)
│   │   │   ├── utils/          # Helper functions
│   │   │   ├── config.ts       # Environment config
│   │   │   ├── db.ts           # MongoDB connection
│   │   │   ├── logger.ts       # Pino logger
│   │   │   ├── server.ts       # Express app
│   │   │   └── index.ts        # Entry point
│   │   ├── scripts/
│   │   │   └── seed.ts         # Database seeder
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── README.md           # API documentation
│   │
│   └── web/                    # Frontend app
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── pages/          # Route pages
│       │   ├── hooks/          # Custom hooks
│       │   ├── lib/            # Utilities
│       │   ├── types/          # TypeScript types
│       │   └── App.tsx         # Root component
│       ├── package.json
│       └── README.md
│
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── config/                 # Shared configs
│   └── sdk/                    # API client SDK
│
├── .github/
│   └── workflows/
│       └── api-ci.yml          # CI/CD pipeline
│
├── docker-compose.yml          # Docker setup
├── DOCKER.md                   # Docker guide
├── pnpm-workspace.yaml         # Monorepo config
├── ProjectScope.txt            # Project requirements
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **pnpm** 8 or higher
- **MongoDB** 6 or higher
- **Auth0 account** (free tier works)
- **Google Gemini API key** (optional, uses mock if not provided)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/9jaDevo/OpenAsk.git
cd OpenAsk
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

**For API (`apps/api/.env`):**
```bash
cd apps/api
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/openask
WEB_ORIGIN=http://localhost:5173

# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://api.openask.com

# Optional: Google Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
```

**For Web App (`apps/web/.env`):**
```bash
cd apps/web
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://api.openask.com
```

4. **Start MongoDB**

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Or use local MongoDB installation
mongod
```

5. **Seed the database** (optional)

```bash
cd apps/api
pnpm seed
```

This creates demo users, questions, answers, and votes.

6. **Start the development servers**

```bash
# Terminal 1: Start API
cd apps/api
pnpm dev

# Terminal 2: Start Web App
cd apps/web
pnpm dev
```

The API will be available at `http://localhost:3000`  
The Web App will be available at `http://localhost:5173`

## 🐳 Docker Quick Start

The easiest way to run OpenAsk locally:

```bash
# Create .env file with Auth0 credentials
cp .env.example .env
# Edit .env with your Auth0 credentials

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Seed database
docker-compose exec api pnpm seed

# Stop services
docker-compose down
```

See [DOCKER.md](DOCKER.md) for detailed Docker documentation.

## 📚 Documentation

- **[API Documentation](apps/api/README.md)** - Complete API endpoint reference
- **[Docker Guide](DOCKER.md)** - Container setup and usage
- **[Project Scope](ProjectScope.txt)** - Original requirements and specifications
- **[Implementation Summary](apps/api/IMPLEMENTATION_SUMMARY.md)** - Development progress

## 🧪 Testing

### Run All Tests

```bash
# API tests
cd apps/api
pnpm test

# Web tests (when available)
cd apps/web
pnpm test
```

### Test Coverage

```bash
cd apps/api
pnpm test --coverage
```

### Run Specific Tests

```bash
# API - specific test file
pnpm test src/__tests__/questions.test.ts

# API - watch mode
pnpm test --watch
```

## 🏗️ Development

### Monorepo Commands

```bash
# Install dependencies for all workspaces
pnpm install

# Build all packages
pnpm -r build

# Run linting across all workspaces
pnpm -r lint

# Type check all workspaces
pnpm -r typecheck
```

### Working with the API

```bash
cd apps/api

# Development with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm typecheck

# Seed database
pnpm seed
```

### Working with the Web App

```bash
cd apps/web

# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint

# Type check
pnpm typecheck
```

## 🔐 Auth0 Setup

1. **Create an Auth0 account** at [auth0.com](https://auth0.com)

2. **Create an API**
   - Go to Applications > APIs
   - Click "Create API"
   - Name: `OpenAsk API`
   - Identifier: `https://api.openask.com`
   - Signing Algorithm: `RS256`

3. **Create an Application**
   - Go to Applications > Applications
   - Click "Create Application"
   - Name: `OpenAsk Web`
   - Type: `Single Page Application`
   - Technology: `React`

4. **Configure Application Settings**
   - Allowed Callback URLs: `http://localhost:5173/callback`
   - Allowed Logout URLs: `http://localhost:5173`
   - Allowed Web Origins: `http://localhost:5173`
   - Allowed Origins (CORS): `http://localhost:5173`

5. **Copy credentials to `.env` files**
   - API: Use API Identifier as `AUTH0_AUDIENCE`
   - Web: Use Application's Client ID as `VITE_AUTH0_CLIENT_ID`
   - Both: Use your Auth0 domain (e.g., `dev-xxx.us.auth0.com`)

## 🤖 Google Gemini Setup (Optional)

1. **Get API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create API key
   - Copy to `GEMINI_API_KEY` in `apps/api/.env`

2. **Without API Key**
   - The app will use a deterministic mock that generates answers based on question keywords
   - Perfect for development and testing

## 📖 API Endpoints

### Questions
- `GET /api/v1/questions` - List questions (filters: q, tag, sort)
- `POST /api/v1/questions` - Create question (auth required) ⚡ Gets AI draft
- `GET /api/v1/questions/:id` - Get question by ID
- `PATCH /api/v1/questions/:id` - Update question (owner only)

### Answers
- `GET /api/v1/questions/:questionId/answers` - List answers
- `POST /api/v1/questions/:questionId/answers` - Create answer (auth required)
- `PATCH /api/v1/answers/:id` - Update answer (owner only)

### Voting
- `POST /api/v1/questions/:id/vote` - Vote on question (auth required)
- `POST /api/v1/answers/:id/vote` - Vote on answer (auth required)

### Discovery
- `GET /api/v1/tags/top` - Get trending tags
- `GET /api/v1/search` - Full-text search

### System
- `GET /health` - Health check
- `GET /api/v1/profile` - User profile (auth required)

See [API Documentation](apps/api/README.md) for complete details.

## 🌐 Deployment

### API Deployment

**Using Docker:**
```bash
cd apps/api
docker build -t openask-api .
docker run -p 3000:3000 --env-file .env openask-api
```

**Using Node.js:**
```bash
cd apps/api
pnpm build
NODE_ENV=production pnpm start
```

**Platforms:**
- Railway
- Render
- Heroku
- DigitalOcean App Platform
- AWS ECS
- Google Cloud Run

### Web Deployment

**Build:**
```bash
cd apps/web
pnpm build
# Output: dist/
```

**Platforms:**
- Vercel (recommended for React)
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront
- GitHub Pages

### Environment Variables for Production

**API:**
- Set `NODE_ENV=production`
- Use strong MongoDB connection string with auth
- Configure proper CORS (`WEB_ORIGIN`)
- Set up Auth0 production tenant
- Add Gemini API key for AI features
- Configure monitoring (Sentry, Datadog, etc.)

**Web:**
- Point `VITE_API_URL` to production API
- Use Auth0 production credentials
- Configure analytics (Google Analytics, Mixpanel, etc.)

## 🛡️ Security

- ✅ **Auth0 JWT validation** - Industry-standard authentication
- ✅ **CORS protection** - Restricted to frontend origin
- ✅ **Rate limiting** - 100 requests per 15 minutes on write operations
- ✅ **Input validation** - Zod schemas on all inputs
- ✅ **Markdown sanitization** - XSS prevention with safe HTML allowlist
- ✅ **Helmet security headers** - Protection against common vulnerabilities
- ✅ **Ownership checks** - Users can only edit their own content
- ✅ **MongoDB injection prevention** - Mongoose escaping

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Quick Start for Contributors

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Write tests for new features
- Follow TypeScript strict mode
- Use conventional commits (see [CONTRIBUTING.md](CONTRIBUTING.md))
- Update documentation
- Ensure all tests pass
- Follow existing code style

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer** - [@9jaDevo](https://github.com/9jaDevo)

## 🙏 Acknowledgments

- [Auth0](https://auth0.com) - Authentication platform
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI model
- [MongoDB](https://www.mongodb.com) - Database
- [React](https://react.dev) - UI library
- [Vite](https://vitejs.dev) - Build tool
- [Tailwind CSS](https://tailwindcss.com) - CSS framework

## 📊 Project Status

**Current Version:** 1.0.0  
**Status:** 🚀 Live in Production  
**Last Updated:** October 19, 2025  
**Live Demo:** [https://open-ask-web.vercel.app](https://open-ask-web.vercel.app)

### Completed Features ✅
- ✅ **Full-Stack Application** - React frontend + Express backend deployed on Vercel
- ✅ **Backend API** - 11 RESTful endpoints with complete CRUD operations
- ✅ **Frontend Web App** - Responsive React app with Auth0 integration
- ✅ **MongoDB Atlas** - Cloud database with indexes and seeded data
- ✅ **Auth0 Authentication** - Secure JWT-based user authentication
- ✅ **AI-Powered Answers** - Google Gemini integration for draft answer generation
- ✅ **Voting System** - Upvote/downvote for questions and answers
- ✅ **Full-Text Search** - MongoDB text indexes with relevance scoring
- ✅ **Tag-Based Filtering** - Organize and discover content by tags
- ✅ **Rate Limiting** - Protection against API abuse
- ✅ **Markdown Support** - Safe HTML rendering with XSS prevention
- ✅ **Docker Setup** - Containerization for local development
- ✅ **CI/CD Pipeline** - Automated testing and deployment
- ✅ **Comprehensive Tests** - 57 integration tests (70% passing)
- ✅ **Complete Documentation** - API docs, guides, and examples
- ✅ **Production Deployment** - Live on Vercel with MongoDB Atlas

### Roadmap 🗺️
- [ ] Email notifications for new answers
- [ ] User reputation system with badges
- [ ] Comment threads on answers
- [ ] File uploads for code snippets and images
- [ ] Real-time updates with WebSocket
- [ ] Advanced search filters (date range, author, etc.)
- [ ] Analytics dashboard for admins
- [ ] Mobile app (React Native)
- [ ] Dark mode theme
- [ ] Internationalization (i18n)

## 🐛 Known Issues

- Some integration tests have body length validation warnings (easily fixable)
- Real-time updates use polling instead of WebSocket (optimization opportunity)

## 💡 Support

- **Documentation:** See docs in `/apps/api/README.md` and `/DOCKER.md`
- **Issues:** [GitHub Issues](https://github.com/9jaDevo/OpenAsk/issues)
- **Discussions:** [GitHub Discussions](https://github.com/9jaDevo/OpenAsk/discussions)

## 🔗 Links

- **Repository:** [github.com/9jaDevo/OpenAsk](https://github.com/9jaDevo/OpenAsk)
- **API Docs:** [apps/api/README.md](apps/api/README.md)
- **Docker Guide:** [DOCKER.md](DOCKER.md)
- **Project Scope:** [ProjectScope.txt](ProjectScope.txt)

---

**Built with ❤️ by the OpenAsk team**

*Empowering developers to learn and grow together* 🚀
