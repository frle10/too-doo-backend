# Too Doo — Backend

The REST API behind [Too Doo](https://toodoo.frle.dev), a simple, shareable to-do list.
Every list lives at its own uuid, so sharing a list is just sharing a link. There are no
accounts and no auth: anyone with the uuid can read and edit the list.

## About this project

Too Doo started in 2020 as an interview take-home while I was still a student. This is the
NestJS + PostgreSQL API that the [frontend](https://github.com/frle10/too-doo-frontend)
talks to.

It was modernized in 2026 alongside the frontend — NestJS 10 to 11, TypeORM 0.3 to 1.0,
Yarn to pnpm, a flat ESLint config, CI, and a real test suite. **The API contract and the
behavior were deliberately left untouched.** The one change with a visible effect is that
request bodies are now validated (an empty to-do is a `400` instead of a silent write),
which is the DTO validation that was already declared but never wired up.

## Stack

|          |                                             |
| -------- | ------------------------------------------- |
| Runtime  | Node 22.12+ (CI on 24)                      |
| Language | TypeScript 5.9                              |
| Framework| NestJS 11 (Express 5 platform)              |
| ORM      | TypeORM 1.0                                  |
| Database | PostgreSQL (via Docker)                      |
| Tests    | Jest — unit (mocked repos) + e2e (real DB)  |

## Getting started

Requires **Node 22.12+** (see `.nvmrc`) and pnpm. The exact pnpm version is pinned in
`package.json` under `packageManager`, so `corepack enable pnpm` is enough to get it.

```bash
docker compose up -d     # PostgreSQL on port 47385
pnpm install
pnpm start:dev           # API on http://localhost:3000
```

`synchronize: true` is on, so TypeORM creates the schema from the entities on boot — no
migration step for local development.

### Scripts

| Command             | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `pnpm start:dev`    | Dev server with watch mode on port 3000            |
| `pnpm start`        | Run once, no watch                                 |
| `pnpm start:prod`   | Run the compiled build (`node dist/main`)          |
| `pnpm build`        | Compile to `dist/`                                 |
| `pnpm test`         | Unit tests (mocked repositories, no database)      |
| `pnpm test:watch`   | Unit tests in watch mode                           |
| `pnpm test:cov`     | Unit tests with a coverage report                  |
| `pnpm test:e2e`     | End-to-end tests — **needs `docker compose up`**   |
| `pnpm typecheck`    | `tsc --noEmit`                                      |
| `pnpm lint`         | ESLint (flat config, type-aware)                   |
| `pnpm format`       | Prettier                                           |

CI (`.github/workflows/ci.yml`) runs `lint`, `typecheck`, `test`, and `build` on every
push and PR. The e2e suite is not part of CI because it needs a database; run it locally.

## Configuration

The database connection is read from the environment, with defaults matching the Docker
Postgres above — so no `.env` is needed for local development. Copy `.env.example` to `.env`
to point at a different database.

| Variable      | Default            |
| ------------- | ------------------ |
| `DB_HOST`     | `localhost`        |
| `DB_PORT`     | `47385`            |
| `DB_USERNAME` | `postgres`         |
| `DB_PASSWORD` | `postgres`         |
| `DB_NAME`     | `too-doo-database` |

## API

Base path is `/todos`. A list is identified by a client-minted uuid; a to-do by its
numeric id.

| Method   | Path                | Purpose                                                |
| -------- | ------------------- | ------------------------------------------------------ |
| `GET`    | `/todos/:uuid`      | Fetch a list. **Empty body** means "no such list".     |
| `PATCH`  | `/todos/:uuid`      | Rename a list, creating it if it does not exist.       |
| `POST`   | `/todos/todo/:uuid` | Add a to-do, creating the list if it does not exist.   |
| `PATCH`  | `/todos/todo/:id`   | Toggle a to-do's `completed` flag.                     |
| `DELETE` | `/todos/todo/:id`   | Delete a to-do.                                        |

A list is persisted lazily — it does not exist until the first `PATCH` (name) or `POST`
(to-do), at which point it is created as `untitled`. To-dos come back newest-first.

CORS is restricted to the frontend origins in `src/main.ts`
(`toodoo.frle.dev`, plus `localhost:5173` for Vite dev and `localhost:3000`). A browser
calling from any other origin is blocked.

## Project structure

```
src/
  main.ts                    Entry point: ValidationPipe + CORS, listens on 3000
  app.module.ts              Wires ConfigModule + TypeOrmModule (async) + TodosModule
  config/typeorm.config.ts   Builds the DB connection options from env
  todos/
    todos.controller.ts      Routes → service
    todos.service.ts         All the logic; injects the two repositories
    todos.module.ts          Registers the entities and the controller/service
    todos.service.spec.ts    Unit tests (mocked repositories)
    todo-list/
      todoList.entity.ts      TodoList (id, uuid, name, todos)
      dto/update-name.dto.ts  { name }
    todo/
      todo.entity.ts          Todo (id, completed, content, todoList)
      dto/add-todo.dto.ts     { content }
test/
  todos.e2e-spec.ts          Full lifecycle against a real Postgres
```

The controller is thin; all behavior lives in `TodosService`, which injects the standard
TypeORM `Repository<TodoList>` and `Repository<Todo>`. There are no custom repository
classes.

## License

MIT — see [LICENSE](LICENSE).
