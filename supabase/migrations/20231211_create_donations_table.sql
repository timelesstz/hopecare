-- Create exec_sql function for running SQL commands
create or replace function public.exec_sql(query text)
returns void as $$
begin
  execute query;
end;
$$ language plpgsql security definer;

-- Create donations table
create table if not exists public.donations (
    id uuid default uuid_generate_v4() primary key,
    amount numeric not null,
    currency text not null default 'KES',
    type text not null,
    status text not null,
    payment_intent_id text unique,
    provider text not null default 'unlimit',
    metadata jsonb,
    user_id uuid references auth.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.donations enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.donations
    for select using (true);

create policy "Enable insert access for authenticated users" on public.donations
    for insert with check (auth.role() = 'authenticated');

-- Create function to update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_donations_updated_at
    before update on public.donations
    for each row
    execute function public.handle_updated_at();
