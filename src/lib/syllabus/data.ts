import type { Subject, SubjectSummary } from "./types";

import pccPpl from "@/data/syllabus/PCC-PPL.json";
import pcc02Mp from "@/data/syllabus/PCC02-MP.json";
import pccDsa from "@/data/syllabus/PCC-DSA.json";
import oec24015 from "@/data/syllabus/OEC-24015.json";
import pccDe from "@/data/syllabus/PCC-DE.json";
import pccPlp from "@/data/syllabus/PCC-PLP.json";
import pccDsct from "@/data/syllabus/PCC-DSCT.json";
import studentOec from "@/data/student-oec.json";

// Registry of every subject JSON currently available, keyed by subject code.
// Adding a subject later (STEP 9/12: admin upload writes a new JSON file
// here) means: drop the file in src/data/syllabus/, import it, add one line
// below. Nothing else in the module needs to change.
const SUBJECTS: Record<string, Subject> = {
  "PCC-PPL": pccPpl as Subject,
  "PCC02-MP": pcc02Mp as Subject,
  "PCC-DSA": pccDsa as Subject,
  "OEC-24015": oec24015 as Subject,
  "PCC-DE": pccDe as Subject,
  "PCC-PLP": pccPlp as Subject,
  "PCC-DSCT": pccDsct as Subject,
};

// Maps a student's (branch, standing) to the *compulsory* subject codes they
// should see. Kept separate from SUBJECTS so the same subject JSON can be
// shared across branches (e.g. PPL, Microprocessors, and DSA are common to
// CSE and AIML) without duplicating data, and so adding "FY" / "TY" / "BTech"
// later is just a new entry here, matching the extensibility note in
// README's "Adding a new division or branch later" section for timetables.
//
// Open Electives are deliberately NOT listed here: unlike PPL/Microprocessors/DSA,
// not every student in a branch takes the same elective (see
// src/data/student-oec.json — CSE/AIML SY students are split across 8
// different electives). An elective subject is shown only to the students
// who actually picked it, resolved via `getElectiveSubject` below rather
// than the branch/standing curriculum map.
const CURRICULUM: Record<string, Record<string, string[]>> = {
  CSE: {
    SY: ["PCC-PPL", "PCC02-MP", "PCC-DSA"],
  },
  // AIML's SY curriculum does NOT include Principles of Programming
  // Languages, Microprocessors, or Data Structures and Algorithms -- those
  // are CSE-only courses. AIML's own SY Sem-3 PCCs are Data Engineering,
  // Programming Language Paradigms, and Data Structures and Complexity
  // Theory (confirmed against the official AIML curriculum structure PDF).
  // This was previously pointed at the CSE codes by mistake; fixed here
  // alongside adding the AIML-specific subject data.
  AIML: {
    SY: ["PCC-DE", "PCC-PLP", "PCC-DSCT"],
  },
};

const OEC_TITLE_TO_CODE: Record<string, string> = {};
for (const subject of Object.values(SUBJECTS)) {
  if (subject.category === "OEC") {
    OEC_TITLE_TO_CODE[subject.name.toLowerCase()] = subject.code;
  }
}

export function getSubjectCodes(branch: string, standing: string): string[] {
  return CURRICULUM[branch]?.[standing] ?? [];
}

/** Resolves the subject code for a student's own Open Elective choice, if
 * we happen to have syllabus data for it. Most electives won't have data
 * yet — that's expected, not an error, so this returns null rather than
 * throwing when there's no match. */
export function getElectiveSubjectCode(mis: string): string | null {
  const title = (studentOec as Record<string, string>)[mis];
  if (!title) return null;
  return OEC_TITLE_TO_CODE[title.toLowerCase()] ?? null;
}

export function getSubjectSummaries(
  branch: string,
  standing: string,
  mis?: string
): SubjectSummary[] {
  const codes = [...getSubjectCodes(branch, standing)];

  if (mis) {
    const electiveCode = getElectiveSubjectCode(mis);
    if (electiveCode && !codes.includes(electiveCode)) {
      codes.push(electiveCode);
    }
  }

  return codes
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
