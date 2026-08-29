# Build stage
FROM node:20-alpine AS builder

WORKDIR /app/frontend

# Copy all frontend files (including configs and styles)
COPY frontend/package.json ./
COPY frontend/tsconfig.json ./
COPY frontend/next.config.js ./
COPY frontend/next-env.d.ts ./
COPY frontend/global.d.ts ./
COPY frontend/pages ./pages
COPY frontend/lib ./lib
COPY frontend/styles ./styles

# Install all dependencies (including dev)
RUN npm install --legacy-peer-deps

# Build application
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for graceful shutdown
RUN apk add --no-cache dumb-init

# Copy package.json
COPY frontend/package.json ./

# Install production dependencies only
RUN npm install --omit=dev --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/pages ./pages
COPY --from=builder /app/frontend/styles ./styles
COPY --from=builder /app/frontend/next.config.js ./next.config.js

EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
