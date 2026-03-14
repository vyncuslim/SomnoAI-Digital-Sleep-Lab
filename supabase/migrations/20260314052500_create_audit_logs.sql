-- Create audit_logs table
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  action text not null,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- Create write_audit_log function
create or replace function public.write_audit_log(
  p_user_id uuid,
  p_action text,
  p_details jsonb,
  p_ip_address text,
  p_user_agent text
) returns void as $$
begin
  insert into public.audit_logs (user_id, action, details, ip_address, user_agent)
  values (p_user_id, p_action, p_details, p_ip_address, p_user_agent);
end;
$$ language plpgsql security definer;
