// Core data model for the Syllabus module.
//
// Design notes:
// - Mirrors the branch/standing vocabulary already used in `lib/mis.ts` and
//   `lib/timetable.ts` (branchCode e.g. "CSE"/"AIML", standing e.g. "SY") so
//   the module composes with the existing student profile instead of
//   inventing a parallel one.
// - `standing` is left as `string` (not a union) on purpose: `mis-mapping.json`
//   already treats it as an open string ("SY" today, "FY"/"TY"/"BTech" later),
//   and the syllabus module should extend the same way with zero code changes
//   here — see `SUBJECT_INDEX` in `data.ts` for where new years get wired in.

/** A single outline entry, used for nested lab/practical breakdowns
 * (e.g. "1. Task 1" -> "a. Draw..." -> "i. Compiler"). Recursive so it can
 * represent arbitrarily deep numbering without a bespoke type per level. */
export interface OutlineItem {
  text: string;
  children?: OutlineItem[];
}

export interface CourseOutcome {
  id: string; // "CO1", "CO2", ...
  text: string;
}

export interface SyllabusUnit {
  title: string;
  hours?: number;
  topics: string; // kept as prose (matches source formatting) rather than
  // force-split into a topic array, so nothing is lost or reworded.
}

export interface Book {
  name: string;
  author?: string;
}

export interface WebReference {
  text: string;
  url?: string;
}

export interface LabAssignment {
  id: string;
  title: string;
  items: OutlineItem[];
}

export interface EvaluationComponent {
  label: string; // "Theory - MSE", "Laboratory - CIE", etc.
  marks: number;
}

/** Catch-all for headings the fixed schema doesn't anticipate (STEP 7:
 * "any additional heading" must be preserved, not dropped). */
export interface ExtraSection {
  heading: string;
  content: string[];
}

export interface TeachingScheme {
  lecturesPerWeek?: string;
  labPerWeek?: string;
  selfStudyPerWeek?: string;
  tutorialPerWeek?: string;
}

export interface Subject {
  code: string; // slug used for JSON filename, URL, and PDF filename
  name: string;
  category?: string; // e.g. "PCC", "PCC-02"
  branch: string[]; // branchCodes this subject applies to, e.g. ["CSE"]
  standing: string; // "SY", "FY", "TY", "BTech"
  semester?: number;
  credits?: number;

  teachingScheme?: TeachingScheme;
  evaluationScheme?: EvaluationComponent[];

  courseOutcomes: CourseOutcome[];
  units: SyllabusUnit[];
  selfStudy?: SyllabusUnit;

  practicals?: LabAssignment[];

  textbooks: Book[];
  referenceBooks: Book[];
  webReferences?: WebReference[];
  extraSections?: ExtraSection[];

  /** Path under /public, e.g. "/syllabus/PCC-PPL.pdf" */
  pdf: string;
}

/** Lightweight shape for list views — avoids shipping full unit/book content
 * to the subject list screen. */
export interface SubjectSummary {
  code: string;
  name: string;
  category?: string;
  credits?: number;
  unitCount: number;
}
