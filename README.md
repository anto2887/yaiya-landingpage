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

## Deploy (Railway)

One web service and one Postgres database in the same Railway project. Every push to `main` deploys.

| Setting | Value |
|---|---|
| Build | `npm ci && npm run build` (Railway detects this) |
| Start | `npm run start`: applies `db/schema.sql`, then starts Next.js on Railway's `PORT` |
| Healthcheck path | `/api/health` |

Variables on the web service (see `.env.example` for each one):

| Variable | Value |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference to the Postgres service) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.takeayaiya.com` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key (`phc_...`) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta pixel / dataset ID |
| `META_CAPI_TOKEN` | Meta Conversions API access token (secret) |
| `IP_HASH_SALT` | Long random string (letters and digits) |
| `LANDING_VARIANT` | `v1` (optional; the default) |

`NEXT_PUBLIC_*` values are built into the page: change one, then redeploy. Never commit real values.

**Domain:** `www.takeayaiya.com` is a Railway custom domain (CNAME, Cloudflare "DNS only"). The bare `takeayaiya.com` redirects to `www` with a Cloudflare redirect rule that keeps the path and query string.

**Rollback:** in Railway, open Deployments and redeploy the last good one, then fix forward.

## Export and read signups

In Railway, open the Postgres service, then **Data** (or connect with `psql` using `DATABASE_PUBLIC_URL`). Ready queries are in `db/queries.sql`: totals, per day, by traffic source, by ad (`utm_content`), flavor picks, thank-you answers, and a CSV export. Every query leaves out test signups (`landing_variant = 'qa'`).

Before and after each ad phase, export the table to CSV and keep the files.

To clear test signups before launch:

```sql
delete from signups where landing_variant = 'qa';
```

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
