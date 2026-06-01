create extension if not exists "pgcrypto";

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  email text,
  display_name text,
  units text not null default 'imperial' check (units in ('metric', 'imperial'))
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_current_timestamp_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

insert into public.profiles (id, email)
select id, email
from auth.users
on conflict (id) do update
set email = excluded.email;

create table if not exists public.exercise_library (
  id text primary key,
  created_at timestamptz not null default timezone('utc', now()),
  name text not null,
  category text not null check (category in ('squat', 'hinge', 'push', 'pull', 'core', 'conditioning', 'carry')),
  focus_tags text[] not null default '{}',
  equipment text[] not null default '{}',
  cues text[] not null default '{}',
  common_mistakes text[] not null default '{}',
  video_url text
);

create table if not exists public.exercise_media (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  exercise_id text not null references public.exercise_library(id) on delete cascade,
  media_type text not null default 'video' check (media_type in ('video', 'image')),
  external_url text,
  storage_path text,
  thumbnail_url text,
  caption text,
  unique (exercise_id, external_url)
);

create table if not exists public.training_programs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text not null,
  input jsonb not null,
  generator_version text not null default 'v1',
  is_active boolean not null default true
);

alter table public.training_programs
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists title text,
  add column if not exists summary text,
  add column if not exists input jsonb,
  add column if not exists generator_version text not null default 'v1',
  add column if not exists is_active boolean not null default true;

create unique index if not exists training_programs_one_active_per_user_idx
on public.training_programs (user_id)
where is_active;

create table if not exists public.program_blocks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  program_id uuid not null references public.training_programs(id) on delete cascade,
  sort_order integer not null check (sort_order >= 0),
  month_number integer not null check (month_number >= 1),
  title text not null,
  objective text not null,
  intensity text not null,
  unique (program_id, sort_order)
);

create table if not exists public.program_weeks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  block_id uuid not null references public.program_blocks(id) on delete cascade,
  sort_order integer not null check (sort_order >= 0),
  week_number integer not null check (week_number >= 1),
  is_deload boolean not null default false,
  focus text not null,
  unique (block_id, sort_order)
);

create table if not exists public.program_days (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  week_id uuid not null references public.program_weeks(id) on delete cascade,
  sort_order integer not null check (sort_order >= 0),
  day_number integer not null check (day_number >= 1),
  title text not null,
  focus text not null,
  warmup text not null,
  finisher text not null,
  unique (week_id, sort_order)
);

create table if not exists public.planned_exercises (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  program_day_id uuid not null references public.program_days(id) on delete cascade,
  sort_order integer not null check (sort_order >= 0),
  exercise_id text not null references public.exercise_library(id),
  name text not null,
  sets_target integer not null check (sets_target >= 1),
  rep_range text not null,
  rest_seconds integer not null check (rest_seconds >= 0),
  target_rpe numeric(3, 1) not null check (target_rpe >= 0 and target_rpe <= 10),
  notes text not null default '',
  unique (program_day_id, sort_order)
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.training_programs(id) on delete cascade,
  program_day_id uuid references public.program_days(id) on delete set null,
  session_number integer not null check (session_number >= 1),
  performed_on date not null default current_date,
  notes text,
  unique (user_id, program_day_id, session_number)
);

alter table public.workout_sessions
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists program_id uuid references public.training_programs(id) on delete cascade,
  add column if not exists program_day_id uuid references public.program_days(id) on delete set null,
  add column if not exists session_number integer,
  add column if not exists performed_on date not null default current_date,
  add column if not exists notes text;

create table if not exists public.set_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id text not null references public.exercise_library(id),
  exercise_name text not null,
  set_number integer not null check (set_number >= 1),
  reps integer not null check (reps >= 1),
  weight numeric(8, 2) not null check (weight >= 0),
  rpe numeric(3, 1) not null check (rpe >= 0 and rpe <= 10),
  performed_at timestamptz not null default timezone('utc', now()),
  unique (session_id, exercise_id, set_number)
);

