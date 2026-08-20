# COEP Timetable — Project Handoff

A mobile-first web app for COEP Technological University students (currently SY CSE + SY AIML) to check their timetable, syllabus, free rooms, faculty contacts, and coordinate free time with friends. No backend, no auth — everything is static JSON generated from real department PDFs/spreadsheets, resolved client-side from a student's MIS number.

This document exists so any LLM (or human) can pick this project up cold and keep building it correctly, without re-deriving context that took many sessions to build up.

---

## 1. Tech stack

- **Next.js 16** (App Router), React 19, TypeScript, strict mode
- **Tailwind CSS v4** (CSS-first config, no `tailwind.config.js`)
- **Lucide React** for icons
- No database, no auth, no external APIs. All data is bundled JSON, imported directly into components/libs.
- Deployed on **Vercel**. `npm run build` uses `next build --webpack` (Turbopack was avoided — see §9 Gotchas).
- Package manager: npm. No other dependencies beyond what's in `package.json` — every feature so far has been built without adding new packages.

## 2. Folder structure

```
src/
  app/                    Next.js App Router pages
    page.tsx              Root: onboarding (MIS entry) or redirect to /today
    today/page.tsx         Today tab: greeting, current class, upcoming classes, todos
    week/page.tsx          Week tab: day tabs + compact agenda, swipe gestures
    rooms/page.tsx          Free lecture-hall finder (NOT in bottom nav anymore, still routable)
    meet/page.tsx           Compare free time with other students
    syllabus/page.tsx       List of subjects for the student's branch/standing
    syllabus/[code]/page.tsx  Syllabus detail (units, CO, textbooks, PDF download)
    profile/page.tsx        Profile info, install button, faculty directory, reset MIS
    layout.tsx              Root layout: font, SplashScreen, ServiceWorkerRegister
    error.tsx / not-found.tsx  Themed error/404 pages
  components/
    layout/                AppShell (page wrapper + ambient glow), BottomNav
    onboarding/             MisEntryForm, ManualBatchPicker
    agenda/                 AgendaList (week view), CurrentClassCard, UpcomingClasses, DayTabs
    todo/                   TodoSection (general + per-subject todos), SubjectTodoModal
    faculty/                FacultyDirectory, FacultyAdvisorCard, FacultyCard, Toast
    meet/                   StudentSearch, SelectedStudents, MeetResults
    syllabus/               Accordion, BookList, OutlineList, SectionHeading
    SplashScreen.tsx, ServiceWorkerRegister.tsx, InstallButton.tsx
  lib/
    mis.ts                 MIS number -> branch/division/batch resolution (core parser)
    profile.ts              localStorage read/write for the resolved student profile
    useProfile.ts           Hook: redirects to "/" if no profile saved
    timetable.ts             Timetable data access + per-day agenda resolution (core engine)
    students.ts              Searchable student directory (built from resolveMis + name files)
    meet.ts                  Free-time comparison engine (interval math)
    rooms.ts                  Free lecture-hall computation
    greeting.ts               Personalized greeting resolution
    faculty.ts                 Faculty directory loader
    todos.ts / useTodos.ts      localStorage todo persistence + React hook
    syllabus/                 types.ts, data.ts (registry+curriculum), parse.ts (text->JSON parser), service.ts, index.ts
  data/
    mis-mapping.json           Division/batch roll-number ranges (CSE, AIML)
    timetables/*.json          One file per division: cse-sy-1..4.json, aiml-sy-1.json
    batch-rosters/aiml-1.json   Exact MIS->batch for AIML Div1 (roll math doesn't work there)
    student-names-{cse,aiml}.json      MIS -> first name (used for greetings)
    student-fullnames-{cse,aiml}.json  MIS -> full name (used for Meet search)
    student-oec.json            MIS -> chosen Open Elective title
    student-language.json        MIS -> chosen language
    student-honors-minor.json     MIS -> {kind: "Honours"|"Minor", title}
    elective-sessions.ts          Title -> real {room, faculty} for OE/Honours sessions we can resolve
    greeting-overrides.json        Two hardcoded custom greetings (friends of the developer)
    faculty-directory.json          Generated faculty directory (advisors + general list)
    syllabus/*.json                 Generated per-subject syllabus JSON (see §6)
scripts/
  generate-syllabus-json.mts        Build-time generator: text fixture -> syllabus JSON
  syllabus-source/*.txt             Hand-authored syllabus text fixtures (source of truth)
public/
  syllabus/*.pdf                    Original syllabus PDFs, served for download
  icon-*.png, manifest.json, sw.js  PWA assets + service worker
```

