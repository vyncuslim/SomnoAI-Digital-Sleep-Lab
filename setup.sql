
-- 1. Profiles Table Definition (Ensure it exists)
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

-- 2. RESOLVE RECURSION: Define a robust security definer function
-- Setting search_path to 'public' is a security best practice for 'security definer' functions.
-- This function bypasses RLS for the tables it queries internally.
create or replace function public.check_is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin_user boolean;
begin
  select (role = 'admin') into is_admin_user
  from public.profiles
  where id = auth.uid();
  
  return coalesce(is_admin_user, false);
end;
$$;

-- 3. Row Level Security Configuration
alter table public.profiles enable row level security;

-- Policy: Users can always see their own row (Minimal check, prevents recursion)
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

-- Policy: Admins get full access to all rows
-- We use the security definer function here. Since the function runs as 'postgres',
-- it is not restricted by RLS, breaking the recursion loop.
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
