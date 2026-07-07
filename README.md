# MochiRoute

Full-stack URL shortener: shorten links with or without an account, track clicks, and manage your URLs from a dashboard. Built as a cost-effective portfolio project, designed to deploy API and frontend from one container in production.

## Table of Contents

- [Background and Overview](#background-and-overview)
- [Demo](#demo)
- [Functionality](#functionality)
- [Technology and Technical Challenges](#technology-and-technical-challenges)
- [Future Tasks](#future-tasks)

---

## Background and Overview

MochiRoute is a monorepo URL shortening app with three workspaces:

- **Server** (`server/`): Express 5 REST API, PostgreSQL (Prisma 7), JWT auth, public redirects
- **Client** (`client/`): React 19 SPA with MUI, Redux, and React Router *(in progress)*
- **Shared** (`shared/`): Zod validation schemas and TypeScript types used by both server and client

The backend is production-hardened (rate limiting, graceful shutdown, scoped auth). The frontend has core layout, routing, theming, and navbar scaffolding; login/register pages, API integration, and the URL dashboard are still being built.

### Monorepo architecture

**Server**

- **Routes**: HTTP handlers, auth middleware, rate limiting
- **Service**: business logic (auth, URL creation, redirects)
- **Exposed**: shapes API responses (no password hashes, etc.)

**Client**

- **Pages**: route-level views (Home, login/register and dashboard planned)
- **Layouts**: FullLayout with navbar and outlet for child routes
- **Store**: auth and custom slices (theme, layout dimensions)
- **Theme**: MUI light/dark mode driven by Redux

In production, the server serves the built client from client/dist as a single deploy unit. No separate frontend host is required.

### Local development

**Prerequisites:** Node.js, npm, Docker (for Postgres)

```bash
# From repo root
npm install

# Start Postgres (from server/)
./start-local-db.sh

# Configure env
cp server/.env.example server/.env

# Run migrations
npm run db:migrate -w server

# Terminal 1: API (port 3000)
npm run dev -w server

# Terminal 2: Vite dev server (port 5173)
npm run dev -w client
```

| Variable       | Required | Description                     |
| -------------- | -------- | ------------------------------- |
| `DATABASE_URL` | Yes      | PostgreSQL connection string    |
| `JWT_SECRET`   | Yes      | Secret for signing JWTs         |
| `PORT`         | No       | Server port; default 3000     |
| `BASE_URL`     | Prod     | Public base URL for short links |
| `NODE_ENV`     | No       | development or production   |

```bash
npm run test -w server    # Server Vitest suites
npm run test -w client    # Client Vitest (when tests are added)
npm run build -w client   # Production build → client/dist
npm run lint -w client
npm run db:studio -w server
```

---

## Demo

**Live demo:** [Coming soon](#) *(placeholder)*

---

## Functionality

### Server (API)

#### Health check

| Method | Path      | Auth | Description    |
| ------ | --------- | ---- | -------------- |
| `GET`  | `/health` | No   | Liveness probe |

#### Authentication

| Method | Path            | Auth | Description        |
| ------ | --------------- | ---- | ------------------ |
| `POST` | `/api/register` | No   | Create account     |
| `POST` | `/api/login`    | No   | Login, returns JWT |

- Passwords hashed with bcrypt
- JWTs signed with HS256 (algorithm pinned)

#### URL shortening

| Method   | Path            | Auth     | Description                   |
| -------- | --------------- | -------- | ----------------------------- |
| `POST`   | `/api/url`      | Optional | Create short link             |
| `GET`    | `/api/url`      | Required | List user's links (paginated) |
| `GET`    | `/api/url/:id`  | Required | Get one link (owner only)     |
| `DELETE` | `/api/url/:id`  | Required | Delete link (owner only)      |
| `GET`    | `/r/:shortCode` | No       | Redirect + increment clicks   |

**Create URL behavior**

- **Authenticated**: link tied to userId, appears in dashboard
- **Anonymous**: userId: null; redirect works, not listed in dashboard (by design)
- Short codes are 7 alphanumeric characters
- Validation via shared Zod schemas (createUrlSchema, etc.)

#### Rate limiting

| Endpoint group | Window | Max |
| -------------- | ------ | --- |
| Auth           | 15 min | 10  |
| Create URL     | 1 hour | 30  |
| Redirect       | 1 min  | 100 |

#### Error handling

- JSON 404 for unknown /api/* routes
- Config fail-fast on missing required env vars
- Structured logging via Morgan → custom logger

#### Test coverage

Vitest suites across routes, services, middleware, crypto, and config.

---

### Client (frontend, in progress)

#### Implemented

- **App shell**: BrowserRouter, Redux Provider, MUI ThemeProvider, CssBaseline
- **Routing**: useRoutes with lazy-loaded FullLayout and Home via Loadable + Suspense
- **Auth guard**: redirects unauthenticated users away from protected routes (Navigate to /login)
- **Layout**: sticky navbar with logo, dark/light toggle, login/signup buttons
- **Theming**: light/dark palettes; toggle persisted in Redux (custom slice)
- **Components**: Logo, Navbar, LoginButtons, PageContainer, ParentCard, ShortenForm (WIP), Spinner
- **Shared validation**: Form validation schemas from @mochiroute/shared

#### Planned UI

| Route      | Purpose                                      |
| ---------- | -------------------------------------------- |
| `/`        | Landing + shorten form + copy result         |
| `/login`   | Login form → JWT stored in Redux             |
| `/signup`  | Registration form                            |
| Dashboard  | Table of user's URLs (short, original, clicks, delete) |

**Guest flow**: navbar with Log In / Sign Up; centered shorten form; no account required to shorten.

**Logged-in flow**: email + Logout in navbar; shorten form + URL management table.

---

## Technology and Technical Challenges

### Stack

| Layer        | Server                               | Client                                      |
| ------------ | ------------------------------------ | ------------------------------------------- |
| Runtime      | Node.js, TypeScript                  | Browser, TypeScript                         |
| Framework    | Express 5                            | React 19, Vite 8                            |
| UI           | N/A                                  | MUI 9, Emotion, Tabler Icons                |
| State        | N/A                                  | Redux Toolkit                               |
| Routing      | Express routes                       | React Router 7                              |
| Database     | PostgreSQL, Prisma 7                 | N/A                                         |
| Auth         | JWT, bcrypt                          | Redux auth slice (API wiring in progress)   |
| Validation   | Zod (@mochiroute/shared)             | Zod (@mochiroute/shared)                    |
| Testing      | Vitest                               | Vitest, Testing Library, Cypress (installed)|
| Hardening    | Rate limits, CORS (dev), trust proxy | Route guard, lazy loading                   |
| CI           | Typecheck, test, build, lint         | Build, lint (GitHub Actions on main)        |

### Technical challenges addressed

1. **Monorepo validation**: Shared Zod schemas keep server and client in sync on URL shape, pagination, and auth payloads.

2. **Optional auth on create**: optionalAuthenticate lets guests shorten URLs while authenticated users get ownership and dashboard access.

3. **Production readiness (server)**: Fail-fast config, rate limits, trust proxy in prod, graceful shutdown (SIGTERM / SIGINT) with Prisma disconnect, JWT algorithm pinning, and scoped queries (userId) on protected routes.

4. **Prisma 7 + driver adapter**: Uses PrismaPg adapter with generated client under src/generated/prisma.

5. **Anonymous vs owned URLs**: Nullable userId on UrlRecord supports public shortening without accounts while keeping management auth-gated.

6. **Single deploy unit (cost-effective)**: API + static client from one process in one container. Fewer services to provision and pay for than a split API/frontend deployment.

7. **Client architecture (in progress)**: Lazy-loaded routes, typed Redux store, theme tied to global state, and reusable layout/card primitives to support dashboard and auth flows without prop drilling.

---

## Future Tasks

### Server

- [ ] **Deploy**: Single Docker image (API + built client) on AWS App Runner or similar; one container to minimize hosting cost
- [ ] **expiresAt**: Enforce link expiration (schema exists; logic deferred)
- [ ] **DB-aware /health**: Check Postgres connectivity, not just process liveness
- [ ] **API docs**: OpenAPI/Swagger or expanded Bruno collection
- [ ] **Custom short codes**: Optional user-chosen slugs with uniqueness checks
- [ ] **Link analytics**: Per-link click history beyond aggregate clicks count

### Client

- [ ] **Login / Signup pages**: Wire routes and forms to /api/login and /api/register
- [ ] **API client**: Centralized fetch layer with VITE_API_URL and JWT headers
- [ ] **URL dashboard**: Paginated table for authenticated users (list, delete)
- [ ] **Logout**: Clear Redux auth state and token
- [ ] **Helmet**: Per-page titles and meta tags (react-helmet-async)
- [ ] **Client tests in CI**: Add npm run test -w client to GitHub Actions
- [ ] **E2E**: Cypress flows for shorten, auth, and dashboard

### DevOps

- [ ] **CI/CD**: Extend pipeline with deploy stage

---

## Related

- [Client Vite template notes](./client/README.md)
