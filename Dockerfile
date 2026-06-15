# Stage 1: Build the React Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package.json ./
COPY frontend/package.json ./frontend/
RUN npm install -w frontend --cache .npm-cache
# Copy backend files since frontend imports types from backend/src
COPY backend/package.json ./backend/
COPY backend/src/ ./backend/src/
COPY frontend/ ./frontend/
RUN npm run build -w frontend

# Stage 2: Build the Node Express Backend
FROM node:22-alpine AS backend-builder
WORKDIR /app
COPY package.json ./
COPY backend/package.json ./backend/
RUN npm install -w backend --cache .npm-cache
COPY backend/ ./backend/
RUN npm run build -w backend

# Stage 3: Lightweight Production Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only, bypassing monorepo workspace setup
COPY backend/package.json ./package.json
RUN npm install --omit=dev --cache .npm-cache

# Copy compiled backend source code
COPY --from=backend-builder /app/backend/dist ./dist

# Copy compiled static frontend bundle into backend public assets directory
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 8080) + '/healthz').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/server.js"]
