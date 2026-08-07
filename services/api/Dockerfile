FROM tex-compiler:latest

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm

WORKDIR /app

COPY package*.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/constants/package.json ./packages/constants/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/redis/package.json ./packages/redis/package.json
COPY packages/storage/package.json ./packages/storage/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY ./services/api/package.json ./services/api/package.json

RUN pnpm install

COPY packages/auth ./packages/auth
COPY packages/constants ./packages/constants
COPY packages/types ./packages/types
COPY packages/eslint-config ./packages/eslint-config
COPY packages/redis ./packages/redis
COPY packages/storage ./packages/storage
COPY packages/typescript-config ./packages/typescript-config
COPY ./services/api ./services/api

EXPOSE 3000

CMD ["npm", "start"]