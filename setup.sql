
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

-- 3. 健康数据遥测记录表
create table if not exists public.health_telemetry (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  sync_id text unique,
  source text not null,
  device_info jsonb,
  payload jsonb not null,
  created_at timestamp with time zone default now()
);

-- 4. 开启安全策略 (RLS)
alter table public.profiles enable row level security;
alter table public.user_data enable row level security;
alter table public.health_telemetry enable row level security;

-- Profiles 策略
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- User Data 策略
create policy "Users can view own data" on public.user_data for select using (auth.uid() = id);
create policy "Users can insert own data" on public.user_data for insert with check (auth.uid() = id);
create policy "Users can update own data" on public.user_data for update using (auth.uid() = id);

-- Telemetry 策略
create policy "Users can view own telemetry" on public.health_telemetry for select using (auth.uid() = user_id);
create policy "Users can insert own telemetry" on public.health_telemetry for insert with check (auth.uid() = user_id);

-- 5. 自动更新时间戳
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.user_data
for each row execute procedure public.handle_updated_at();
