-- 1. Profiles Table Definition
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  is_blocked boolean default false,
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. BREAKING THE RECURSION: Define a security definer function
-- This function runs with the privileges of the creator (postgres), 
-- bypassing RLS policies of the caller. This is the only safe way 
-- to check role-based access on the same table being secured.
create or replace function public.check_is_admin()
returns boolean as $$
declare
  is_admin_user boolean;
begin
  select (role = 'admin') into is_admin_user
  from public.profiles
  where id = auth.uid();
  
  return coalesce(is_admin_user, false);
end;
$$ language plpgsql security definer;

-- 3. Row Level Security Configuration
alter table public.profiles enable row level security;

-- Policy: Users can see and update their own records
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

-- Policy: Admins get full access (Using the non-recursive function)
drop policy if exists "Admins full access" on public.profiles;
create policy "Admins full access"
on public.profiles
for all
using (public.check_is_admin());

-- 4. User Lifecycle Management
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 5. Security Logs
create table if not exists public.security_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  email text,
  event_type text not null,
  event_reason text,
  notified boolean default false,
  created_at timestamp with time zone default now()
);

alter table public.security_events enable row level security;
drop policy if exists "Admins view security" on public.security_events;
create policy "Admins view security" 
on public.security_events for select 
using (public.check_is_admin());