
-- 1. 用户基础档案表 (含姓名)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text, 
  role text default 'user',
  is_blocked boolean default false,
  created_at timestamp with time zone default now()
);

-- 2. 用户生物识别与配置状态表
create table if not exists public.user_data (
  id uuid primary key references public.profiles(id) on delete cascade,
  age integer,
  height float,
  weight float,
  gender text,
  setup_completed boolean default false,
  updated_at timestamp with time zone default now()
);

-- 3. 自动创建 Profile 的触发器逻辑 (Supabase 标准实践)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 重置触发器
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 为现有用户补全缺失的 Profile
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- 4. 开启安全策略 (RLS)
alter table public.profiles enable row level security;
alter table public.user_data enable row level security;

-- Profiles 策略 (允许插入和更新)
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- User Data 策略 (允许插入和更新)
drop policy if exists "Users can view own data" on public.user_data;
drop policy if exists "Users can insert own data" on public.user_data;
drop policy if exists "Users can update own data" on public.user_data;

create policy "Users can view own data" on public.user_data for select using (auth.uid() = id);
create policy "Users can insert own data" on public.user_data for insert with check (auth.uid() = id);
create policy "Users can update own data" on public.user_data for update using (auth.uid() = id);
