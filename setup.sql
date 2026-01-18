-- 1. 数据模型 (Profiles 表)
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

-- 2. 打破递归的核心：定义安全检查函数
-- SECURITY DEFINER 允许函数以创建者的权限运行，从而绕过 RLS 检查
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 3. 重新配置 RLS 策略
alter table public.profiles enable row level security;

-- 允许用户查看和更新自己的资料
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

-- 使用安全函数进行 Admin 权限校验，解决无限递归问题
create policy "Admins full access"
on public.profiles
for all
using (public.is_admin());

-- 4. 自动同步用户记录
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 5. 安全事件表
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
create policy "Admins view security" 
on public.security_events for select 
using (public.is_admin());