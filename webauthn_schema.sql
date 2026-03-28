create table if not exists user_passkeys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  device_type text default 'singleDevice',
  backed_up boolean default false,
  transports text[] default '{}',
  created_at timestamp with time zone default now(),
  last_used_at timestamp with time zone default now()
);

alter table user_passkeys enable row level security;

drop policy if exists "Users can view own passkeys" on user_passkeys;
create policy "Users can view own passkeys"
  on user_passkeys for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete own passkeys" on user_passkeys;
create policy "Users can delete own passkeys"
  on user_passkeys for delete
  using ( auth.uid() = user_id );
