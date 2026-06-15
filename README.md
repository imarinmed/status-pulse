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

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase publishable anon key

## Deployment

Status Pulse is deployed as a Render web service.

- **Live URL:** `https://status-pulse-f74h.onrender.com`
- **Render service:** `status-pulse`
- **GitHub repo:** `https://github.com/imarinmed/status-pulse`
- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`

The Render service is configured with the public Supabase environment variables. No secrets are committed to the repository; `.env.local` is gitignored and used only for local development.

## Project Structure

- `app/` — Next.js App Router pages and layouts
- `components/ui/` — shadcn/ui components
- `lib/` — utilities and shared helpers
- `public/` — static assets
