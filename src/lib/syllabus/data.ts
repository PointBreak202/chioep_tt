import type { Subject, SubjectSummary } from "./types";

import pccPpl from "@/data/syllabus/PCC-PPL.json";
import pcc02Mp from "@/data/syllabus/PCC02-MP.json";

// Registry of every subject JSON currently available, keyed by subject code.
// Adding a subject later (STEP 9/12: admin upload writes a new JSON file
// here) means: drop the file in src/data/syllabus/, import it, add one line
// below. Nothing else in the module needs to change.
const SUBJECTS: Record<string, Subject> = {
  "PCC-PPL": pccPpl as Subject,
  "PCC02-MP": pcc02Mp as Subject,
};

// Maps a student's (branch, standing) to the subject codes they should see.
// Kept separate from SUBJECTS so the same subject JSON can be shared across
// branches (e.g. PPL and Microprocessors are common to CSE and AIML) without
// duplicating data, and so adding "FY" / "TY" / "BTech" later is just a new
// entries here, matching the extensibility note in README's "Adding a new
// division or branch later" section for timetables.
const CURRICULUM: Record<string, Record<string, string[]>> = {
  CSE: {
    SY: ["PCC-PPL", "PCC02-MP"],
  },
  AIML: {
    SY: ["PCC-PPL", "PCC02-MP"],
  },
};

export function getSubjectCodes(branch: string, standing: string): string[] {
  return CURRICULUM[branch]?.[standing] ?? [];
}

export function getSubjectSummaries(branch: string, standing: string): SubjectSummary[] {
  return getSubjectCodes(branch, standing)
    .map((code) => SUBJECTS[code])
    .filter((s): s is Subject => Boolean(s))
    .map((s) => ({
      code: s.code,
      name: s.name,
      category: s.category,
      credits: s.credits,
      unitCount: s.units.length,
    }));
}

export function getSubject(code: string): Subject | null {
  return SUBJECTS[code] ?? null;
}

export function hasSyllabusData(branch: string, standing: string): boolean {
  return getSubjectCodes(branch, standing).length > 0;
}
