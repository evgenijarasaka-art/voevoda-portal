# Patriot Platform

Modular social, educational and commerce platform built with React, TypeScript, Vite, Django, DRF, Channels, Celery, PostgreSQL and Redis.

---

## Overview

Patriot Platform is a modular portal that combines:

- User identity & roles
- Profile system with ranks and achievements
- Journal (articles, blog, news)
- Military training system (courses, series, exams, access rules)
- Communities
- Real-time chat
- Marketplace & inventory
- Notifications system
- CMS-driven pages and menus
- Search across platform
- Referral program

The system is built as a modular monolith with clear domain boundaries.

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Tailwind CSS

### Backend
- Django
- Django REST Framework
- Django Channels
- Celery
- PostgreSQL
- Redis
- S3 / R2 compatible storage

### Infrastructure
- Docker
- Nginx
- GitHub Actions
- Vercel
- Terraform

### Quality & Observability
- ESLint
- Prettier
- Ruff / Flake8
- Pytest
- Playwright
- Storybook
- CodeQL
- Dependabot
- Sentry
- PostHog

---

## Repository Structure

```text
apps/web      # frontend
apps/api      # backend
packages/ui   # shared ui-kit
packages/sdk  # typed api client
infra         # docker/nginx/terraform/scripts
docs          # architecture, ADR, onboarding
```

---

## Getting Started

### Requirements

- Node.js LTS
- pnpm or npm
- Python 3.12+
- Docker
- Docker Compose

### Run locally (recommended via Docker)

```bash
make setup
make up
```

### Run frontend manually

```bash
cd apps/web
pnpm install
pnpm dev
```

### Run backend manually

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

## Branch Strategy

- `main` — production
- `develop` — integration
- `feature/*` — new features
- `fix/*` — bug fixes
- `refactor/*` — refactoring
- `chore/*` — maintenance

Rule: **One feature = One branch = One PR**

---

## Development Rules

- No direct pushes to protected branches
- All PRs must pass CI
- Access validation must be handled on backend
- No secrets inside repository
- Business logic lives in backend domain modules

---

## License

Proprietary