alter table public.set_logs
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists session_id uuid references public.workout_sessions(id) on delete cascade,
  add column if not exists exercise_id text references public.exercise_library(id),
  add column if not exists exercise_name text,
  add column if not exists set_number integer,
  add column if not exists reps integer,
  add column if not exists weight numeric(8, 2),
  add column if not exists rpe numeric(3, 1),
  add column if not exists performed_at timestamptz not null default timezone('utc', now());

create index if not exists exercise_media_exercise_id_idx on public.exercise_media (exercise_id);
create index if not exists training_programs_user_id_idx on public.training_programs (user_id, created_at desc);
create index if not exists program_blocks_program_id_idx on public.program_blocks (program_id, sort_order);
create index if not exists program_weeks_block_id_idx on public.program_weeks (block_id, sort_order);
create index if not exists program_days_week_id_idx on public.program_days (week_id, sort_order);
create index if not exists planned_exercises_program_day_id_idx on public.planned_exercises (program_day_id, sort_order);
create index if not exists workout_sessions_user_program_idx on public.workout_sessions (user_id, program_id, performed_on desc);
create index if not exists set_logs_user_idx on public.set_logs (user_id, performed_at desc);

alter table public.profiles enable row level security;
alter table public.exercise_library enable row level security;
alter table public.exercise_media enable row level security;
alter table public.training_programs enable row level security;
alter table public.program_blocks enable row level security;
alter table public.program_weeks enable row level security;
alter table public.program_days enable row level security;
alter table public.planned_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.set_logs enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Authenticated users can read exercise library" on public.exercise_library;
create policy "Authenticated users can read exercise library"
on public.exercise_library
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read exercise media" on public.exercise_media;
create policy "Authenticated users can read exercise media"
on public.exercise_media
for select
to authenticated
using (true);

