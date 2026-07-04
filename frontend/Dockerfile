# Build stage
FROM node:18-alpine AS builder

WORKDIR /app/frontend

# Copy all frontend files (including configs and styles)
COPY frontend/package.json ./
COPY frontend/tsconfig.json ./
COPY frontend/next.config.js ./
COPY frontend/next-env.d.ts ./
COPY frontend/global.d.ts ./
COPY frontend/pages ./pages
COPY frontend/styles ./styles

# Install all dependencies (including dev)
RUN npm install

# Build application
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for graceful shutdown
RUN apk add --no-cache dumb-init

# Copy package.json
COPY frontend/package.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built application from builder
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/pages ./pages
COPY --from=builder /app/frontend/styles ./styles
COPY --from=builder /app/frontend/next.config.js ./next.config.js

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
