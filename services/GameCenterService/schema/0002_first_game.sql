insert into games (id, title)
values ('flattybird', 'Flatty Bird')
on conflict (id) do nothing;

insert into leaderboards (
  game_id,
  id,
  title,
  minimum_first_point_seconds,
  minimum_seconds_per_point,
  minimum_duration_milliseconds,
  maximum_duration_milliseconds,
  minimum_frames_per_second,
  maximum_frames_per_second,
  minimum_inputs_per_point
)
values (
  'flattybird',
  'high-score',
  'High Score',
  1.200,
  1.200,
  500,
  3600000,
  20.00,
  240.00,
  1.00
)
on conflict (game_id, id) do nothing;
