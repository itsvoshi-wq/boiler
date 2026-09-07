-- BOILER, PostgreSQL schema.
--
-- The chain is the source of truth for prices, balances, liquidity, execution
-- and contract state. This database only ever holds things a chain cannot:
-- creator identity, published calls and their versions, derived track records,
-- and cached aggregates over windows too long to scan from an RPC on demand.
--
-- Not provisioned in this deployment. The application runs against an
-- in-process store and says so on The Books.

create table if not exists users (
  address        text primary key,
  first_seen_at  timestamptz not null default now(),
  referred_by    text references brokers(code)
);

create table if not exists creators (
  address        text primary key,
  display_name   text not null,
  created_at     timestamptz not null default now()
);

create table if not exists desks (
  slug                  text primary key,
  creator_address       text not null references creators(address),
  name                  text not null,
  mandate               text not null,
  bio                   text not null default '',
  creator_fee_bps       smallint not null default 10 check (creator_fee_bps between 0 and 50),
  live_since            timestamptz not null default now(),
  universe              text[] not null default '{}'
);

create table if not exists desk_followers (
  desk_slug   text not null references desks(slug) on delete cascade,
  address     text not null references users(address),
  followed_at timestamptz not null default now(),
  primary key (desk_slug, address)
);

-- A call is immutable once published. Edits create a new version row, and the
-- original stays. There is no update path on this table by design.
create table if not exists verified_calls (
  id               text primary key,
  desk_slug        text not null references desks(slug),
  symbol           text not null,
  base_token       text not null,
  direction        text not null check (direction in ('LONG','SHORT')),
  entry_reference  numeric(78, 30) not null,
  entry_block      bigint not null,
  published_at     timestamptz not null,
  expires_at       timestamptz,
  status           text not null check (status in ('LIVE','CLOSED','INVALIDATED','EXPIRED','PINK SLIPPED')),
  closed_at        timestamptz,
  close_reference  numeric(78, 30)
);

create table if not exists call_versions (
  call_id      text not null references verified_calls(id) on delete cascade,
  version      integer not null,
  published_at timestamptz not null,
  thesis       text not null,
  target       numeric(78, 30),
  invalidation numeric(78, 30),
  digest       text not null,
  primary key (call_id, version)
);

create table if not exists call_results (
  call_id       text primary key references verified_calls(id) on delete cascade,
  resolved_at   timestamptz not null,
  mark_price    numeric(78, 30),
  return_pct    numeric(18, 6),
  status        text not null,
  reason        text not null
);

create table if not exists strategies (
  id                 text primary key,
  desk_slug          text not null references desks(slug),
  name               text not null,
  universe           text[] not null,
  max_single_asset_pct numeric(6,2) not null,
  min_liquidity_quote numeric(24,2) not null,
  rebalance          text not null check (rebalance in ('DAILY','WEEKLY','MONTHLY')),
  profit_target_pct  numeric(6,2),
  max_drawdown_pct   numeric(6,2),
  version            integer not null default 1,
  forked_from        text references strategies(id)
);

create table if not exists market_events (
  id            bigserial primary key,
  block_number  bigint not null,
  tx_hash       text not null,
  log_index     integer not null,
  pool          text not null,
  kind          text not null,
  base_symbol   text,
  quote_amount  numeric(38, 10),
  taker         text,
  observed_at   timestamptz not null default now(),
  unique (tx_hash, log_index)
);
create index if not exists market_events_block_idx on market_events (block_number desc);
create index if not exists market_events_pool_idx on market_events (pool, block_number desc);

create table if not exists brokers (
  code               text primary key,
  address            text not null,
  tier               text not null default 'RUNNER',
  created_at         timestamptz not null default now()
);

create table if not exists broker_referrals (
  broker_code    text not null references brokers(code),
  address        text not null references users(address),
  referred_at    timestamptz not null default now(),
  primary key (broker_code, address)
);

-- Fees are recorded only when they are actually collected. There is no row for
-- a modelled fee, so this table cannot become a fake revenue chart.
create table if not exists protocol_revenue (
  id             bigserial primary key,
  tx_hash        text not null,
  block_number   bigint not null,
  token          text not null,
  amount         numeric(38, 18) not null,
  amount_usd     numeric(24, 6),
  desk_slug      text references desks(slug),
  broker_code    text references brokers(code),
  collected_at   timestamptz not null default now(),
  unique (tx_hash)
);

create table if not exists revenue_allocations (
  id            bigserial primary key,
  effective_from timestamptz not null,
  destination   text not null,
  bps           smallint not null check (bps >= 0),
  set_by        text not null,
  tx_hash       text
);

create table if not exists buybacks (
  id            bigserial primary key,
  tx_hash       text not null unique,
  spent_usd     numeric(24,6) not null,
  boil_acquired numeric(38,18) not null,
  executed_at   timestamptz not null
);

create table if not exists burns (
  id          bigserial primary key,
  tx_hash     text not null unique,
  amount      numeric(38,18) not null,
  burned_at   timestamptz not null
);

create table if not exists staking_cache (
  address       text primary key,
  amount        numeric(38,18) not null,
  tier          text not null,
  locked_until  timestamptz,
  refreshed_at  timestamptz not null default now()
);

create table if not exists leaderboard_snapshots (
  id           bigserial primary key,
  board        text not null,
  taken_at     timestamptz not null default now(),
  rows         jsonb not null,
  method       text not null
);

-- Rolling aggregates, so a 24h figure can be built up honestly over time
-- instead of extrapolated from a five minute scan.
create table if not exists volume_samples (
  id           bigserial primary key,
  observed_at  timestamptz not null default now(),
  from_block   bigint not null,
  to_block     bigint not null,
  volume_usd   numeric(24,6) not null,
  trades       integer not null
);
create index if not exists volume_samples_time_idx on volume_samples (observed_at desc);
