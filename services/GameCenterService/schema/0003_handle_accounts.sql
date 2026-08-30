delete from players where alias is null;

alter table players alter column alias set not null;
alter table players alter column alias_normalised set not null;
alter table players drop column if exists alias_claimed_at;

alter table players drop constraint if exists players_alias_pairing;
alter table players drop constraint if exists players_alias_length;
alter table players add constraint players_alias_length
  check (char_length(alias) between 3 and 15);

drop index if exists credentials_email_normalised_key;
alter table credentials drop column if exists email_normalised;
alter table credentials drop column if exists email;
