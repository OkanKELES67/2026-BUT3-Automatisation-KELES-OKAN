# 2026-IUT-Automatisation

A deliberately small **task list** application, used as the subject for the CI/CD labs.
The application itself is not the point — it is small enough to read in one sitting, but
real enough to build, test, containerise and deploy.

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  React SPA   │ ───▶ │  Storm.Api  │ ───▶ │   Maria DB   │
│ Vite + MUI   │ /api │  OrmLite     │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
```

| Part | Stack |
| --- | --- |
| `backend/` | C# / .NET 10, Storm.Api (CQRS actions + generated controllers), ServiceStack.OrmLite, xUnit v3 + Testcontainers |
| `frontend/` | React 19, TypeScript, Vite, MUI, TanStack Query, Vitest + Testing Library |
| Database | Maria DB |

There is no authentication: every visitor sees the same list. That is on purpose.

## API

Every endpoint answers with the api envelope:

```json
{ "is_success": true, "data": { "id": "…", "title": "…" } }
```

and, on failure, with `{ "is_success": false, "error_code": "…", "error_message": "…" }`.

| Method | Route | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/api/v1/tasks` | — | `200` list of tasks, newest first |
| `POST` | `/api/v1/tasks` | `{ "title": "…" }` | `200` the created task |
| `PUT` | `/api/tasks/v1/{id}` | `{ "title"?: "…", "isCompleted"?: true }` | `200` the updated task, `404` if unknown |
| `DELETE` | `/api/tasks/v1/{id}` | — | `200`, `404` if unknown |
| `GET` | `/api/v1/health` | — | `200` when the database is reachable |

A task is `{ id, title, isCompleted, createdAt, completedAt }`. Titles are trimmed, must not
be blank and are capped at 400 characters; violations come back as `400` with error code
`TITLE_REQUIRED` or `TITLE_TOO_LONG`. In development, the OpenAPI document is served at
`/openapi/v1.json` and Scalar renders it at `/scalar`.

## Running the parts individually

### Prerequisites

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- Node.js 22+ with **Corepack** enabled (`corepack enable`); Yarn 4 is pinned in
  `frontend/package.json` and installed automatically
- Maria DB

### Backend

```bash
cd backend
ASPNETCORE_ENVIRONMENT=dev dotnet run --project src/TaskList.Api/   # http://localhost:5000
```

The API connect to the database and applies the migrations
before it starts serving, so an empty Maria DB database is enough.

### Frontend

```bash
cd frontend
yarn install
VITE_DEV_API_PROXY=http://localhost:5000 yarn dev                   # http://localhost:5173
```

`yarn dev` proxies `/api` to `http://localhost:5000`, so the browser never has to deal with
CORS. Point it somewhere else with `VITE_DEV_API_PROXY`, or bypass the proxy entirely by
building with `VITE_API_BASE_URL` set (see `frontend/.env.example`).

## Tests and checks

These are the commands a pipeline is expected to run.

| Where | Command | What it does |
| --- | --- | --- |
| `backend/` | `dotnet build` | Compiles the solution |
| `backend/` | `dotnet test` | integration tests against an in memory SQLite database |
| `frontend/` | `yarn install --immutable` | Installs exactly what `yarn.lock` pins |
| `frontend/` | `yarn lint` | ESLint |
| `frontend/` | `yarn typecheck` | TypeScript, no emit |
| `frontend/` | `yarn test` | Vitest component tests |
| `frontend/` | `yarn build` | Production bundle into `dist/` |

Coverage: `dotnet test -- --coverage` and `yarn test:coverage`.

## Configuration

### Backend

| Variable | Default | Purpose |
| --- | --- | --- |
| `Database__type` | `MySql` | OrmLite dialect: `Postgres`, `MySql`, `SQLite`, `SQLiteMemory` |
| `Database__host` | `localhost:3306` | Database host |
| `Database__database` | `taskdb` | Database name |
| `Database__user` | `tasks` | Database user |
| `Database__password` | `Str0ng!Passw0rd` | Database password |
| `ASPNETCORE_HTTP_PORTS` | `8080` in the docker image | Listening port |

### Frontend (build time — Vite inlines these)

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | empty (same origin) | Absolute base URL of the API |
| `VITE_DEV_API_PROXY` | `http://localhost:5000` | Where `yarn dev` proxies `/api` |
