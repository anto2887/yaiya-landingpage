-- Ready queries for reading the waitlist.
-- Run in Railway's database view or with psql.
-- Every query excludes test signups (landing_variant = 'qa').

-- 1. Total signups
select count(*) as signups
from signups
where landing_variant <> 'qa';

-- 2. Signups per day (UTC)
select date_trunc('day', created_at)::date as day, count(*) as signups
from signups
where landing_variant <> 'qa'
group by 1
order by 1;

-- 3. Signups by traffic cohort
select traffic_cohort, count(*) as signups
from signups
where landing_variant <> 'qa'
group by 1
order by 2 desc;

-- 4. Signups by ad (utm_content), Meta traffic only
select coalesce(utm_content, '(none)') as ad, count(*) as signups
from signups
where landing_variant <> 'qa' and traffic_cohort = 'meta'
group by 1
order by 2 desc;

-- 5. Meta signups in a date range: divide ad spend by this for cost per signup
--    Replace the two dates.
select count(*) as meta_signups
from signups
where landing_variant <> 'qa'
  and traffic_cohort = 'meta'
  and created_at >= '2026-10-12'
  and created_at <  '2026-10-22';

-- 6. Flavor picked on the landing page before signup
select coalesce(first_flavor_click, '(none)') as flavor, count(*) as signups
from signups
where landing_variant <> 'qa'
group by 1
order by 2 desc;

-- 7. Flavor preference from the thank-you page
select flavor_preference, count(*) as answers
from signups
where landing_variant <> 'qa' and flavor_preference is not null
group by 1
order by 2 desc;

-- 8. Occasions chosen on the thank-you page
select occasion, count(*) as picks
from signups, unnest(occasion_preferences) as occasion
where landing_variant <> 'qa'
group by 1
order by 2 desc;

-- 9. Pack preference
select pack_preference, count(*) as answers
from signups
where landing_variant <> 'qa' and pack_preference is not null
group by 1
order by 2 desc;

-- 10. What people snack on instead (free text)
select snack_instead
from signups
where landing_variant <> 'qa' and snack_instead is not null
order by created_at;

-- 11. Share of signups that answered at least one question
select
  count(*) filter (where answers_updated_at is not null) as answered,
  count(*) as signups,
  round(100.0 * count(*) filter (where answers_updated_at is not null) / nullif(count(*), 0), 1) as pct
from signups
where landing_variant <> 'qa';

-- 12. Full export (contains email addresses: handle with care)
select *
from signups
where landing_variant <> 'qa'
order by created_at;

-- 13. Remove test signups before launch
-- delete from signups where landing_variant = 'qa';
