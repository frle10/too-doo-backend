# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

`too-doo-backend` — a NestJS 11 + TypeORM + PostgreSQL REST API for shareable to-do lists.
It is consumed by a separate React frontend (`too-doo-frontend`). There is no auth and no
persistence beyond the database: a list is identified purely by a client-minted uuid, and
anyone with the uuid can read or edit it.

## Commands

Package manager is **pnpm**, pinned by the `packageManager` field in `package.json` and
installed through corepack. `pnpm-lock.yaml` is committed; never introduce `yarn.lock` or
`package-lock.json`, and never run `npm install` or `yarn` in this repo. Node >= 22.12
(`.nvmrc` pins the version CI uses).

| Task                    | Command            |
| ----------------------- | ------------------ |
| Dev server (port 3000)  | `pnpm start:dev`   |
| Type check only         | `pnpm typecheck`   |
| Lint                    | `pnpm lint`        |
| Unit tests (no DB)      | `pnpm test`        |
| Unit tests (watch)      | `pnpm test:watch`  |
| e2e tests (needs DB)    | `pnpm test:e2e`    |
| Production build        | `pnpm build`       |
| Format                  | `pnpm format`      |

Before declaring work done, run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` —
that is what CI (`.github/workflows/ci.yml`) runs on every push and PR. The e2e suite is
**not** in CI because it needs Postgres; run it locally after `docker compose up -d`.

## Architecture

```
main.ts            ValidationPipe (whitelist + transform) + CORS, listens on 3000
app.module.ts      ConfigModule (global) + TypeOrmModule.forRootAsync + TodosModule
config/            buildTypeOrmConfig(ConfigService) → connection options from env
todos/
  todos.controller.ts   thin: params in, delegates to the service
  todos.service.ts      ALL logic lives here
  todos.module.ts       forFeature([TodoList, Todo])
  todo-list/, todo/     entities + DTOs
```

Request flow is **controller → service → injected repository**. The controller only parses
and delegates; put new logic in `TodosService`, not in the controller.

## Conventions that are easy to get wrong

**No custom repository classes.** The service injects the standard TypeORM
`Repository<TodoList>` and `Repository<Todo>` via `@InjectRepository`. The old
`@EntityRepository` pattern was removed in the modernization — do not bring it back, and do
not register repository classes in `forFeature`; register **entities**.

**Empty response body means "not found".** `getTodoList` returns `null` for a missing list,
which Nest serializes to a `200` with an empty body. The frontend depends on this: it reads
both an empty body and a `404` as "no such list". Do not turn the empty case into a `404` or
throw — it would break the contract.

**Lists are created lazily.** A list does not exist until the first name (`PATCH /todos/:uuid`)
or first to-do (`POST /todos/todo/:uuid`); `findOrCreateTodoList` creates it as `untitled`.
Preserve that — the frontend mints the uuid client-side and relies on the first write to
persist the list.

**To-dos come back newest-first.** `sortTodosDescending` sorts by `id` descending in memory.
Keep any list response going through it.

**The added-todo response omits its list.** `addTodo` does `delete todo.todoList` before
returning so the JSON is just the to-do, not the whole list nested inside it. The relation
field is optional (`todoList?`) precisely so this `delete` typechecks under `strictNullChecks`.

**DTO validation is real now.** `ValidationPipe({ whitelist: true, transform: true })` is
global in `main.ts` (and re-applied in the e2e setup). `AddTodoDto` / `UpdateNameDto` use
`class-validator`; an empty `content`/`name` is a `400`. Route params use `ParseUUIDPipe` /
`ParseIntPipe`, so a malformed uuid or id is also a `400`.

**Lint is type-aware** (`tseslint.configs.recommendedTypeChecked`, flat config in
`eslint.config.mjs`). Floating promises are errors — `void bootstrap()` in `main.ts` is
deliberate. `@typescript-eslint/no-explicit-any` is off because decorator/DI boundaries use
`any` routinely.

**Single quotes, trailing commas** (`.prettierrc`). Run `pnpm format` rather than matching
by hand.

## Database

Connection options come from env (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`,
`DB_NAME`) via `buildTypeOrmConfig`, defaulting to the Docker Postgres in `docker-compose.yml`
(port **47385**, not the default 5432). `synchronize: true` is on — the schema is derived
from the entities on boot and there are no migrations. Do not add migrations without a
deliberate decision; adding one means turning `synchronize` off.

## Testing

Jest. Unit tests sit next to the code (`todos.service.spec.ts`) and mock the repositories
with `getRepositoryToken`, so `pnpm test` needs no database — this is what CI runs. The e2e
test (`test/todos.e2e-spec.ts`, `jest-e2e.json` config) boots the whole app against real
Postgres and exercises the full lifecycle; it needs `docker compose up` first.

## Git

Primary branch is `main`. Branch off it for changes; do not commit directly to `main`.
