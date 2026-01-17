-- 1. 数据模型 (Profiles 表)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. 自动创建用户资料 (Auth → Profile 同步)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 3. 行级安全策略 (RLS)
alter table profiles enable row level security;

-- 用户只能读写自己
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
on profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);

-- Admin 可以访问所有用户
drop policy if exists "Admins full access" on profiles;
create policy "Admins full access"
on profiles
for all
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);

-- 4. 实验室审计日志与安全事件 (扩展表)
create table if not exists public.security_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  email text,
  event_type text not null,
  event_reason text,
  notified boolean default false,
  created_at timestamp with time zone default now()
);

alter table security_events enable row level security;
drop policy if exists "Admins view security" on security_events;
create policy "Admins view security" on security_events for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
