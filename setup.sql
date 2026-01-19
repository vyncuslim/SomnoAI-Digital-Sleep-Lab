
-- 1. Profiles Table Definition (Existing)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  role text default 'user',
  is_blocked boolean default false,
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. New User Data Table for Physiological Metrics
create table if not exists public.user_data (
  id uuid primary key references public.profiles(id) on delete cascade,
  age integer,
  weight float, -- kg
  height float, -- cm
  gender text,
  setup_completed boolean default false,
  updated_at timestamp with time zone default now()
);

-- 3. Security Definer Functions
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$;

-- 4. RLS for user_data
alter table public.user_data enable row level security;

create policy "Users can view own user_data"
on public.user_data for select
using (auth.uid() = id);

create policy "Users can update own user_data"
on public.user_data for update
using (auth.uid() = id);

create policy "Users can insert own user_data"
on public.user_data for insert
with check (auth.uid() = id);

-- 5. Auto-create user_data on profile creation
create or replace function public.handle_new_user_data()
returns trigger as $$
begin
  insert into public.user_data (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
after insert on public.profiles
for each row execute procedure public.handle_new_user_data();

-- 6. Security events and triggers (existing continuation)
create table if not exists public.security_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  email text,
  event_type text not null,
  event_reason text,
  notified boolean default false,
  created_at timestamp with time zone default now()
);
