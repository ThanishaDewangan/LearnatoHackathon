# Learnato Discussion Forum

Fast, minimal discussion forum microservice.

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + Prisma + Socket.io
- DB: PostgreSQL
- Containerized with Docker Compose

## Quick Start (Docker)
1. Ensure Docker is running.
2. From repo root, build and start:
   - docker compose up -d --build
3. Open services:
   - Backend health: http://localhost:4000/health
   - Frontend UI: http://localhost:5173

Notes
- The backend applies the schema automatically with `prisma db push` on container start.
- Default DB credentials are for local Compose only.

## Environment
Backend (overridden by compose):
- DATABASE_URL: `postgresql://postgres:postgres@db:5432/learnato_forum?schema=public`
- PORT: `4000`
- CORS_ORIGIN: `http://localhost:5173`

Frontend:
- VITE_API_BASE: `http://localhost:4000`

## API Endpoints
- POST `/posts` { title, content }
- GET `/posts?sort=votes|date&q=keyword`
- GET `/posts/:id`
- POST `/posts/:id/reply` { content, author? }
- POST `/posts/:id/upvote`
- PATCH `/posts/:id/answered` { answered: boolean }

## Realtime Events
- `post:new` → broadcast on create
- `post:upvote` → broadcast on upvote
- `post:answered` → broadcast on mark/unmark answered
- `reply:new` → broadcast on new reply

## Local Development (optional, no Docker)
I can add npm scripts/configs for non-Docker dev on request. Typical flow:
- Backend: `npm i` in `backend/`, run `npm run dev` (needs local Postgres & `DATABASE_URL`)
- Frontend: `npm i` in `frontend/`, run `npm run dev`

## Deployment
- Works on Render, Railway, Fly.io, or Cloud Run.
- Build frontend to static assets and serve via CDN or Nginx.
- Backend requires `DATABASE_URL`, `PORT`, and CORS configured.
