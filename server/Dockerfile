# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy all files first so Prisma config and schema are available
COPY . .

# Install dependencies (runs postinstall -> prisma generate)
RUN npm ci

# Build application
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package manifests
COPY package*.json ./

# Install production dependencies only and skip postinstall
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy build artifacts and Prisma files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]