## 3. Design system

- **Theme**: dark, glassmorphic, purple accent. All tokens are CSS variables in `src/app/globals.css` (`--bg-base`, `--text-primary/secondary/tertiary`, `--accent`, `--accent-soft`, `--live-now`, `--danger`, etc.) — never hardcode colors in components, use the Tailwind classes that map to these (`text-text-secondary`, `bg-accent`, etc.)
- **`.glass`** utility class: translucent card background + blur, used for every card in the app
- **`.glass-strong`**: less transparent, used for the bottom nav and dropdowns
- **`.accordion-grid`** + **`.accordion-open`**: CSS-only accordion animation (grid-template-rows 0fr→1fr trick) — used by Faculty Directory, syllabus Accordion, and the search dropdown. Always render the wrapper unconditionally and toggle the class — conditionally mounting the wrapper breaks the animation (this bug happened once, now avoided).
- **Font**: Inter, loaded via `next/font/google`. This **requires internet access at build time** — fine on Vercel, but any sandboxed build-and-test environment without internet to fonts.googleapis.com will fail `next build` on this specifically. Workaround used throughout this project: temporarily strip the font import, confirm the rest of the build succeeds, then restore it.
- **Bottom nav**: Today, Week, Meet, Syllabus, Profile (5 tabs). Rooms was removed from the nav (see §7) but the route still exists.
- Mobile-first, works down to ~320px width. Splash screen lives in the root layout (not a page) so it survives client-side navigation on first load.

## 4. Core data flow (how a student sees their timetable)

1. Student enters their **9-digit MIS number** on first visit (`MisEntryForm`).
2. `lib/mis.ts` → `resolveMis(mis)` parses it:
   - Format: `61` (constant) + `YY` (admission year, `25` = SY currently) + `BB` (branch code: `15`=CSE, `72`=AIML) + `RRR` (roll number)
   - Looks up `mis-mapping.json` to find which division the roll falls in, then which batch within that division
   - For AIML, roll-arithmetic batch assignment doesn't work reliably (real gaps in the roster), so AIML Div1 batch is resolved via an exact roster lookup (`batch-rosters/aiml-1.json`) first, falling back to the manual picker if not found
   - Returns `{ branchCode, branchName, division, batchLabel, needsManualBatch }`
3. Result saved to `localStorage` via `lib/profile.ts`. Every page uses `useRequireProfile()` to read it back and redirect to `/` if missing.
4. `lib/timetable.ts` → `getTimetable(branchCode, division)` loads the right JSON from `data/timetables/`, and `resolveDayAgenda(timetable, day, batchLabel, mis)` turns the raw schedule into a flat list of `AgendaItem`s for one day, personalizing:
   - **Open Elective (OE)** slot → real subject name from `student-oec.json` (+ real room/faculty if in `elective-sessions.ts`, currently none since no student has a resolvable section — see §7)
   - **Language (LL)** slot → real language from `student-language.json`
   - **Honours/Minor (HM)** slot → real title from `student-honors-minor.json` (+ real room/faculty from `elective-sessions.ts` for "Making Sense of Data", the only one currently wired with 63 matching students) — students with no HM pick see the slot **omitted entirely**, not a generic placeholder
   - Every `AgendaItem` carries a `subjectKey` (the raw subject code, e.g. `"DSA"`) used to attach subject-specific todos

## 5. Timetable JSON schema (per division file)

