# ForgeFit Workout Generator

ForgeFit is a full-stack workout generator built with Next.js App Router, Supabase, and Vercel deployment in mind. It lets users generate a tailored weekly training plan, save that plan in Supabase, and review recent saved workouts from the database.

## Stack

- Next.js 15 with the App Router
- React 19
- Supabase for persistence
- Vercel for deployment
- TypeScript and Zod for validation

## Features

- Personalized workout form for goals, fitness level, session length, training frequency, and equipment
- Server-side workout generation with input validation
- Supabase Auth with user-owned workout history
- Supabase-backed workout persistence
- Recent workout history panel
- Vercel-ready environment variable setup

## Local setup

1. Install Node.js 20 or newer.
2. Install dependencies:

```bash
npm install
```

3. Copy the example env file:

```bash
Copy-Item .env.example .env.local
```

4. Add your Supabase values to `.env.local`.
5. In Supabase Auth, enable Email provider for email/password sign-in.
6. If you keep email confirmation enabled, update the email confirmation template to use:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

7. Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor.
8. Start the app:

```bash
npm run dev
```

## Supabase setup

Create a new Supabase project and add the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- or `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a legacy fallback

This project uses Supabase Auth cookies and Row Level Security so each signed-in user can access only their own workouts.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repo into Vercel.
3. Add the same public Supabase environment variables in the Vercel project settings.
4. Deploy.

Vercel will detect Next.js automatically, build the app, and expose the API routes and frontend together.

## Step 14: Post-deploy improvements

Once the first deployment works, this is the phase where you make the app safer, more useful, and more production-ready.

- Authentication: add Supabase Auth so workouts belong to real users instead of a shared table view.
- Security: move from shared admin-style access patterns toward user-scoped access with Row Level Security policies.
- Better workout management: let users revisit, delete, and later edit saved workouts.
- Smarter programming: improve the workout engine with progression rules, deload weeks, and more exercise variety.
- Product polish: add loading states, success messaging, filters, and user history controls.

This repo already includes some of that polish now:

- Users can create accounts, sign in, and sign out from the dashboard.
- Workouts are stored with `user_id` ownership and protected by Supabase RLS policies.
- Saved workout history can be viewed again from the dashboard.
- Saved workouts can be deleted from the UI.
- Generated plans now show coaching tips directly in the main plan card.

## Project structure

- `app/` for pages, styling, and route handlers
- `components/` for the interactive dashboard UI
- `lib/` for shared types, workout generation, and Supabase utilities
- `supabase/` for the SQL schema
