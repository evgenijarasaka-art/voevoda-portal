@echo off
if "%1"=="run-backend" docker compose up -d
if "%1"=="run-frontend" cd apps\portal && npm run dev
if "%1"=="migrate" docker compose exec api python manage.py migrate
if "%1"=="lint-backend" docker compose exec api ruff check apps/api
if "%1"=="lint-frontend" cd apps\portal && npm run lint
if "%1"=="test" echo No tests yet
if "%1"=="help" (
  echo Available commands:
  echo   run-backend    - Run Django backend (via Docker)
  echo   run-frontend   - Run React frontend (dev mode)
  echo   migrate        - Apply Django migrations
  echo   lint-backend   - Run Ruff linter on backend
  echo   lint-frontend  - Run ESLint on frontend
  echo   test           - Run tests (placeholder)
)
