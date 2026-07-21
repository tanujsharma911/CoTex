.PHONY: check-docker start-containers setup-dev run-dev-frontend build-frontend preview-frontend run-dev-api run-dev

LOAD_DEV_ENV = set -a; . config/env/.env; set +a;

check-docker:
	@if ! docker --version > /dev/null 2>&1; then \
		echo "❌ Docker is not installed. Please install Docker."; \
		exit 1; \
	fi

start-containers: check-docker
	@if ! docker ps --filter "name=^redis$$" --filter "status=running" --quiet | grep -q .; then \
		if docker ps -a --filter "name=^redis$$" --quiet | grep -q .; then \
			echo "Starting existing Redis container..."; \
			docker start redis --quiet; \
		else \
			echo "Creating Redis container..."; \
			docker run -d --name redis -p 6379:6379 redis; \
		fi; \
	fi

	@if ! docker ps --filter "name=^mongodb$$" --filter "status=running" --quiet | grep -q .; then \
		if docker ps -a --filter "name=^mongodb$$" --quiet | grep -q .; then \
			echo "Starting existing MongoDB container..."; \
			docker start mongodb --quiet; \
		else \
			echo "Creating MongoDB container..."; \
			docker run -d --name mongodb -p 27017:27017 mongo; \
		fi; \
	fi

setup-dev:
	@echo "Setting up the CoTex..."

	@echo "Installing dependencies for client and server..."
	@cd client && pnpm install
	@cd server && pnpm install

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

# start-docker:
# 	@set -a; \
# 	. config/env/.env.docker; \
# 	set +a; \
# 	docker compose up --build -d

# stop-docker:
# 	@docker compose down

# build-base:
# 	@docker build -f Dockerfile.tex -t tex-compiler .
# 	@echo "Built base image for tex-compiler"