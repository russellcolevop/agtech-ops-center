# CLAUDE.md — AgTech Founder Ops Center

## What this project is
A full-stack web app for AgTech founders. Built by Russell Cole. It's an ops/resource center with a dashboard, founder roadmap, glossary, document library, media directory, region-specific data, and a direct booking page.

## Who the owner is
Russell Cole (russellcolevop@gmail.com). Non-developer — explain commands before running them, ask before anything destructive, go one step at a time.

## Local setup
- **Working directory:** `~/Developer/founder-op-center/`
- **Original iCloud backup:** `~/Documents/DEV PROJECTS/Ops Center/outputs/agtech-ops-center/` — do not modify
- **GitHub repo:** https://github.com/russellcolevop/agtech-ops-center (branch: main)
- **Install:** `npm install --legacy-peer-deps` (peer dep conflict between nodemailer v6 and next-auth v4)
- **Run locally:** `npm run dev` → http://localhost:3000
- **Deploy:** Vercel (`vercel` CLI or push to main triggers auto-deploy if connected)

## Tech stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js v4 — Google OAuth + email magic link
- **Database:** Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Email:** Nodemailer (configured for Resend SMTP)

## Environment variables
Stored in `.env.local` (not committed). See `.env.example` for required keys:
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `EMAIL_SERVER_*` (Resend SMTP)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Where content lives
All site content is in `data/content.ts` — stats, trends, glossary terms, etc. Edit there, save, redeploy.

## Project structure
```
app/
  (auth)/login/         # Login page
  (dashboard)/          # All main pages
    layout.tsx          # Sidebar + header
    page.tsx            # Global AgTech Overview
    founders-journey/   # 6-stage founder roadmap
    glossary/           # Searchable glossary
    documents/          # Template library
    media/              # Podcasts, newsletters, influencers
    ecosystem/          # Region ecosystem data
    industry-segments/  # Region segments
    crops/              # Region crops
    resources/          # Region resources
    book-a-call/        # Booking page (Russell's calendar)
  api/auth/             # NextAuth API handler
components/             # Reusable UI components
data/content.ts         # ← Primary content file
lib/                    # Auth + Supabase config
```

## Known issues / tech debt
- Next.js 14.2.5 has a known security vulnerability — needs upgrade (breaking change risk, handle carefully)
- `nodemailer` v6/v7 peer dep conflict with next-auth — use `--legacy-peer-deps` on install
- Junk folder `{app` exists in project root — likely a sandbox artifact, safe to delete when confirmed
