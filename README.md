# AgTech Founder Ops Center

A full-stack web app for AgTech founders — built with Next.js 14, NextAuth.js, Supabase, and Tailwind CSS.

## Features

- 🔐 **Authentication** — Google OAuth + email magic link fallback
- 🌍 **Global Dashboard** — AgTech market stats, hotspots, trends, and opportunities
- 🚀 **Founder's Journey** — 6-stage roadmap from idea to Series A
- 📖 **Glossary** — Searchable AgTech terminology
- 📄 **Documents** — Template library
- 📡 **Media & Influencers** — Key podcasts, newsletters, and thought leaders
- 🗺️ **Region-Specific Data** — Ecosystem, segments, crops, and resources by country
- 📞 **Book a Call with Russell** — Direct booking page

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in each value in `.env.local`:

**NextAuth:**
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32` to generate
- `NEXTAUTH_URL` — set to your domain (e.g., `https://yourdomain.com`)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials → Create OAuth 2.0 Client
3. Add `http://localhost:3000/api/auth/callback/google` as authorized redirect URI
4. Copy Client ID and Secret

**Email (Magic Links):**
- Recommended: [Resend](https://resend.com) — free tier, easy setup
- Set `EMAIL_SERVER_HOST=smtp.resend.com`, port `465`, user `resend`, password = your Resend API key

**Supabase:**
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your URL and keys
3. Run the NextAuth Supabase adapter migration (see below)

### 3. Set up Supabase schema

Run this in your Supabase SQL editor (required for NextAuth adapter):

```sql
create table accounts (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid not null,
  type text not null,
  provider text not null,
  provider_account_id text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  unique(provider, provider_account_id)
);

create table sessions (
  id uuid not null default uuid_generate_v4() primary key,
  session_token text not null unique,
  user_id uuid not null,
  expires timestamptz not null
);

create table users (
  id uuid not null default uuid_generate_v4() primary key,
  name text,
  email text unique,
  email_verified timestamptz,
  image text
);

create table verification_tokens (
  identifier text not null,
  token text not null unique,
  expires timestamptz not null,
  primary key (identifier, token)
);
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all environment variables in Vercel dashboard → Settings → Environment Variables.

## Updating Content

All site content lives in **`/data/content.ts`**. To update:

1. Open `data/content.ts` in any text editor
2. Edit the relevant arrays (stats, trends, glossary terms, etc.)
3. Save and redeploy

For a more powerful CMS, content can be moved to Supabase tables and managed via the Supabase dashboard or a custom admin panel.

## Project Structure

```
agtech-ops-center/
├── app/
│   ├── (auth)/login/         # Login page
│   ├── (dashboard)/          # All main pages
│   │   ├── layout.tsx        # Sidebar + header layout
│   │   ├── page.tsx          # Global AgTech Overview
│   │   ├── founders-journey/ # Founder roadmap
│   │   ├── glossary/         # Searchable glossary
│   │   ├── documents/        # Document library
│   │   ├── media/            # Media & influencers
│   │   ├── ecosystem/        # Region ecosystem
│   │   ├── industry-segments/# Region segments
│   │   ├── crops/            # Region crops
│   │   ├── resources/        # Region resources
│   │   └── book-a-call/      # Booking page
│   └── api/auth/             # NextAuth handler
├── components/               # Reusable UI components
├── data/content.ts           # ← Edit content here
├── lib/                      # Auth + Supabase config
└── tailwind.config.ts        # Theme/colors
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js v4 (Google + Email)
- **Database:** Supabase (PostgreSQL)
- **Language:** TypeScript
- **Deployment:** Vercel (recommended)
