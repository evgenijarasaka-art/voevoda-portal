.PHONY: help run-backend run-frontend migrate lint-backend lint-frontend test

help:
@echo "Available commands:"
@echo "  make run-backend    - Run Django backend (via Docker)"
@echo "  make run-frontend   - Run React frontend (dev mode)"
@echo "  make migrate        - Apply Django migrations"
@echo "  make lint-backend   - Run Ruff linter on backend"
@echo "  make lint-frontend  - Run ESLint on frontend"
@echo "  make test           - Run tests (placeholder)"

run-backend:
docker compose up -d

run-frontend:
cd apps/portal && npm run dev

migrate:
docker compose exec api python manage.py migrate

lint-backend:
ruff check apps/api

lint-frontend:
cd apps/portal && npm run lint

test:
@echo "No tests yet"
