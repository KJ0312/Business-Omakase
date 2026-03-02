# Business Omakase (Public Site)

Vite + React public website for lead intake.  
Admin dashboard is a separate app in `../admin-app`.

## Run

```bash
cd react-pages-app
npm install
npm run dev
```

## Required env (`react-pages-app/.env.local`)

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
```

## Supabase setup

Run both SQL files in Supabase SQL Editor:

1. `supabase/migrations/20260302_create_leads_profiles.sql`
2. `supabase/migrations/20260302_owner_dashboard_upgrade.sql`

## Edge Functions

Deploy function:

```bash
supabase functions deploy enrich-lead-origin --project-ref YOUR_PROJECT_REF
supabase functions deploy analyze-lead --project-ref YOUR_PROJECT_REF
```

Function secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## What is tracked on public site

- session id (localStorage, 30 days)
- UTM params
- referrer + landing page
- pages viewed
- max scroll depth
- time on site
- events: `page_view`, `form_open`, `form_start`, `form_submit`

## E2E test scenario

1. Open `/`, scroll, open Reserve Now form.
2. Fill required fields and submit.
3. Check success popup.
4. In Supabase `leads` table verify:
   - form fields saved
   - tracking fields saved (`session_id`, `utm_*`, `scroll_depth_pct`, etc.)
5. Wait a few seconds and verify AI fields updated by Edge Function:
   - `lead_score`, `intent_category`, `ai_summary`, `ai_tags`.
6. Open admin app and verify the lead appears in `/ops/leads`.
