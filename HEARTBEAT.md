# Status Pulse — Project Heartbeat

> Last updated: 2026-06-15

## Overview

Status Pulse is a lightweight project-control dashboard for InnoIT client engagements. It surfaces commits, test runs, coverage snapshots, milestones, blockers, and heartbeat records from a Supabase backend.

- **Tenant:** InnoIT
- **Primary client:** Alexion (AstraZeneca subsidiary)
- **Live dashboard:** https://status-pulse-f74h.onrender.com
- **Source:** https://github.com/imarinmed/status-pulse
- **Render service:** `status-pulse` (`srv-d8nrbbernols73e3pqd0`)
- **Supabase project:** `uhaxvnhzuyqkckblxjrc` (us-east-1)

## Current Status

| Area | Status | Notes |
|------|--------|-------|
| Deployment | Live | Render web service deployed and accessible |
| Dashboard UI | Active | Server-rendered Next.js page shows repos, commits, and coverage |
| Seed data | Loaded | 90 commits + 1 coverage snapshot (CMC Metrics API 86.42%) |
| GitHub repo | Public | `imarinmed/status-pulse` |

## Latest Activity

- **2026-06-15** — Shipped imarin spotlight redesign (SP-05): new `ImarinHero`, paired `RepoFocusCard` for the two CMC Metrics repos, and `RecentCommitsTable` with imarin rows highlighted via amber gradient + avatar + spotlight tag. Defaulted globals to dark theme with ambient amber/violet radial-gradient background. Verified live at https://status-pulse-f74h.onrender.com (HTTP 200, contains "Spotlight contributor", "Focus repositories", "imarin rows highlighted").
- **2026-06-15** — Created Render web service `status-pulse` and deployed from `main`.
- **2026-06-15** — Verified live URL returns HTTP 200 and renders dashboard data.
- **2026-06-15** — Updated README with deployment and environment details.

## Next Steps

1. Wire additional data sources: test runs, milestones, blockers, and heartbeat content.
2. Add client/tenant selector and per-project views.
3. Implement auto-sync from GitHub Actions / coverage reports.
4. Secure Supabase RLS policies for multi-tenant data access.
5. Add a per-author drill-down view that reuses the imarin spotlight pattern for any contributor.

## Blockers

None.
