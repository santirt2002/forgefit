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
5. Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor.
6. Start the app:

```bash
npm run dev
```

## Supabase setup

Create a new Supabase project and add the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

This project uses the service role key only in Next.js route handlers on the server to save and fetch workouts.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repo into Vercel.
3. Add the same three environment variables in the Vercel project settings.
4. Deploy.

Vercel will detect Next.js automatically, build the app, and expose the API routes and frontend together.

## Project structure

- `app/` for pages, styling, and route handlers
- `components/` for the interactive dashboard UI
- `lib/` for shared types, workout generation, and Supabase utilities
- `supabase/` for the SQL schema
