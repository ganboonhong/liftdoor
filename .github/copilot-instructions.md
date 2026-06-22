# Copilot instructions for liftdoor

Overview
- Monorepo-like layout with two independent apps: frontend/ (Next.js) and backend/ (NestJS + TypeORM + MySQL).
- Frontend (port 3000) is a Next.js SPA that calls backend APIs on port 3001.

Build, test, and lint commands
- Backend (backend/):
  - Install: cd backend && npm install
  - Dev (watch): npm run start:dev (uses Nest CLI)
  - Build: npm run build
  - Run built app: npm start
  - Tests: no test scripts or framework configured in package.json
  - Linting: no linter configured in repository

- Frontend (frontend/):
  - Install: cd frontend && npm install
  - Dev server: npm run dev (Next.js, port 3000)
  - Build: npm run build
  - Start built app: npm run start
  - Tests/Lint: none configured

Note: There are currently no test or lint commands in the repo. If tests are added, follow the package.json scripts pattern and include how to run single tests (e.g., `npm test -- <file or -t "test name"`) in this file.

Environment and running locally
- Backend expects environment variables (backend/.env.example): DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, and optional ONEMAP_API_KEY.
- Default ports: frontend 3000, backend 3001. Start backend before using frontend pages that call APIs.

High-level architecture
- Frontend: Next.js single-page UI (frontend/pages/*). Collects rows of lift data, attempts address lookup, and requests CSV generation.
- Backend: NestJS app (backend/src). Uses TypeORM (mysql2) with a Lift entity and standard CRUD controllers at /lifts.
  - Important endpoints:
    - POST /lifts        -> create a lift
    - GET  /lifts        -> list all lifts
    - GET  /lifts/:id    -> get a lift
    - PUT  /lifts/:id    -> update
    - DELETE /lifts/:id  -> remove
    - CSV generation: implemented at /lifts/csv (controller decorated as GET('csv') but frontend posts to /lifts/csv) — see "Gotchas" below.
    - Lookup: GET /lifts/lookup?block=<blk> -> uses OneMap Search API to return ADDRESS and POSTAL
- Data model: Lift entity fields: id, block, street?, postal?, level?, notes?
- CSV: Server generates CSV using csv-stringify; frontend falls back to client-side CSV if server generation fails.

Key conventions and repo-specific notes
- Directory layout: top-level folders `backend/` and `frontend/`. Treat them as separate apps; commands run inside each folder.
- Env example: backend/.env.example exists; copy to .env and set DB creds before starting backend.
- TypeORM is configured with `synchronize: true` in development (backend/src/config/typeorm.config.ts); this modifies schema automatically — be cautious using it in production.
- API host/ports: frontend code expects backend on http://localhost:3001. Keep that mapping in mind for Copilot suggestions and local debugging.
- Route mismatch (important): controller defines the CSV endpoint with @Get('csv') and reads request body, but the frontend sends a POST to /lifts/csv. This mismatch will cause 404s. When generating fixes or tests, check whether the intended API method is GET or POST and align both sides.
- Lookup behavior: lookup uses OneMap Search API; results parsing returns the first match's ADDRESS and POSTAL. Caller code should handle null/empty responses.

CI / AI assistant configs
- No GitHub Actions workflows detected in repository root (.github/workflows not present).
- No AI assistant config files found (CLAUDE.md, .cursorrules, AGENTS.md, .windsurfrules, CONVENTIONS.md variants). If adding an assistant config, include these instructions or link back to this file.

When prompting Copilot in this repo
- Mention which subproject you mean (backend vs frontend) and the working directory (cd backend/ or cd frontend/) in the prompt.
- For backend changes, mention NestJS + TypeORM + MySQL, and include note about synchronize: true if schema changes are relevant.
- For API changes, reference the existing endpoints and the CSV/lookup behaviors to avoid introducing mismatches.

Gotchas and quick checks
- Check CSV endpoint method (GET vs POST) before suggesting client or server changes.
- Verify .env values for DB connection; missing DB config prevents backend startup.
- OneMap API usage requires a network call — local tests should mock axios responses.

Contact / further updates
- This file was generated from README.md, spec.md and the code under backend/ and frontend/. If you want additional sections (tests, CI, or doc links), say which area to expand.

Monorepo (turborepo) and auth notes
- Monorepo: a root package.json and turbo.json were added. Install at repository root (npm install) to pull turbo as a devDependency and then run npm run dev to start both apps in parallel. The root package.json uses Yarn/PNPM/ npm workspaces pattern with "frontend" and "backend" as workspaces.
- Auth (implemented): a minimal JWT-based auth feature was added to backend:
  - Endpoints: POST /auth/register and POST /auth/login
  - User model: backend/src/users/user.entity.ts (id, username, password, role?)
  - Password hashing: bcryptjs
  - Token: jsonwebtoken, signed with process.env.JWT_SECRET (default: 'changeme') and returned as { token } on login
  - Frontend pages: frontend/pages/register.tsx and frontend/pages/login.tsx (store token in localStorage and set Authorization header)

Developer tips for Copilot
- When suggesting backend auth changes, reference backend/src/auth and backend/src/users files and the env var JWT_SECRET.
- When suggesting workspace-level changes (scripts, caching), reference turbo.json and package.json at repo root.
