-- Create logs table for transaction logging
create table if not exists public.logs (
    id uuid default uuid_generate_v4() primary key,
    level text not null,
    category text not null,
    message text not null,
    details jsonb,
    user_id uuid references auth.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.logs enable row level security;

-- Create policies
create policy "Enable read access for authenticated users" on public.logs
    for select using (auth.role() = 'authenticated');

create policy "Enable insert access for authenticated users" on public.logs
    for insert with check (auth.role() = 'authenticated');

-- Create index for faster queries
create index if not exists logs_category_level_idx on public.logs (category, level);
create index if not exists logs_user_id_idx on public.logs (user_id);
create index if not exists logs_created_at_idx on public.logs (created_at);

-- Comment on table
comment on table public.logs is 'System logs for debugging and auditing'; 