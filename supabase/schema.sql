create extension if not exists "pgcrypto";

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  name text not null,
  goal text not null check (goal in ('muscle_gain', 'fat_loss', 'endurance', 'strength', 'general_fitness')),
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  days_per_week integer not null check (days_per_week between 2 and 6),
  session_length integer not null check (session_length between 20 and 120),
  equipment text[] not null default '{}',
  notes text,
  plan jsonb not null
);

alter table public.workouts enable row level security;

create index if not exists workouts_created_at_idx on public.workouts (created_at desc);
