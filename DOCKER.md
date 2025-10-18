# Docker Development Environment

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

## Quick Start

1. **Create environment file:**

```bash
cp .env.example .env
```

Edit `.env` with your Auth0 credentials:

```env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://api.openask.com
GEMINI_API_KEY=your-gemini-api-key  # Optional
AUTH0_CLIENT_ID=your-client-id      # For web app
```

2. **Start all services:**

```bash
docker-compose up -d
```

This starts:
- MongoDB on `localhost:27017`
- API on `localhost:3000`

3. **View logs:**

```bash
docker-compose logs -f api
```

4. **Seed database:**

```bash
docker-compose exec api pnpm seed
```

5. **Stop services:**

```bash
docker-compose down
```

## Services

### MongoDB

- **Port:** 27017
- **User:** admin
- **Password:** password
- **Database:** openask

**Connect with mongosh:**
```bash
docker-compose exec mongodb mongosh -u admin -p password --authenticationDatabase admin openask
```

### API

- **Port:** 3000
- **Health check:** http://localhost:3000/health
- **API docs:** See `apps/api/README.md`

**Access API shell:**
```bash
docker-compose exec api sh
```

## Development Workflow

### Rebuilding After Changes

```bash
# Rebuild API container
docker-compose up -d --build api

# Or rebuild everything
docker-compose up -d --build
```

### Running Commands Inside Containers

```bash
# Run tests
docker-compose exec api pnpm test

# Type check
docker-compose exec api pnpm typecheck

# Lint
docker-compose exec api pnpm lint
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f mongodb
```

## Data Persistence

MongoDB data is persisted in Docker volumes:
- `mongodb_data` - Database files
- `mongodb_config` - MongoDB configuration

**To reset database:**

```bash
docker-compose down -v  # Removes volumes
docker-compose up -d
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 27017 are already in use:

1. Edit `docker-compose.yml`
2. Change port mappings:
   ```yaml
   ports:
     - '3001:3000'  # API on 3001
   ```

### API Won't Connect to MongoDB

Check MongoDB health:
```bash
docker-compose ps
docker-compose logs mongodb
```

Wait for MongoDB to be healthy:
```bash
docker-compose up -d mongodb
# Wait 10 seconds
docker-compose up -d api
```

### Container Crashes on Startup

View error logs:
```bash
docker-compose logs api
```

Check environment variables:
```bash
docker-compose exec api env | grep AUTH0
```

## Production Deployment

For production, use separate `docker-compose.prod.yml`:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Production checklist:**
- [ ] Set `NODE_ENV=production`
- [ ] Use secrets management for sensitive env vars
- [ ] Configure proper MongoDB authentication
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx/Caddy)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Enable MongoDB replica set

## Useful Commands

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v

# View running containers
docker-compose ps

# View resource usage
docker stats

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password

# Backup MongoDB
docker-compose exec mongodb mongodump -u admin -p password --authenticationDatabase admin -o /backup

# Restore MongoDB
docker-compose exec mongodb mongorestore -u admin -p password --authenticationDatabase admin /backup
```
