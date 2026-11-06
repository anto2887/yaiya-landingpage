-- YAIYA waitlist schema.
-- Spec: guide/docs/10-signup-backend.md
-- Safe to run repeatedly. scripts/migrate.mjs runs this at start.

create table if not exists signups (
  id                    uuid primary key default gen_random_uuid(),
  email                 text not null,
  email_normalized      text not null,
  created_at            timestamptz not null default now(),

  landing_variant       text not null default 'v1',
  traffic_cohort        text not null default 'other',

  utm_source            text,
  utm_medium            text,
  utm_campaign          text,
  utm_content           text,
  utm_term              text,
  fbclid                text,
  referrer              text,
  landing_path          text,
  user_agent            text,

  first_flavor_click    text,

  flavor_preference     text,
  occasion_preferences  text[],
  pack_preference       text,
  snack_instead         text,
  answers_updated_at    timestamptz,

  constraint signups_email_len check (char_length(email) <= 254),
  constraint signups_snack_len check (snack_instead is null or char_length(snack_instead) <= 200),
  constraint signups_cohort check (traffic_cohort in ('meta', 'organic', 'direct', 'other'))
);

create unique index if not exists signups_email_normalized_key on signups (email_normalized);
create index if not exists signups_created_at_idx on signups (created_at);
create index if not exists signups_cohort_idx on signups (traffic_cohort);
create index if not exists signups_utm_content_idx on signups (utm_content);

-- Signup rate limit, shared by every server instance (lib/rate-limit.ts). Holds only a salted
-- SHA-256 of the visitor's IP and a timestamp, never linked to a signup; rows older than the
-- 10-minute window are deleted on every signup attempt and every health check.
create table if not exists signup_attempts (
  key_hash   text not null,
  created_at timestamptz not null default now()
);
create index if not exists signup_attempts_key_idx on signup_attempts (key_hash, created_at);
