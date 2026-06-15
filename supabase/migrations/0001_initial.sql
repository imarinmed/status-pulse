create table tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand_primary text,
  brand_secondary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  slug text not null,
  name text not null,
  sector text,
  description text,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id, slug)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  slug text not null,
  name text not null,
  status text not null default 'active',
  description text,
  source_path text,
  repo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(client_id, slug)
);

create table repos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  slug text not null,
  name text not null,
  repo_path text,
  github_owner text,
  github_repo text,
  default_branch text default 'main',
  last_synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, slug)
);

create table milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'not_started',
  start_date date,
  target_date date,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table blockers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  impact text,
  status text not null default 'open',
  opened_at timestamptz default now(),
  closed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table heartbeats (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  content text not null,
  source_path text,
  updated_at timestamptz,
  created_at timestamptz default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  repo_id uuid references repos(id) on delete set null,
  type text not null,
  title text not null,
  description text,
  metadata jsonb default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz default now()
);

create table commits (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid not null references repos(id) on delete cascade,
  sha text not null,
  message text not null,
  author_name text,
  author_email text,
  authored_at timestamptz not null,
  created_at timestamptz default now(),
  unique(repo_id, sha)
);

create table coverage_snapshots (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid not null references repos(id) on delete cascade,
  sha text,
  branch text,
  total_lines int,
  covered_lines int,
  coverage_pct numeric(5,2),
  collected_at timestamptz not null,
  created_at timestamptz default now()
);

create table test_runs (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid not null references repos(id) on delete cascade,
  sha text,
  branch text,
  status text,
  conclusion text,
  duration_ms int,
  run_number int,
  started_at timestamptz,
  created_at timestamptz default now()
);

create index idx_clients_tenant on clients(tenant_id);
create index idx_projects_client on projects(client_id);
create index idx_repos_project on repos(project_id);
create index idx_milestones_project on milestones(project_id);
create index idx_blockers_project on blockers(project_id);
create index idx_heartbeats_project on heartbeats(project_id);
create index idx_activities_project on activities(project_id);
create index idx_activities_occurred on activities(occurred_at desc);
create index idx_commits_repo on commits(repo_id);
create index idx_commits_authored on commits(authored_at desc);
create index idx_coverage_repo on coverage_snapshots(repo_id);
create index idx_test_runs_repo on test_runs(repo_id);

alter table tenants enable row level security;
alter table clients enable row level security;
alter table projects enable row level security;
alter table repos enable row level security;
alter table milestones enable row level security;
alter table blockers enable row level security;
alter table heartbeats enable row level security;
alter table activities enable row level security;
alter table commits enable row level security;
alter table coverage_snapshots enable row level security;
alter table test_runs enable row level security;

create policy tenant_read on tenants for select using (true);
create policy client_read on clients for select using (true);
create policy project_read on projects for select using (true);
create policy repo_read on repos for select using (true);
create policy milestone_read on milestones for select using (true);
create policy blocker_read on blockers for select using (true);
create policy heartbeat_read on heartbeats for select using (true);
create policy activity_read on activities for select using (true);
create policy commit_read on commits for select using (true);
create policy coverage_read on coverage_snapshots for select using (true);
create policy test_run_read on test_runs for select using (true);
