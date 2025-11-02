## Multi-stage Dockerfile for building and running the NestJS mock-auth-api
## Use this Dockerfile on Render (or other container platforms).

# --- Builder stage ---------------------------------------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package manifests first for better caching
COPY package.json package-lock.json* ./

# Install all dependencies (including dev) to build the TypeScript sources
RUN npm install

# Copy the rest of the source and build
COPY . .
RUN npm run build


# --- Runner stage ----------------------------------------------------------
FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy package manifest and install only production dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# If you serve static files or other assets copy them as needed
# COPY --from=builder /app/public ./public

EXPOSE 3000

# Use NODE_ENV-aware start; Render will set PORT env if needed
CMD ["node", "dist/main.js"]