drop policy if exists "Users can manage their own programs" on public.training_programs;
create policy "Users can manage their own programs"
on public.training_programs
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage blocks for their programs" on public.program_blocks;
create policy "Users can manage blocks for their programs"
on public.program_blocks
for all
to authenticated
using (
  exists (
    select 1
    from public.training_programs programs
    where programs.id = program_id
      and programs.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.training_programs programs
    where programs.id = program_id
      and programs.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage weeks for their programs" on public.program_weeks;
create policy "Users can manage weeks for their programs"
on public.program_weeks
for all
to authenticated
using (
  exists (
    select 1
    from public.program_blocks blocks
    join public.training_programs programs on programs.id = blocks.program_id
    where blocks.id = block_id
      and programs.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.program_blocks blocks
    join public.training_programs programs on programs.id = blocks.program_id
    where blocks.id = block_id
      and programs.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage days for their programs" on public.program_days;
create policy "Users can manage days for their programs"
on public.program_days
for all
to authenticated
using (
  exists (
    select 1
    from public.program_weeks weeks
    join public.program_blocks blocks on blocks.id = weeks.block_id
    join public.training_programs programs on programs.id = blocks.program_id
    where weeks.id = week_id
      and programs.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.program_weeks weeks
    join public.program_blocks blocks on blocks.id = weeks.block_id
    join public.training_programs programs on programs.id = blocks.program_id
    where weeks.id = week_id
      and programs.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage planned exercises for their programs" on public.planned_exercises;
create policy "Users can manage planned exercises for their programs"
on public.planned_exercises
for all
to authenticated
using (
  exists (
    select 1
    from public.program_days days
    join public.program_weeks weeks on weeks.id = days.week_id
    join public.program_blocks blocks on blocks.id = weeks.block_id
    join public.training_programs programs on programs.id = blocks.program_id
    where days.id = program_day_id
      and programs.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.program_days days
    join public.program_weeks weeks on weeks.id = days.week_id
    join public.program_blocks blocks on blocks.id = weeks.block_id
    join public.training_programs programs on programs.id = blocks.program_id
    where days.id = program_day_id
      and programs.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage their own workout sessions" on public.workout_sessions;
create policy "Users can manage their own workout sessions"
on public.workout_sessions
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own set logs" on public.set_logs;
create policy "Users can manage their own set logs"
on public.set_logs
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into public.exercise_library (id, name, category, focus_tags, equipment, cues, common_mistakes, video_url)
values
  (
    'front-squat',
    'Front Squat',
    'squat',
    array['lower', 'quad', 'strength'],
    array['barbell', 'rack'],
    array['Brace before every rep.', 'Drive elbows high.', 'Keep midfoot pressure.'],
    array['Elbows dropping', 'Knees collapsing inward'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'goblet-squat',
    'Goblet Squat',
    'squat',
    array['lower', 'quad', 'hypertrophy'],
    array['dumbbells', 'kettlebells'],
    array['Sit between your hips.', 'Keep your torso tall.', 'Use a controlled descent.'],
    array['Losing heel pressure', 'Rushing the eccentric'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'romanian-deadlift',
    'Romanian Deadlift',
    'hinge',
    array['posterior', 'hamstrings', 'strength'],
    array['barbell', 'dumbbells'],
    array['Push the hips back.', 'Keep the bar close.', 'Feel the hamstring stretch.'],
    array['Rounding the back', 'Turning it into a squat'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'bench-press',
    'Bench Press',
    'push',
    array['upper', 'push', 'strength'],
    array['barbell', 'bench'],
    array['Pin shoulders down.', 'Drive feet into the floor.', 'Control the pause.'],
    array['Flared elbows', 'Loose upper back'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'incline-dumbbell-press',
    'Incline Dumbbell Press',
    'push',
    array['upper', 'chest', 'hypertrophy'],
    array['bench', 'dumbbells'],
    array['Lower with control.', 'Stack wrists over elbows.', 'Keep shoulder blades set.'],
    array['Shortening range', 'Shrugging shoulders'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'pull-up',
    'Pull-Up',
    'pull',
    array['upper', 'back', 'strength'],
    array['pull_up_bar'],
    array['Start from a dead hang.', 'Drive elbows down.', 'Stay tight through the trunk.'],
    array['Half reps', 'Kipping unintentionally'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'chest-supported-row',
    'Chest-Supported Row',
    'pull',
    array['upper', 'back', 'hypertrophy'],
    array['bench', 'dumbbells'],
    array['Reach long at the bottom.', 'Pull toward the hip.', 'Pause at peak contraction.'],
    array['Jerking the weight', 'No scapular movement'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'walking-lunge',
    'Walking Lunge',
    'squat',
    array['lower', 'unilateral', 'hypertrophy'],
    array['bodyweight', 'dumbbells'],
    array['Step long enough for balance.', 'Stay stacked.', 'Push through the front foot.'],
    array['Torso tipping forward', 'Short strides'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'bodyweight-squat',
    'Bodyweight Squat',
    'squat',
    array['lower', 'quad', 'bodyweight'],
    array['bodyweight'],
    array['Reach hips down between the knees.', 'Keep heels connected.', 'Stand tall at the top.'],
    array['Collapsing knees', 'Cutting depth short'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'glute-bridge',
    'Glute Bridge',
    'hinge',
    array['posterior', 'glutes', 'bodyweight'],
    array['bodyweight'],
    array['Drive through the heels.', 'Pause at full hip extension.', 'Keep ribs down.'],
    array['Overarching the low back', 'Rushing through the pause'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'push-up',
    'Push-Up',
    'push',
    array['upper', 'chest', 'bodyweight'],
    array['bodyweight'],
    array['Keep a straight line from head to heel.', 'Lower with control.', 'Press the floor away.'],
    array['Hips sagging', 'Elbows flaring too wide'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'inverted-row',
    'Inverted Row',
    'pull',
    array['upper', 'back', 'bodyweight'],
    array['bodyweight', 'rack'],
    array['Pull the chest toward the bar.', 'Keep the body rigid.', 'Control the lowering phase.'],
    array['Shrugging shoulders', 'Letting hips drop'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'plank-drag',
    'Plank Drag',
    'core',
    array['core', 'stability'],
    array['dumbbells'],
    array['Minimize hip rotation.', 'Keep ribs down.', 'Move slowly.'],
    array['Rocking hips', 'Holding breath'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'dead-bug',
    'Dead Bug',
    'core',
    array['core', 'control', 'bodyweight'],
    array['bodyweight'],
    array['Press the low back gently into the floor.', 'Move opposite arm and leg slowly.', 'Exhale as you extend.'],
    array['Arching the back', 'Moving too quickly'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'mountain-climber',
    'Mountain Climber',
    'conditioning',
    array['conditioning', 'core', 'bodyweight'],
    array['bodyweight'],
    array['Keep shoulders stacked over wrists.', 'Drive knees with control.', 'Stay quiet through the hips.'],
    array['Bouncing hips', 'Losing plank position'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'bike-erg-sprint',
    'Bike Erg Sprint',
    'conditioning',
    array['conditioning', 'power'],
    array['cardio_machine'],
    array['Explode early in the sprint.', 'Recover fully between efforts.'],
    array['Starting too hard too early', 'Incomplete recovery'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'farmers-carry',
    'Farmer''s Carry',
    'carry',
    array['conditioning', 'grip', 'core'],
    array['dumbbells', 'kettlebells'],
    array['Walk tall.', 'Keep shoulders packed.', 'Take short quick steps.'],
    array['Leaning to one side', 'Loose grip posture'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ),
  (
    'tempo-run',
    'Tempo Run',
    'conditioning',
    array['conditioning', 'endurance'],
    array['bodyweight', 'cardio_machine'],
    array['Hold a sustainable hard pace.', 'Stay relaxed through shoulders.'],
    array['Starting too fast', 'Breaking form under fatigue'],
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  )
on conflict (id) do update
set
  name = excluded.name,
  category = excluded.category,
  focus_tags = excluded.focus_tags,
  equipment = excluded.equipment,
  cues = excluded.cues,
  common_mistakes = excluded.common_mistakes,
  video_url = excluded.video_url;

delete from public.exercise_media
where external_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

update public.exercise_library as exercise
set video_url = videos.url
from (
  values
    ('front-squat', 'https://cdn.muscleandstrength.com/exercises/front-squat.html'),
    ('goblet-squat', 'https://cdn.muscleandstrength.com/exercises/dumbbell-goblet-box-squat'),
    ('romanian-deadlift', 'https://cdn.muscleandstrength.com/exercises/romanian-deadlift'),
    ('bench-press', 'https://cdn.muscleandstrength.com/exercises/paused-barbell-bench-press'),
    ('incline-dumbbell-press', 'https://cdn.muscleandstrength.com/exercises/palms-in-incline-dumbbell-bench-press.html'),
    ('pull-up', 'https://cdn.muscleandstrength.com/exercises/pull-up-with-leg-raise'),
    ('chest-supported-row', 'https://cdn.muscleandstrength.com/exercises/chest-supported-dumbbell-row-with-isohold'),
    ('walking-lunge', 'https://cdn.muscleandstrength.com/exercises/walking-lunge'),
    ('bodyweight-squat', 'https://cdn.muscleandstrength.com/exercises/bodyweight-squat'),
    ('glute-bridge', 'https://cdn.muscleandstrength.com/exercises/glute-bridge'),
    ('push-up', 'https://cdn.muscleandstrength.com/exercises/wide-grip-push-ups.html'),
    ('inverted-row', 'https://cdn.muscleandstrength.com/exercises/weight-vest-weighted-inverted-row'),
    ('plank-drag', 'https://www.youtube.com/results?search_query=plank+drag+exercise+proper+form'),
    ('dead-bug', 'https://cdn.muscleandstrength.com/exercises/dead-bug-with-plates'),
    ('mountain-climber', 'https://cdn.muscleandstrength.com/exercises/mountain-climbers'),
    ('bike-erg-sprint', 'https://www.concept2.com/support/bikeerg/how-to-videos'),
    ('farmers-carry', 'https://cdn.muscleandstrength.com/exercises/kettlebell-racked-crossover-walk'),
    ('tempo-run', 'https://support.runna.com/en/articles/6205901-7-steps-to-great-running-form')
) as videos(id, url)
where exercise.id = videos.id;

insert into public.exercise_media (exercise_id, media_type, external_url, caption)
select
  id,
  'video',
  video_url,
  name || ' demo clip'
from public.exercise_library
where video_url is not null
on conflict do nothing;
