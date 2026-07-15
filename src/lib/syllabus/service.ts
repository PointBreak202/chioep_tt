// Read-only service layer for the Syllabus module (STEP 12).
//
// Today this just re-exports the static-JSON read path from `data.ts` — that
// part is real and used by the app. `ingestSyllabusPdf` below is a stub: it
// documents the shape a future admin-upload endpoint would fill in, without
// wiring up auth or a write path now (per the brief: "Do not implement
// authentication unless required. Simply keep the architecture ready.").
//
// When an admin panel exists, the intended flow is:
//   1. Admin uploads a PDF.
//   2. Route handler extracts layout-preserving text from it (e.g.
//      `pdftotext -layout`, or an equivalent Node PDF library).
//   3. `parseSyllabusText` (src/lib/syllabus/parse.ts) turns that text into
//      a `Subject`.
//   4. The PDF is saved under public/syllabus/<code>.pdf and the JSON under
//      src/data/syllabus/<code>.json, then registered in `data.ts`.
// Steps 3 is already implemented and unit-testable independent of the
// upload transport. Steps 2 and 4 are intentionally not built yet — there's
// no admin auth to gate them behind.

export {
  getSubject,
  getSubjectCodes,
  getSubjectSummaries,
  hasSyllabusData,
} from "./data";

export interface SyllabusIngestRequest {
  code: string;
  branch: string[];
  standing: string;
  semester?: number;
  credits?: number;
  /** Layout-preserving plain text already extracted from the uploaded PDF. */
  extractedText: string;
}

export interface SyllabusIngestResult {
  ok: boolean;
  reason?: string;
}

/**
 * Not yet wired to a route or storage — the write side of this module.
 * Left as a stub on purpose. See module doc comment above for the intended
 * flow once an admin panel exists.
 */
export async function ingestSyllabusPdf(
  request: SyllabusIngestRequest
): Promise<SyllabusIngestResult> {
  void request; // signature kept stable for when this is implemented
  return {
    ok: false,
    reason: "Admin upload is not implemented yet. Students have read-only access.",
  };
}
