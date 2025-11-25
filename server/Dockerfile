FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source
COPY . .

# Build TypeScript
RUN npm run build || echo "No build step configured; using TS at runtime"

FROM node:20-alpine
WORKDIR /app

# Install only prod deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built output (if exists) and necessary folders
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY .env.example ./.env.example

# Create uploads directory structure (preserve across deployments)
# This ensures the folder exists even if empty, and won't be removed
RUN mkdir -p /app/uploads/claims && \
    touch /app/uploads/.gitkeep /app/uploads/claims/.gitkeep

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "run", "start"]


