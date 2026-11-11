-- Vibe Chef on a Budget: core schema
-- Run via `npm run db:migrate` (uses SUPABASE_DB_URL).

create extension if not exists pgcrypto;

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  mood text not null,
  cravings text,
  budget numeric not null,
  currency text not null default 'USD',
  meal_name text not null,
  emoji text,
  cuisine text,
  description text,
  estimated_cost numeric not null,
  match_reason text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists recommendations_created_at_idx
  on recommendations (created_at desc);

create index if not exists recommendations_is_favorite_idx
  on recommendations (is_favorite)
  where is_favorite = true;
