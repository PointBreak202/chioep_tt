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

## Syllabus module

The Syllabus tab shows the units, course outcomes, practicals, and textbooks for each subject, plus a Download PDF button for the original document.

- Subject content lives in `src/data/syllabus/*.json`, one file per subject, shaped by the `Subject` type in `src/lib/syllabus/types.ts`.
- The original PDFs live in `public/syllabus/*.pdf` and are served as static files — nothing parses a PDF at request time.
- Which subjects a student sees is decided by `src/lib/syllabus/data.ts` (a branch/standing -> subject codes map), independent of the JSON files themselves so one subject JSON can be shared across branches.
- JSON is generated once from plain text via `src/lib/syllabus/parse.ts` (`parseSyllabusText`). To regenerate it from the checked-in fixtures:

  ```bash
  node --experimental-strip-types scripts/generate-syllabus-json.mts
  ```

- `src/lib/syllabus/service.ts` re-exports the read path and documents (but does not implement) the intended flow for a future admin PDF-upload feature — there is no admin auth yet, so no write path is wired up.

### Adding a new subject

1. Add a `scripts/syllabus-source/<name>.txt` fixture with the syllabus text (headings: `Teaching Scheme`, `Evaluation Scheme`, `Course Outcomes`, `Course Content`, `Textbooks`, `Reference Books`, `Web References`, `Laboratory Assignments`/`Suggested List of Assignments`).
2. Add its metadata (code, branch, standing, semester, credits, pdf path) to `SUBJECT_META` in `scripts/generate-syllabus-json.mts`.
3. Drop the source PDF in `public/syllabus/<code>.pdf`.
4. Run the generator command above.
5. Register the subject code under the right branch/standing in `CURRICULUM` in `src/lib/syllabus/data.ts`.