```jsonc
{
  "division": "CSE-SY-3",
  "branch": "CSE",
  "standing": "SY",
  "confidence": "...",       // human-readable note on how this was verified
  "rooms": { "DBMSL": "DBMS Lab, 1st Floor, CSE Dept", ... },
  "faculty": { "MP": "Akshata Suryavanshi", ... },  // lecture-level faculty per subject code
  "subjectNames": { "MP": "Microprocessors", "OE": "Open Elective", "HM": "Honours/Minor", ... },
  "schedule": {
    "Mon": [
      { "start": "08:30", "end": "09:30", "type": "common", "subject": "ENTSP", "room": "NC-01" },
      { "start": "12:30", "end": "13:30", "type": "lunch" },
      { "start": "10:30", "end": "12:30", "type": "batchwise", "batches": {
          "SY3-S1": { "subject": "MP", "label": "MP Lab", "room": "ISL", "faculty": "Akshata Suryavanshi" },
          "SY3-S2": { "subject": "DSA", "label": "DSA Lab", "room": "PL" }
        } }
    ],
    "Tue": [...], "Wed": [...], "Thu": [...], "Fri": [...], "Sat": []
  }
}
```

Three slot `type`s: `"common"` (whole division/subset attends together — lectures, language, electives, honours), `"lunch"`, `"batchwise"` (per-lab-batch, only the batches listed have something; any batch not listed is simply free then). A batch entry's `faculty` field, if present, **overrides** the division-level `faculty[subject]` lookup — used when a lab's teacher differs from the lecture's teacher for the same subject (very common).

All 5 timetable files were extracted using `pdfplumber`'s table cell extraction on the actual department PDFs — **not** raw text extraction, which was tried early on and produced garbled, unreliable results (wrong times, merged cells misread). Every revision the department has issued (v1b → v3 → v4 → v6 so far) has been re-extracted this way and cross-checked against a real student's Google Calendar export at least once, which caught real bugs (see §7).

**v6 (effective 17 Aug 26)** brought real schedule changes, not just re-verification: lunch slot times shifted per-division (e.g. AIML Div1's Monday lunch is 11:30-12:30, while every other day/division is 12:30-13:30), several room codes changed (Div1 gained `NC-08` for Entrepreneurship), and CSE Div4's timetable now bakes two DSY batches directly into its grid (`SY4-S5(DSY)`, `SY4-S6(DSY)`, each with their own `MDCP` — Matrices/Diff. Calc/Probability — slot and lab rotation), modeled as extra keys in the existing `batchwise` slot type. CSE Div3's v6 timetable shows no DSY batch at all, contradicting the earlier assumption that Div3 and Div4 each had one. See the updated DSY note in `mis-mapping.json` and §7 below.

## 6. Syllabus module schema & architecture

Fully documented in the README's "Syllabus module" section, summarized here:

- **Source of truth**: hand-authored `.txt` fixtures in `scripts/syllabus-source/`, following a fixed heading convention (`Teaching Scheme`, `Evaluation Scheme`, `Course outcomes`, `Course content`, `Textbooks`, `Reference Books`, `Web references`, `Laboratory assignments`)
- **Generator**: `node --experimental-strip-types scripts/generate-syllabus-json.mts` parses every fixture via `lib/syllabus/parse.ts` and writes `data/syllabus/<code>.json`. Subject metadata (code, branch, standing, semester, credits, pdf path) lives in `SUBJECT_META` inside the generator script itself, not in the fixture text.
- **Compulsory vs. Elective subjects** — this distinction matters and was a real bug caught mid-project:
  - Compulsory (PPL, Microprocessors, DSA): every student in that branch/standing takes it → listed in `CURRICULUM` in `lib/syllabus/data.ts`, shown to everyone
  - Elective (Numerical Methods, one of 8 different OEC options): only ~26% of students take it → **NOT** in `CURRICULUM`. Instead, `getSubjectSummaries(branch, standing, mis)` cross-references the student's own `student-oec.json` entry by name and includes it only for them. Give an elective subject the category `"OEC"` (via `(OEC) Subject Name` in the fixture's title line) for this matching to work.
