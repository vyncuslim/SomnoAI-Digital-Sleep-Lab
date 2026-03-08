-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS / PROFILES TABLE (Enhancement)
-- Assuming 'profiles' table already exists from Supabase Auth starter. 
-- We add columns to store the "current effective plan" for quick frontend access.
alter table profiles 
add column if not exists stripe_customer_id text,
add column if not exists subscription_id text,
add column if not exists subscription_plan text default 'free', -- 'free', 'go', 'pro', 'plus'
add column if not exists subscription_status text default 'none'; -- 'active', 'trialing', 'past_due', 'canceled', etc.

-- 2. SUBSCRIPTIONS TABLE (The Source of Truth)
-- Stores the full history and details of subscriptions.
create table if not exists subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_subscription_id text unique not null,
  stripe_price_id text,
  plan_name text not null, -- 'GO', 'PRO', 'PLUS'
  status text not null, -- 'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete_expired'
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. RLS POLICIES
-- Enable RLS
alter table subscriptions enable row level security;

-- Users can view their own subscriptions
create policy "Users can view own subscriptions"
  on subscriptions for select
  using ( auth.uid() = user_id );

-- Service role (backend) has full access (implicit in Supabase, but good to know)

-- 4. OPTIONAL: TRIGGER TO SYNC PROFILES
-- Automatically update the 'profiles' table when a subscription changes.
-- This keeps the frontend simple (just read profiles) while keeping data normalized.

create or replace function sync_profile_plan()
returns trigger as $$
begin
  -- If the subscription is active or trialing, update the profile
  if new.status in ('active', 'trialing') then
    update profiles
    set 
      subscription_plan = new.plan_name,
      subscription_status = new.status,
      subscription_id = new.stripe_subscription_id
    where id = new.user_id;
  
  -- If the subscription is canceled or unpaid, revert to free (or handle grace period logic here)
  elsif new.status in ('canceled', 'unpaid', 'incomplete_expired') then
    update profiles
    set 
      subscription_plan = 'free',
      subscription_status = new.status,
      subscription_id = null
    where id = new.user_id;
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Create the trigger
drop trigger if exists on_subscription_change on subscriptions;
create trigger on_subscription_change
  after insert or update on subscriptions
  for each row
  execute function sync_profile_plan();
