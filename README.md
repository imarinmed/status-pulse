# Status Pulse

Multi-tenant project status dashboard for InnoIT client verticals.

## Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui (Nova preset)
- Supabase Auth + PostgreSQL
- Render web service

## Getting Started

```bash
cd ~/Developer/S9/innoit/status-pulse
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values.

## Project Structure

- `app/` — Next.js App Router pages and layouts
- `components/ui/` — shadcn/ui components
- `lib/` — utilities and shared helpers
- `public/` — static assets
