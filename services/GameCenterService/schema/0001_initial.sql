create table if not exists players (
  id uuid primary key default uuidv7(),
  alias text,
  alias_normalised text,
  alias_claimed_at timestamptz,
  status text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint players_alias_pairing check ((alias is null) = (alias_normalised is null)),
  constraint players_alias_length check (alias is null or char_length(alias) between 3 and 15),
  constraint players_status_length check (char_length(status) <= 90)
);

create unique index if not exists players_alias_normalised_key on players (alias_normalised);

create table if not exists credentials (
  player_id uuid primary key references players(id) on delete cascade,
  email text not null,
  email_normalised text not null,
  password_record text not null,
  password_updated_at timestamptz not null default now()
);

create unique index if not exists credentials_email_normalised_key
  on credentials (email_normalised);

create table if not exists sessions (
  id uuid primary key default uuidv7(),
  player_id uuid not null references players(id) on delete cascade,
  token_hash bytea not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create unique index if not exists sessions_token_hash_key on sessions (token_hash);
create index if not exists sessions_player_id_idx on sessions (player_id);
create index if not exists sessions_expires_at_idx on sessions (expires_at);

create table if not exists games (
  id text primary key,
  title text not null,
  created_at timestamptz not null default now(),
  constraint games_id_slug check (id ~ '^[a-z0-9-]{2,40}$')
);

create table if not exists leaderboards (
  game_id text not null references games(id) on delete cascade,
  id text not null,
  title text not null,
  minimum_first_point_seconds numeric(8,3) not null,
  minimum_seconds_per_point numeric(8,3) not null,
  minimum_duration_milliseconds integer not null,
  maximum_duration_milliseconds integer not null,
  minimum_frames_per_second numeric(6,2) not null,
  maximum_frames_per_second numeric(6,2) not null,
  minimum_inputs_per_point numeric(6,2) not null,
  primary key (game_id, id),
  constraint leaderboards_id_slug check (id ~ '^[a-z0-9-]{2,40}$'),
  constraint leaderboards_duration_order
    check (minimum_duration_milliseconds < maximum_duration_milliseconds),
  constraint leaderboards_rate_order
    check (minimum_frames_per_second < maximum_frames_per_second)
);

create table if not exists scores (
  game_id text not null,
  leaderboard_id text not null,
  player_id uuid not null references players(id) on delete cascade,
  score integer not null,
  run_id uuid not null,
  achieved_at timestamptz not null default now(),
  primary key (game_id, leaderboard_id, player_id),
  foreign key (game_id, leaderboard_id) references leaderboards(game_id, id) on delete cascade,
  constraint scores_nonnegative check (score >= 0)
);

create index if not exists scores_ranking_idx
  on scores (game_id, leaderboard_id, score desc, achieved_at asc);
create index if not exists scores_player_idx on scores (player_id);

create table if not exists runs (
  id uuid primary key default uuidv7(),
  game_id text not null,
  leaderboard_id text not null,
  player_id uuid not null references players(id) on delete cascade,
  token_hash bytea not null,
  seed integer not null,
  opened_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  submitted_score integer,
  duration_milliseconds integer,
  frame_count integer,
  input_count integer,
  outcome text,
  foreign key (game_id, leaderboard_id) references leaderboards(game_id, id) on delete cascade,
  constraint runs_outcome check (outcome is null or outcome in ('accepted', 'rejected')),
  constraint runs_outcome_pairing check (outcome is null or submitted_at is not null)
);

create unique index if not exists runs_token_hash_key on runs (token_hash);
create index if not exists runs_player_open_idx
  on runs (player_id, expires_at) where submitted_at is null;
create index if not exists runs_expires_at_idx on runs (expires_at);
create index if not exists runs_player_submitted_idx
  on runs (player_id, submitted_at desc) where submitted_at is not null;

create table if not exists score_rejections (
  id uuid primary key default uuidv7(),
  run_id uuid references runs(id) on delete set null,
  player_id uuid references players(id) on delete set null,
  game_id text not null,
  leaderboard_id text not null,
  reason text not null,
  submitted_score integer,
  duration_milliseconds integer,
  frame_count integer,
  input_count integer,
  address inet,
  rejected_at timestamptz not null default now()
);

create index if not exists score_rejections_player_idx
  on score_rejections (player_id, rejected_at desc);
create index if not exists score_rejections_reason_idx
  on score_rejections (reason, rejected_at desc);

create table if not exists rate_limits (
  bucket text primary key,
  window_started_at timestamptz not null,
  hits integer not null
);

create index if not exists rate_limits_window_idx on rate_limits (window_started_at);
