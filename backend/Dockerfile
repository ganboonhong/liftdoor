# Build stage
FROM node:20-alpine AS builder

WORKDIR /app/backend

# Copy backend files
COPY backend/package.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Build application
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for graceful shutdown
RUN apk add --no-cache dumb-init

# Copy package.json
COPY backend/package.json ./

# Install production dependencies only
RUN npm install --omit=dev --legacy-peer-deps

# Copy built application
COPY --from=builder /app/backend/dist ./dist

# Create data directory for SQLite
RUN mkdir -p ./data

EXPOSE 4001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
