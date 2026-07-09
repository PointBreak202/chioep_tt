# COEP Timetable

A mobile-first timetable app for COEP students. Enter your MIS number, get your branch/division/batch auto-detected, and see your daily schedule.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Data currently supported

- CSE: Divisions 1-4 (SY)
- AIML: Division 1 (SY)

Other branches and years will be added as data becomes available. Timetable data lives in `src/data/timetables/*.json`; MIS-to-division mapping lives in `src/data/mis-mapping.json`.

## Deploying to Vercel

1. Push this repo to GitHub (if not already there).
2. Go to https://vercel.com/new and import the repo.
3. No environment variables are needed — this app has no backend, all data is static JSON and student profile data lives in the browser's localStorage.
4. Framework preset: Vercel should auto-detect Next.js. Leave build command as `npm run build`.
5. Deploy.

Every push to your main branch will auto-redeploy.

## Adding a new division or branch later

1. Add the branch code and division roll ranges to `src/data/mis-mapping.json`.
2. Add a new timetable JSON file under `src/data/timetables/`, following the existing schema (see any existing file, e.g. `cse-sy-1.json`).
3. Register it in `TIMETABLES` in `src/lib/timetable.ts`.