- `tsconfig.json` has `scripts` in its `exclude` — the generator script's explicit `.ts` import extensions are valid for Node's `--experimental-strip-types` but break the main app's `tsc --noEmit`/Next.js build if included.
- **AIML has its own SY Sem-3 PCCs, not CSE's under a similar name**: Data Engineering (`PCC-DE`), Programming Language Paradigms (`PCC-PLP`), and Data Structures and Complexity Theory (`PCC-DSCT`) — confirmed against the official AIML curriculum structure PDF. AIML does **not** take Microprocessors at all, and its "Programming Language Paradigms"/"Data Structures and Complexity Theory" are differently-scoped courses from CSE's "Principles of Programming Languages"/"Data Structures and Algorithms" (different teaching schemes, different content), not just renames. `CURRICULUM.AIML.SY` in `src/lib/syllabus/data.ts` previously pointed at the three CSE codes (`PCC-PPL`, `PCC02-MP`, `PCC-DSA`) by mistake — every AIML student was seeing CSE's Microprocessors/PPL/DSA syllabi instead of their own. Fixed by adding the three AIML-specific subject fixtures/JSON and repointing `CURRICULUM.AIML.SY` at them; the CSE-only fixtures had their `branch` metadata narrowed from `["CSE","AIML"]` to `["CSE"]` in `scripts/generate-syllabus-json.mts` accordingly. `OEC-24015` (Numerical Methods) legitimately stays `["CSE","AIML"]` since Open Electives are cross-branch by design.

## 7. Known data gaps (real, currently unresolved)

- **DSY students ("Direct Second Year" lateral entrants)**: per the v6 timetable, CSE Div4 has two DSY batches baked into its schedule (`SY4-S5(DSY)`, `SY4-S6(DSY)`), and AIML Div1 has one (`AIML-SY1-S6(DSY)`, already selectable via the manual batch picker). CSE Div3's v6 timetable has no DSY batch. None of the CSE DSY batches have known MIS/roll numbers, so those students still hit `roll_out_of_range` and can't use the app — CSE has no manual-picker fallback yet (unlike AIML-1).
- **CSE Div4's roll range is 5 students short**: `mis-mapping.json` has Div4 as rolls 328–421 (94 students), but the department's own count says 99. One real student (roll 422) is confirmed to fall outside this range and can't resolve. Never got a corrected range.
- **Data Analytics (Open Elective)**: runs as 3 parallel sections (OE1/OE2/OE3, different room+teacher each) but there's no roster mapping which student attends which section — `OEC_SESSIONS` in `elective-sessions.ts` is deliberately empty. Not currently blocking anyone (0 known students picked this elective), but the gap exists structurally.
- **IDP (Interdisciplinary Project, "Fundamentals of Software Engineering")**: doesn't correspond to any slot type the app currently models at all (not OE, not HM, nothing), and there's no per-student IDP enrollment data. Any student taking this won't see it anywhere in the app.
- **Hon-FICT and Hon-IGAI** (the other two Honours options besides "Making Sense of Data"): room/faculty data exists in `elective-sessions.ts` but currently 0 known students have those exact titles in `student-honors-minor.json`, so it's unused but ready.
- **AIML batch roster** (`batch-rosters/aiml-1.json`) only has ~97 of the ~114+ actual AIML Div1 students — the rest fall back to the manual batch picker on first login.
- Metallurgy and Mechanical branches are recognized by MIS parsing (`mis-mapping.json` has their branch codes) but explicitly marked unsupported — students from those branches get a clear "not supported yet" message, not a crash.

## 8. Feature-by-feature summary (roughly chronological)

