-- Create analytics_events table
create table if not exists public.analytics_events (
    id uuid default uuid_generate_v4() primary key,
    event_name text not null,
    properties jsonb default '{}'::jsonb,
    timestamp timestamp with time zone default timezone('utc'::text, now()),
    user_id uuid references auth.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.analytics_events enable row level security;

-- Create policies
create policy "Enable insert for all users" on public.analytics_events
    for insert with check (true);

create policy "Enable read access for authenticated users" on public.analytics_events
    for select using (auth.role() = 'authenticated');

-- Create indexes
create index analytics_events_event_name_idx on public.analytics_events (event_name);
create index analytics_events_timestamp_idx on public.analytics_events (timestamp);
create index analytics_events_user_id_idx on public.analytics_events (user_id);

-- Create function to clean up old events
create or replace function public.cleanup_old_analytics_events()
returns void as $$
begin
    delete from public.analytics_events
    where timestamp < now() - interval '90 days';
end;
$$ language plpgsql security definer;

-- Create a scheduled job to clean up old events (runs daily)
select cron.schedule(
    'cleanup_analytics_events',
    '0 0 * * *', -- every day at midnight
    $$select public.cleanup_old_analytics_events()$$
);
