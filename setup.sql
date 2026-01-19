
-- 1. 确保基础用户表存在
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text default 'user',
  is_blocked boolean default false,
  created_at timestamp with time zone default now()
);

-- 2. 核心：健康数据遥测表 (API 落地表)
-- 设计原则：存储原始 JSON，以便后续 AI 深度分析
create table if not exists public.health_telemetry (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  sync_id text unique, -- 用于幂等性检查，防止网络重试导致数据重复
  source text not null,
  device_info jsonb,
  payload jsonb not null,
  created_at timestamp with time zone default now()
);

-- 3. 性能优化：为用户查询和时间排序建立索引
create index if not exists idx_telemetry_user_id on public.health_telemetry(user_id);
create index if not exists idx_telemetry_created_at on public.health_telemetry(created_at desc);

-- 4. 安全防护 (RLS) - 这是最重要的部分
alter table public.health_telemetry enable row level security;

-- 策略：禁止匿名写入，仅允许已认证用户插入自己的数据
create policy "Secure Ingress: Users can insert own telemetry"
on public.health_telemetry for insert
with check (auth.uid() = user_id);

-- 策略：仅允许用户读取自己的历史记录
create policy "Secure Egress: Users can view own telemetry"
on public.health_telemetry for select
using (auth.uid() = user_id);

-- 策略：禁止任何用户更新或删除已同步的健康数据 (不可篡改性)
-- (默认不创建 update/delete 策略即为禁止)
