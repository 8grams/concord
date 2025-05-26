# Base image
FROM node:23.11.0-slim AS base
WORKDIR /app
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    gnupg \
    wget \
    software-properties-common \
    ca-certificates \
    libc6 \
    build-essential \
    python3 \
    apt-transport-https \
    curl \
    openssh-client

RUN wget -O- https://apt.releases.hashicorp.com/gpg | \
    gpg --dearmor | \
    tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null

RUN echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
    https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
    tee /etc/apt/sources.list.d/hashicorp.list

RUN curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.33/deb/Release.key | \
    gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg && \
    chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg

RUN echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.33/deb/ /' | \
    tee /etc/apt/sources.list.d/kubernetes.list

RUN echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.33/deb/ /' | \
    tee /etc/apt/sources.list.d/kubernetes.list && \
    chmod 644 /etc/apt/sources.list.d/kubernetes.list

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    terraform kubectl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -Lo /usr/local/bin/tk https://github.com/grafana/tanka/releases/latest/download/tk-linux-amd64 && \
    chmod a+x /usr/local/bin/tk

RUN curl -Lo /usr/local/bin/jb https://github.com/jsonnet-bundler/jsonnet-bundler/releases/latest/download/jb-linux-amd64 && \
    chmod a+x /usr/local/bin/jb

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

# copy email templates
RUN mkdir -p /app/src/pages/emails
COPY --from=builder /app/src/pages/emails /app/src/pages/emails

RUN cd node_modules/better-sqlite3 && pnpm run build-release && pnpm prune --prod

USER node
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
