# Docker Quick Start Guide for Liftdoor

## Overview
Complete Docker setup for the Liftdoor application (NestJS backend + Next.js frontend).

## Files Created
- `backend/Dockerfile` - Multi-stage build for NestJS backend
- `frontend/Dockerfile` - Multi-stage build for Next.js frontend  
- `docker-compose.yml` - Orchestration for both services
- `frontend/global.d.ts` - TypeScript CSS module declarations
- `.dockerignore` - Optimize build context

## Quick Start

### 1. Build and Run
```bash
docker-compose up --build
```

First run will:
- Build backend image (NestJS with SQLite)
- Build frontend image (Next.js static)
- Start both services with health checks
- Backend available at port 4001
- Frontend available at port 4000

### 2. Access Application
- **Frontend**: http://localhost:4000
- **Backend API**: http://localhost:4001/lifts

### 3. View Logs
```bash
docker-compose logs -f              # All services
docker-compose logs -f backend      # Backend only
docker-compose logs -f frontend     # Frontend only
```

### 4. Stop Services
```bash
docker-compose down           # Stop containers
docker-compose down -v        # Also remove volumes (clears database)
```

## Configuration

Create `.env` file in project root:
```env
JWT_SECRET=your-secret-key
ONEMAP_API_KEY=your-api-key
```

Environment variables:
- `JWT_SECRET` - JWT signing secret (default: "changeme")
- `ONEMAP_API_KEY` - OneMap API key (optional)

## Architecture

### Backend Container
- **Image**: Node.js 18 Alpine
- **Build**: Multi-stage (builder + runtime)
- **Database**: SQLite at `/app/data/liftdoor.db`
- **Port**: 4001
- **Health Check**: `/lifts` endpoint every 10s

### Frontend Container
- **Image**: Node.js 18 Alpine
- **Build**: Multi-stage (builder + runtime)
- **Port**: 4000
- **Startup**: Waits for backend health check
- **Health Check**: HTTP GET to `/` every 10s

### Network & Volumes
- Custom bridge network: `liftdoor-network`
- Persistent volume: `backend-data` for SQLite database

## Data Persistence

SQLite database survives container restarts. To clear:
```bash
docker-compose down -v
```

## Production Deployment

1. Change `JWT_SECRET` to strong random value
2. Set `NODE_ENV=production` (already configured)
3. Add resource limits to docker-compose.yml
4. Use reverse proxy for HTTPS/SSL
5. Set up centralized logging

## Building Images Separately

```bash
docker build -t liftdoor-backend:latest -f backend/Dockerfile .
docker build -t liftdoor-frontend:latest -f frontend/Dockerfile .
```

## Troubleshooting

- **Build fails**: Check Docker logs, verify ports 4000/4001 are free
- **Data not persisting**: Verify volume: `docker volume ls`
- **Health checks failing**: `docker-compose logs backend`
