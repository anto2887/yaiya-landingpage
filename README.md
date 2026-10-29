# YAIYA landing page

A single-page waitlist site for YAIYA, a soft protein jelly snack in development. It collects waitlist emails from Meta ad traffic, saves them to Postgres, and reports signups to PostHog and Meta.

Stack: Next.js (App Router), TypeScript, Tailwind CSS, Postgres (`pg`), deployed on Railway.

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in values; tracking keys can stay empty
npm run dev                  # http://localhost:3000
```

Without `DATABASE_URL` the page still runs, but the waitlist form returns an error. For local signups, start Postgres in Docker and point `.env.local` at it:

```bash
docker run --name yaiya-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=yaiya -p 5432:5432 -d postgres:17
# .env.local: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/yaiya
```

`npm run start` creates the table; with `npm run dev`, run `node --env-file=.env.local scripts/migrate.mjs` once first.

Visit any page with `?qa=1` before testing: your signups are then saved with `landing_variant = 'qa'` and left out of every query in `db/queries.sql`. `?qa=0` turns it off.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Applies `db/schema.sql`, then starts the server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Signup API and traffic cohort tests (vitest, no database needed) |
| `npm run images` | Prepares images from `assets-src/` into `public/images/` |

## Logs and monitoring

Every API request writes one JSON line to Railway's Deploy Logs: route, status, time taken, a request id and, for anything turned away, a `reason`. Email addresses, typed answers and IP addresses are never logged.

| You see | Means |
|---|---|
| `outcome: new` / `duplicate` | A signup saved, or a repeat email (still shown the thank-you page) |
| `reason: invalid_email`, `bad_body`, `body_too_large` | The request was rejected as invalid (400) |
| `reason: rate_limited` | Six or more tries in 10 minutes from one visitor (429) |
| `outcome: honeypot` | A bot filled the hidden field; nothing saved |
| `reason: no_session` | Thank-you answers sent without the signup cookie (401) |
| `reason: db_error`, `db_unreachable` | The database failed; `error` gives the cause |

In Railway's log search, filter with `@level:error`, `@route:signup`, `@reason:rate_limited` or `@req_id:<id>`. Each response carries an `x-request-id` header that matches its log line.

`GET /api/health` returns 200 when the site and database both answer, 503 when the database does not (only failures are logged). Point an uptime monitor at it, and set it as the service's Healthcheck Path in Railway so a broken deploy never replaces a working one.

## Where things are

- All copy and product data: `content/site.ts`. Components hold no copy.
- Database schema: `db/schema.sql`. Results queries: `db/queries.sql`.
- Environment variables: `.env.example`.
- The build guide and agent rules (`guide/`, `CLAUDE.md`) are kept locally and not committed.
