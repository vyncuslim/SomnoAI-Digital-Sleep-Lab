-- USB Authentication Table
create table if not exists user_usb_keys (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  vendor_id integer not null,
  product_id integer not null,
  serial_number text,
  product_name text,
  manufacturer_name text,
  status text default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, vendor_id, product_id, serial_number)
);

-- RLS Policies
alter table user_usb_keys enable row level security;

create policy "Users can view own USB keys"
  on user_usb_keys for select
  using ( auth.uid() = user_id );

create policy "Users can delete own USB keys"
  on user_usb_keys for delete
  using ( auth.uid() = user_id );
