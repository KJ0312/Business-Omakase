create extension if not exists pgcrypto;

create or replace function public.is_admin_user()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  );
$$;

alter table public.leads
  add column if not exists phone_country text,
  add column if not exists phone_code text,
  add column if not exists phone_number text,
  add column if not exists preferred_channel text[] not null default '{}'::text[],
  add column if not exists lead_type text,
  add column if not exists service_type text,
  add column if not exists service_scope text[] not null default '{}'::text[],
  add column if not exists summary text,
  add column if not exists assigned_to uuid references auth.users(id) on delete set null,
  add column if not exists next_action_at timestamptz,
  add column if not exists internal_notes text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists referrer_url text,
  add column if not exists landing_page text,
  add column if not exists session_id text,
  add column if not exists visit_count int not null default 1,
  add column if not exists time_on_site_sec int not null default 0,
  add column if not exists scroll_depth_pct int not null default 0,
  add column if not exists pages_viewed int not null default 1,
  add column if not exists device_type text,
  add column if not exists country_guess text,
  add column if not exists city_guess text,
  add column if not exists lead_score int not null default 0,
  add column if not exists intent_category text,
  add column if not exists industry_detected text,
  add column if not exists urgency_level text,
  add column if not exists project_complexity text,
  add column if not exists budget_signal text,
  add column if not exists ai_summary text,
  add column if not exists ai_tags text[] not null default '{}'::text[],
  add column if not exists analyzed_at timestamptz;

alter table public.leads
  alter column message drop not null,
  alter column source_page drop not null;

alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads
  add constraint leads_status_check
  check (
    status in (
      'NEW',
      'REVIEWING',
      'CONTACTED',
      'PROPOSAL_SENT',
      'NEGOTIATION',
      'CLOSED_WON',
      'CLOSED_LOST'
    )
  );

alter table public.leads drop constraint if exists leads_urgency_level_check;
alter table public.leads
  add constraint leads_urgency_level_check
  check (urgency_level is null or urgency_level in ('low', 'mid', 'high'));

alter table public.leads drop constraint if exists leads_project_complexity_check;
alter table public.leads
  add constraint leads_project_complexity_check
  check (project_complexity is null or project_complexity in ('low', 'mid', 'high'));

alter table public.leads drop constraint if exists leads_budget_signal_check;
alter table public.leads
  add constraint leads_budget_signal_check
  check (budget_signal is null or budget_signal in ('none', 'weak', 'strong'));

create table if not exists public.sessions (
  session_id text primary key,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  landing_page text,
  referrer_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  device_type text,
  country_guess text,
  pages_viewed int not null default 1,
  max_scroll_depth_pct int not null default 0,
  total_time_on_site_sec int not null default 0
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  created_at timestamptz not null default now(),
  event_name text not null,
  page_path text,
  meta jsonb not null default '{}'::jsonb
);

create table if not exists public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_at timestamptz not null default now(),
  changed_by uuid
);

create index if not exists leads_lead_score_idx on public.leads(lead_score desc);
create index if not exists leads_service_type_idx on public.leads(service_type);
create index if not exists leads_lead_type_idx on public.leads(lead_type);
create index if not exists leads_country_guess_idx on public.leads(country_guess);
create index if not exists leads_next_action_idx on public.leads(next_action_at);
create index if not exists leads_ai_tags_gin_idx on public.leads using gin(ai_tags);
create index if not exists sessions_last_seen_idx on public.sessions(last_seen_at desc);
create index if not exists events_created_at_idx on public.events(created_at desc);
create index if not exists events_name_idx on public.events(event_name);

create or replace function public.log_lead_status_change()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.lead_status_history (lead_id, old_status, new_status, changed_by)
    values (new.id, null, new.status, auth.uid());
    return new;
  end if;

  if (new.status is distinct from old.status) then
    insert into public.lead_status_history (lead_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_lead_status_history on public.leads;
create trigger trg_lead_status_history
after insert or update of status on public.leads
for each row execute function public.log_lead_status_change();

alter table public.sessions enable row level security;
alter table public.events enable row level security;
alter table public.lead_status_history enable row level security;

drop policy if exists sessions_insert_public on public.sessions;
create policy sessions_insert_public
on public.sessions
for insert
to anon, authenticated
with check (true);

drop policy if exists sessions_select_admin on public.sessions;
create policy sessions_select_admin
on public.sessions
for select
to authenticated
using (public.is_admin_user());

drop policy if exists sessions_update_public on public.sessions;
create policy sessions_update_public
on public.sessions
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists events_insert_public on public.events;
create policy events_insert_public
on public.events
for insert
to anon, authenticated
with check (true);

drop policy if exists events_select_admin on public.events;
create policy events_select_admin
on public.events
for select
to authenticated
using (public.is_admin_user());

drop policy if exists status_history_select_admin on public.lead_status_history;
create policy status_history_select_admin
on public.lead_status_history
for select
to authenticated
using (public.is_admin_user());

drop policy if exists status_history_insert_admin on public.lead_status_history;
create policy status_history_insert_admin
on public.lead_status_history
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists leads_select_admin on public.leads;
create policy leads_select_admin
on public.leads
for select
to authenticated
using (public.is_admin_user());

drop policy if exists leads_update_admin on public.leads;
create policy leads_update_admin
on public.leads
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());
