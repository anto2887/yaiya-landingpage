# YAIYA landing page

A single-page waitlist site for YAIYA, a soft protein jelly snack in development. It collects waitlist emails from Meta ad traffic, saves them to Postgres, and reports signups to PostHog and Meta.

Stack: Next.js (App Router), TypeScript, Tailwind CSS, Postgres (`pg`), deployed on Railway.

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in values; tracking keys can stay empty
npm run dev                  # http://localhost:3000
```

Without `DATABASE_URL` the page still runs; signups need a database (milestone M4).

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Applies `db/schema.sql`, then starts the server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run images` | Prepares images from `assets-src/` into `public/images/` |

## Where things are

- All copy and product data: `content/site.ts`. Components hold no copy.
- Database schema: `db/schema.sql`. Results queries: `db/queries.sql`.
- Environment variables: `.env.example`.
- The build guide and agent rules (`guide/`, `CLAUDE.md`) are kept locally and not committed.
