# Admin Deployment (`admin-app`)

## Local access

- URL: `http://localhost:3001/ops/leads`
- No public site link is exposed to this path.

## Env (`admin-app/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Start

```bash
cd admin-app
npm install
npm run dev -- -p 3001
```

## Admin account bootstrap

1. Create user in Supabase Auth (email/password).
2. Assign role:

```sql
insert into public.profiles (user_id, role)
select id, 'admin'
from auth.users
where email = 'YOUR_ADMIN_EMAIL'
on conflict (user_id) do update set role = 'admin';
```

## Production split

- Public site: `businessomakase.com`
- Admin site: `admin.businessomakase.com`

Deploy as separate services/projects.

## Security model

- Public app uses anon key and can only `insert` into `leads/sessions/events`.
- Admin dashboard requires:
  - Supabase Auth login
  - `profiles.role = 'admin'`
  - optional allowlist check via `ADMIN_EMAILS`
- RLS blocks read/update access for non-admin accounts.

