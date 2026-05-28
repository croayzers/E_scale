-- Collaboration sessions: one record per shared editing session
create table if not exists public.collab_sessions (
  id                uuid        primary key default gen_random_uuid(),
  invite_token      text        unique not null default encode(gen_random_bytes(12), 'hex'),
  host_user_id      uuid        references auth.users(id) on delete cascade,
  host_display_name text        not null default 'Host',
  session_name      text,
  guest_role        text        not null default 'editor' check (guest_role in ('editor', 'viewer')),
  scene_snapshot    jsonb       not null default '[]'::jsonb,
  plan_snapshot     jsonb       not null default '{}'::jsonb,
  status            text        not null default 'active' check (status in ('active', 'ended', 'expired')),
  created_at        timestamptz not null default now(),
  expires_at        timestamptz not null default (now() + interval '24 hours')
);

-- Participants who have joined a session
create table if not exists public.collab_participants (
  id           uuid        primary key default gen_random_uuid(),
  session_id   uuid        not null references public.collab_sessions(id) on delete cascade,
  user_id      uuid        references auth.users(id) on delete set null,
  display_name text        not null,
  email        text,
  role         text        not null default 'editor' check (role in ('host', 'editor', 'viewer')),
  joined_at    timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists collab_sessions_token_idx       on public.collab_sessions(invite_token);
create index if not exists collab_sessions_host_idx        on public.collab_sessions(host_user_id);
create index if not exists collab_sessions_status_idx      on public.collab_sessions(status, expires_at);
create index if not exists collab_participants_session_idx on public.collab_participants(session_id);

alter table public.collab_sessions     enable row level security;
alter table public.collab_participants enable row level security;

-- Host can manage their own sessions; no auth required for anonymous hosts
create policy "host_own_sessions" on public.collab_sessions
  for all using (host_user_id = auth.uid() or host_user_id is null);

-- Active non-expired sessions are readable for token-based join (enforced at API level)
create policy "active_sessions_readable" on public.collab_sessions
  for select using (status = 'active' and expires_at > now());

-- Anyone can record themselves as a participant (open join)
create policy "anyone_can_join" on public.collab_participants
  for insert with check (true);

-- Participants can read co-participants of the same session; host sees all
create policy "participants_read" on public.collab_participants
  for select using (
    user_id = auth.uid() or
    exists (
      select 1 from public.collab_sessions s
      where s.id = session_id and s.host_user_id = auth.uid()
    )
  );

create policy "participants_update_own" on public.collab_participants
  for update using (user_id = auth.uid());
