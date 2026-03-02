-- Extensions
create extension if not exists pgcrypto;

-- Leads table
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  language text not null,
  source_page text not null,
  status text not null default 'NEW',
  priority int not null default 0,
  tags text[] not null default '{}'::text[],
  note text
);

-- Profiles table for admin roles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('admin', 'viewer'))
);

create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_language_idx on public.leads(language);
create index if not exists leads_source_page_idx on public.leads(source_page);
create index if not exists leads_tags_gin_idx on public.leads using gin(tags);

-- Keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- RLS
alter table public.leads enable row level security;
alter table public.profiles enable row level security;

-- Profiles: user can read own profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

-- Leads: public insert only
drop policy if exists "leads_insert_anon" on public.leads;
create policy "leads_insert_anon"
on public.leads
for insert
to anon, authenticated
with check (true);

-- Leads: admin read
drop policy if exists "leads_select_admin" on public.leads;
create policy "leads_select_admin"
on public.leads
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  )
);

-- Leads: admin update
drop policy if exists "leads_update_admin" on public.leads;
create policy "leads_update_admin"
on public.leads
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  )
);
insert into public.profiles (user_id, role)
select id, 'admin'
from auth.users
where email = 'skkm0312@naver.com'
on conflict (user_id) do update set role = 'admin';
select u.email, p.role
from auth.users u
left join public.profiles p on p.user_id = u.id
where u.email = 'skkm0312@naver.com';
