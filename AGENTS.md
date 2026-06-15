# Status Pulse — Agent Guidelines

## Project Identity

- **Name:** Status Pulse
- **Repository:** https://github.com/imarinmed/status-pulse
- **Deployment:** https://status-pulse-f74h.onrender.com
- **Supabase project:** `uhaxvnhzuyqkckblxjrc` (us-east-1)
- **Render service:** `status-pulse` (`srv-d8nrbbernols73e3pqd0`)

## Tech Stack

- Next.js 15 App Router (TypeScript)
- Tailwind CSS + shadcn/ui
- Supabase SSR (`@supabase/ssr`)
- Render Node.js web service

## Agent Rules

1. **Environment variables.** Public Supabase variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are injected at Render runtime. They must never be committed to git; `.env.local` is for local development only.
2. **Database changes.** All schema changes must be recorded as SQL migrations in `supabase/migrations/`. After changing the schema, regenerate TypeScript types and update `src/lib/database.types.ts`.
3. **Seeding.** Use `scripts/generate-seed-sql.py` to rebuild seed SQL from local git logs and coverage XML. Generated seed files live in `supabase/`.
4. **Build verification.** Before pushing, run `npx tsc --noEmit` and `npm run build`.
5. **Documentation.** Update this file, `HEARTBEAT.md`, and `README.md` whenever deployment status, architecture, or operational procedures change.
6. **Heartbeat tracking.** `HEARTBEAT.md` is the source of truth for project status and next steps; keep it current after every material change.