1. **Scaffold**: Next.js + Tailwind + dark glassy purple theme, bottom nav shell
2. **MIS lookup**: onboarding flow, `resolveMis`, manual batch picker fallback
3. **Today agenda view**: time-rail style list (later replaced, see #16), live "now" indicator
4. **Deployment prep**: error/404 pages, PWA manifest + icons, `tsconfig`/`package.json` hygiene
5. **Week view**: day tabs, swipeable, compact agenda
6. **Personalized greeting**: "Hey [Name], here's your schedule" with two hardcoded custom overrides
7. **Timetable data corrections**: multiple rounds as the department reissued official PDFs (v1b→v3→v4→v6) and corrected batch/division ranges — always re-extracted with `pdfplumber`, never guessed
8. **Room/faculty display on every slot** (not just labs)
9. **Offline support** (service worker, network-first with cache fallback) + **Free Room Finder** (lecture halls only, labs excluded on request) + **readability polish** + **branded splash screen**
10. **Install-to-homescreen button** (`beforeinstallprompt` API, Chromium-only, gracefully absent on iOS)
11. **Personalized Open Elective / Language / Honours-Minor** display, sourced from a real elective-allotment spreadsheet
12. **Faculty Directory**: collapsible section on Profile, advisors pinned first, data cross-referenced from 3 separate real sources (timetable legends, advisor office order PDF, college-wide contacts PDF)
13. **Syllabus module**: merged in from a collaborator's parallel branch (PPL, Microprocessors), later extended with Numerical Methods (elective) and DSA (compulsory), then with AIML's own SY Sem-3 PCCs (Data Engineering, Programming Language Paradigms, Data Structures and Complexity Theory) — see §9 for the CSE/AIML mix-up this also fixed
14. **Meet feature**: replaces Rooms in the nav (Rooms route still exists, just unlinked); search students by name/MIS, compare free time using interval-merge/invert/intersect math reusing the existing timetable resolver, ranked common slots for today + tomorrow
15. **Elective/Honours session personalization**: real room+faculty for students whose OE/HM title matches known session data (see §7 for what's still a placeholder)
16. **Merge with a second collaborator's branch**: To-do system (general + per-subject, localStorage-based) and a Today-page redesign (Current Class card + Upcoming Classes list, replacing the old flat timeline)

## 9. Development gotchas worth knowing

- **Font build failures in sandboxed/offline environments**: `next build` fails if it can't reach `fonts.googleapis.com`. Not a real bug — Vercel always has internet. If testing a build somewhere offline, temporarily comment out the `Inter` import and `className={inter.variable}` (replace with `className={""}`), confirm the rest of the build succeeds, then restore.
- **Windows + Turbopack**: native bindings can fail to load on Windows (`next-swc.win32-x64-msvc.node is not a valid Win32 application`), especially if the project sits inside a synced OneDrive folder. Fix: `package.json` scripts already force `next dev --webpack` / `next build --webpack` to sidestep this. If it recurs, try moving the project outside any synced folder.
- **`setState` inside `useEffect` without a dependency, run unconditionally on mount** trips a lint rule (caught twice — `useProfile.ts` and `InstallButton.tsx`). Fix pattern used throughout: compute the initial value via a **lazy `useState(() => ...)` initializer** instead, so the effect only handles side effects (like `router.replace`), not state derivation.
- **CSS accordion bug**: the accordion wrapper (`.accordion-grid`) must always render, with `.accordion-open` toggled by class — conditionally mounting the wrapper (`{open && <div className="accordion-grid accordion-open">}`) skips the transition entirely since it mounts already-open.
- **PDF text extraction is unreliable for timetables**: always use `pdfplumber`'s `page.find_tables()` → `.extract()` for the department's timetable PDFs, never plain text extraction — column/row structure gets scrambled otherwise and produces confidently-wrong times.

## 10. Deployment

- Vercel, auto-deploys on push to the connected repo's main branch
- No environment variables needed (no backend, no secrets)
- Build command: default (`npm run build`, which runs `next build --webpack`)

## 11. Data provenance (for trust/audit purposes)

- Student rosters (names, MIS): official CSE student list Excel + AIML batch-allocation PDF
- Timetables: official department timetable PDFs, re-issued 4 times so far (v1b, v3, v4, v6), each re-extracted from scratch
- Faculty directory: college-wide contacts PDF + Provisional Faculty Advisor office order PDF + timetable legends, cross-referenced by name/phone
- Elective/Language/Honours choices: official SY/TY UG Elective Courses Allotment spreadsheet
- Syllabi: official per-subject syllabus PDFs from the Board of Studies

---

*This file should be kept up to date as the project evolves — treat it as living documentation, not a one-time snapshot.*
