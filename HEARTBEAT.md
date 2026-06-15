# Status Pulse — Project Heartbeat

> Last updated: 2026-06-15

## Overview

Status Pulse is a lightweight contributor-impact dashboard for repositories tracked in Supabase. It surfaces commits, coverage snapshots, and per-author breakdowns, currently shaped as a focused Contributor Impact Report for the `@imarin` handle.

- **Product name:** Status Pulse (generic — no client branding in the UI)
- **Live dashboard:** https://status-pulse-f74h.onrender.com
- **Source:** https://github.com/imarinmed/status-pulse
- **Render service:** `status-pulse` (`srv-d8nrbbernols73e3pqd0`)
- **Supabase project:** `uhaxvnhzuyqkckblxjrc` (us-east-1)

## Current Status

| Area | Status | Notes |
|------|--------|-------|
| Deployment | Live | Render web service deployed and accessible |
| Dashboard UI | Active | Contributor Impact Report rendered server-side from Supabase |
| Seed data | Loaded | 90 commits + 1 coverage snapshot (CMC Metrics API 86.42%) |
| GitHub repo | Public | `imarinmed/status-pulse` |

## Latest Activity

- **2026-06-15 — SP-06** — Rebuilt the dashboard as a shadcn-native, dark **Contributor Impact Report**. Five-section layout: top bar + title, `IdentityHero` (amber-ringed IM avatar, name, `@imarin` handle, role, data-driven tagline), four-up `ImpactMetric` row (imarin commits, repositories driven, share %, latest API coverage), two-up `RepoFocusCard` for `rdu-ai-cmc-metrics-api` and `rdu-ai-cmc-metrics-ui`, `ActivityTimeline` with imarin rows anchored by an amber side bar, and a mono footer. Single reserved accent: `amber-500` for every imarin-bound element; no other accent colors. Dropped the amber+violet ambient background, all client branding from the UI, and the duplicate `src/lib/database.types.ts`. `npx tsc --noEmit` and `npm run build` pass; pushed 4 atomic commits + this heartbeat update to `imarinmed/status-pulse`.
- **2026-06-15 — SP-05** — Shipped first imarin spotlight redesign (gradient hero, paired focus cards, highlighted commits table, dark default theme).
- **2026-06-15** — Created Render web service `status-pulse` and deployed from `main`.
- **2026-06-15** — Verified live URL returns HTTP 200 and renders dashboard data.
- **2026-06-15** — Updated README with deployment and environment details.

## Next Steps

1. Wire additional data sources: test runs, milestones, blockers, and heartbeat content.
2. Add a tenant/client selector and per-project views.
3. Implement auto-sync from GitHub Actions / coverage reports.
4. Secure Supabase RLS policies for multi-tenant data access.
5. Generalize the spotlight pattern into a per-author drill-down so any contributor can be promoted into a Contributor Impact Report.

## Blockers

None.
