-- USERS TABLE IS BUILT-IN (auth.users)
-- We extend it with user_profiles

-- 1. user_profiles
create table public.user_profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  fav_sport  text default 'Soccer',
  created_at timestamptz default now()
);

-- RLS for user_profiles
alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  using ( auth.uid() = user_id );

create policy "Users can update own profile"
  on public.user_profiles for update
  using ( auth.uid() = user_id );

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check ( auth.uid() = user_id );

-- 2. user_favorite_leagues
create table public.user_favorite_leagues (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  id_league   int not null,
  str_league  text not null,
  str_sport   text,
  str_country text,
  badge_url   text,
  created_at  timestamptz default now(),
  unique (user_id, id_league)
);

-- RLS for user_favorite_leagues
alter table public.user_favorite_leagues enable row level security;

create policy "Users can view own favorites"
  on public.user_favorite_leagues for select
  using ( auth.uid() = user_id );

create policy "Users can insert own favorites"
  on public.user_favorite_leagues for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own favorites"
  on public.user_favorite_leagues for delete
  using ( auth.uid() = user_id );

-- Function to handle new user signup (optional but recommended)
-- This automatically creates a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
-- Drop if exists just in case
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
