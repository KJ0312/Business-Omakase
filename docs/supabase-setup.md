# Supabase Setup

## 1) Run SQL migrations in order

1. `supabase/migrations/20260302_create_leads_profiles.sql`
2. `supabase/migrations/20260302_owner_dashboard_upgrade.sql`

## 2) Verify tables

```sql
select table_name
from information_schema.tables
where table_schema='public'
  and table_name in ('leads','profiles','sessions','events','lead_status_history');
```

## 3) Create first admin profile

```sql
insert into public.profiles (user_id, role)
select id, 'admin'
from auth.users
where email = 'YOUR_ADMIN_EMAIL'
on conflict (user_id) do update set role = 'admin';
```

## 4) Deploy Edge Functions

```bash
supabase functions deploy enrich-lead-origin --project-ref YOUR_PROJECT_REF
supabase functions deploy analyze-lead --project-ref YOUR_PROJECT_REF
```

Set secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## 5) RLS policy intent

- `leads`: public insert only, admin select/update only
- `sessions/events`: public insert/update, admin select only
- `lead_status_history`: admin select only
