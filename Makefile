.PHONY: check-docker start-containers setup-dev run-dev-frontend build-frontend preview-frontend run-dev-api run-dev run-redis

LOAD_DEV_ENV = set -a; . config/env/.env; set +a;
LOAD_DOCKER_ENV = set -a; . config/env/.env.docker; set +a;

check-docker:
	@if ! docker ps > /dev/null 2>&1; then \
		echo "❌ Docker is not running. Please start Docker."; \
		exit 1; \
	fi

start-containers: run-redis run-mongodb run-minio
	@echo "All containers started"

stop-containers: stop-redis stop-mongodb stop-minio
	@echo "All containers stopped"

setup-dev:
	@echo "Setting up the CoTex..."

	@echo "Creating the MinIO data directory..."
	@mkdir -p $(HOME)/minio/data

	@echo "Installing dependencies for client and server..."
	@pnpm install

	@echo "CoTex setup complete!"

run-dev-frontend:
	@$(LOAD_DEV_ENV) \
	pnpm turbo dev --filter=cotex-frontend

build-frontend:
	@$(LOAD_DEV_ENV) \
	pnpm turbo build --filter=cotex-frontend

preview-frontend:
	@$(LOAD_DEV_ENV) \
	cd services/frontend && pnpm preview

run-dev-api: start-containers
	@$(LOAD_DEV_ENV) \
	pnpm turbo dev --filter=cotex-api

run-dev-editor: start-containers
	@$(LOAD_DEV_ENV) \
	pnpm turbo dev --filter=cotex-editor

run-dev: start-containers
	@$(LOAD_DEV_ENV) \
	pnpm turbo dev

run-redis: check-docker
	@$(LOAD_DEV_ENV) \
	if ! docker ps --filter "name=^cotex-redis$$" --filter "status=running" --quiet | grep -q .; then \
		if docker ps -a --filter "name=^cotex-redis$$" --quiet | grep -q .; then \
			echo "Starting existing Redis container..."; \
			docker start cotex-redis; \
		else \
			echo "Creating Redis container..."; \
			docker run -d --name cotex-redis -p 6379:6379 redis:7-alpine; \
		fi; \
	fi; \
	echo "Redis is running on port $$REDIS_PORT"

run-mongodb: check-docker
	@$(LOAD_DEV_ENV) \
	if ! docker ps --filter "name=^cotex-mongodb$$" --filter "status=running" --quiet | grep -q .; then \
		if docker ps -a --filter "name=^cotex-mongodb$$" --quiet | grep -q .; then \
			echo "Starting existing MongoDB container..."; \
			docker start cotex-mongodb; \
		else \
			echo "Creating MongoDB container..."; \
			docker run -d --name cotex-mongodb -p 27017:27017 \
			-v mongodb_data:/data/db \
			mongo:6.0; \
		fi; \
	fi; \
	echo "MongoDB is running on port $$MONGODB_PORT"

run-minio: check-docker
	@$(LOAD_DEV_ENV) \
	if ! docker ps --filter "name=^cotex-minio$$" --filter "status=running" --quiet | grep -q .; then \
		if docker ps -a --filter "name=^cotex-minio$$" --quiet | grep -q .; then \
			echo "Starting existing MinIO container..."; \
			docker start cotex-minio; \
		else \
			echo "Creating MinIO container..."; \
			docker run -d \
				--name cotex-minio \
				-p $$MINIO_PORT:9000 \
				-p $$MINIO_CONSOLE_PORT:9001 \
				-v $(HOME)/minio/data:/data \
				-v $(HOME)/minio/minio.license:/minio.license \
				-e "MINIO_ROOT_USER=$$MINIO_ROOT_USER" \
				-e "MINIO_ROOT_PASSWORD=$$MINIO_ROOT_PASSWORD" \
				quay.io/minio/aistor/minio server /data --console-address ":$$MINIO_CONSOLE_PORT" \
				--license /minio.license; \
		fi; \
	fi; \
	echo "MinIO is running on port $$MINIO_PORT"; \
	echo "MinIO Console is running on port $$MINIO_CONSOLE_PORT"

stop-redis:
	@docker stop cotex-redis &> /dev/null
	@echo "Redis is stopped"

stop-mongodb:
	@docker stop cotex-mongodb &> /dev/null
	@echo "MongoDB is stopped"

stop-minio:
	@docker stop cotex-minio &> /dev/null
	@echo "MinIO is stopped"

run-docker: check-docker
	@$(LOAD_DOCKER_ENV) \
	docker compose up --build

stop-docker: check-docker
	@$(LOAD_DOCKER_ENV) \
	docker compose down

build-base:
	@docker build -t tex-compiler -f ./config/dockerfiles/Dockerfile.tex .
