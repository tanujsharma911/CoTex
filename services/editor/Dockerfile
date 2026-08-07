FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY package*.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/constants/package.json ./packages/constants/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/redis/package.json ./packages/redis/package.json
COPY packages/storage/package.json ./packages/storage/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY ./services/editor/package.json ./services/editor/package.json

RUN pnpm install

COPY packages/auth ./packages/auth
COPY packages/constants ./packages/constants
COPY packages/types ./packages/types
COPY packages/eslint-config ./packages/eslint-config
COPY packages/redis ./packages/redis
COPY packages/storage ./packages/storage
COPY packages/typescript-config ./packages/typescript-config
COPY ./services/editor ./services/editor

EXPOSE 3001

CMD ["npm", "run", "start"]