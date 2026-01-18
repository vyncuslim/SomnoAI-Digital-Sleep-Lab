
-- 1. Profiles Table Definition
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

-- 2. 修复递归的关键：定义一个 SECURITY DEFINER 函数
-- 该函数以创建者（通常是 postgres）的权限运行，因此内部的 SELECT 语句会绕过 RLS
-- 设置 search_path 为 public 是安全最佳实践，防止搜索路径攻击
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 直接查询表，由于是 security definer，此处不会触发 profiles 表上的 RLS 递归
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$;

-- 3. 配置行级安全 (RLS)
alter table public.profiles enable row level security;

-- 允许用户查看和更新自己的个人资料（非递归基础策略）
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

-- 允许管理员执行所有操作
-- 使用我们定义的 is_admin() 函数，由于它是 security definer，调用它不会导致递归
drop policy if exists "Admins have full access" on public.profiles;
create policy "Admins have full access"
on public.profiles
for all
to authenticated
using (public.is_admin());

-- 4. 自动处理新用户注册
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

-- 5. 安全事件日志表
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

drop policy if exists "Admins can view security events" on public.security_events;
create policy "Admins can view security events"
on public.security_events
for select
to authenticated
using (public.is_admin());
