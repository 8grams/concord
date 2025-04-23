# Base image
FROM node:23.11.0-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates libc6 build-essential python3 && rm -rf /var/lib/apt/lists/*
RUN update-ca-certificates
RUN npm install --global --no-update-notifier --no-fund pnpm

# Builder with native module support
FROM base AS builder

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .
RUN pnpm build

# Production runner (copy compiled better-sqlite3)
FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN cd node_modules/better-sqlite3 && pnpm run build-release

USER node
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
