# ForgeFit Mobile

This folder contains the Expo / React Native version of ForgeFit. It is designed as the native mobile app companion to the existing web app in the repository root.

## Planned MVP

- Email/password auth with Supabase
- Home dashboard for current program and recent progress
- Periodized workout generator with month, week, and day structure
- Workout tracker synced to the generated plan
- Exercise instruction page with video support

## Setup

1. Create a `.env` file from `.env.example`
2. Install dependencies
3. Run the mobile SQL schema in Supabase
4. Run the app with Expo

```bash
cp .env.example .env
npm install
npx expo start --tunnel
```

## Supabase Setup

Run [supabase/mobile_schema.sql](/C:/Users/OMEN/Documents/New%20project/supabase/mobile_schema.sql) in the Supabase SQL Editor before testing signed-in program sync. That file creates:

- `profiles`
- `exercise_library` and `exercise_media`
- `training_programs`
- `program_blocks`, `program_weeks`, `program_days`
- `planned_exercises`
- `workout_sessions`
- `set_logs`

It also:

- enables RLS for user-owned data
- auto-creates profile rows for new auth users
- seeds the starter exercise library used by the generator and video screens

## Current Build Phase

Phase 2 is now started in this folder:

- Expo Router app shell
- Auth screen and protected route groups
- Home dashboard
- Generator screen with periodized month/week/day preview
- Tracker screen tied to the generated plan
- Video instruction screen tied to planned exercises
- Supabase-backed training sync for active programs and set logs

## Current Testing Flow

1. Sign in or create an account
2. Generate a new program on the Generator tab
3. Confirm the program appears on Home
4. Open Tracker and log sets
5. Refresh the app or sign in on another device
6. Confirm the same program and logs load from Supabase

If you want to test without Supabase first, the app still falls back to local seeded data when no signed-in remote program exists.

## Common Commands

```bash
npm install
npm run start
npm run typecheck
```

## iPhone Testing

Expo Go is no longer the recommended path for this project. Use an Expo development build instead:

1. Install the Expo and EAS CLIs
2. Log in to Expo
3. Build an iOS development client
4. Install that build on your iPhone
5. Start the project locally and open it through the dev client instead of Expo Go

Typical commands:

```bash
npm install
npx expo install expo-dev-client
npx eas login
npx eas build:configure
npx eas build --platform ios --profile development
```

You will need an Apple Developer account before building to a physical iPhone or submitting to the App Store.

## Next Recommended Phases

1. Replace placeholder exercise videos with Supabase Storage assets and load them from `exercise_media`
2. Add real progress charts sourced from `set_logs` and body-metric history
3. Add onboarding and user profile questionnaires
4. Add deep-link based email confirmation and password reset flows
5. Add offline-first logging and later background sync
6. Move periodization generation to a backend function for cross-platform consistency
