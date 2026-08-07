
# Build Stage
FROM node:22 AS build

ARG VITE_EDITOR_URL
ARG VITE_API_URL
ENV VITE_EDITOR_URL=$VITE_EDITOR_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/constants/package.json ./packages/constants/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY ./services/frontend/package.json ./services/frontend/package.json

RUN pnpm install

COPY packages/constants ./packages/constants
COPY packages/types ./packages/types
COPY ./services/frontend ./services/frontend
COPY packages/eslint-config ./packages/eslint-config
COPY packages/typescript-config ./packages/typescript-config

RUN pnpm turbo build

# Production Stage

FROM nginx:alpine

COPY --from=build /app/services/frontend/dist /usr/share/nginx/html

COPY ./services/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]