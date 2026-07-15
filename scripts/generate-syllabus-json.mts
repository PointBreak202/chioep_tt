// One-time build-time generator. Run with:
//   node --experimental-strip-types scripts/generate-syllabus-json.mts
//
// Reads plain-text syllabus fixtures from scripts/syllabus-source/*.txt
// (produced once from the source PDFs, e.g. via `pdftotext -layout`) and
// writes structured JSON to src/data/syllabus/*.json using the same parser
// that a future admin-upload flow would reuse. The PDFs themselves live in
// public/syllabus/ and are served as-is for the Download button — nothing
// here parses a PDF at request time.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseSyllabusText } from "../src/lib/syllabus/parse.ts";
import type { SyllabusMeta } from "../src/lib/syllabus/parse.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = join(__dirname, "syllabus-source");
const OUTPUT_DIR = join(__dirname, "..", "src", "data", "syllabus");

// Metadata per fixture file — the parser infers name/category/units/etc.
// from the text itself, but branch/standing/semester/credits/pdf path are
// catalog decisions that don't live inside the syllabus document.
const SUBJECT_META: Record<string, SyllabusMeta> = {
  "ppl.txt": {
    code: "PCC-PPL",
    branch: ["CSE", "AIML"],
    standing: "SY",
    semester: 3,
    credits: 3,
    pdf: "/syllabus/PCC-PPL.pdf",
  },
  "microprocessors.txt": {
    code: "PCC02-MP",
    branch: ["CSE", "AIML"],
    standing: "SY",
    semester: 3,
    credits: 3,
    pdf: "/syllabus/PCC02-MP.pdf",
  },
};

mkdirSync(OUTPUT_DIR, { recursive: true });

const files = readdirSync(SOURCE_DIR).filter((f) => f.endsWith(".txt"));
for (const file of files) {
  const meta = SUBJECT_META[file];
  if (!meta) {
    console.warn(`No metadata registered for ${file}, skipping.`);
    continue;
  }
  const raw = readFileSync(join(SOURCE_DIR, file), "utf-8");
  const subject = parseSyllabusText(raw, meta);
  const outPath = join(OUTPUT_DIR, `${meta.code}.json`);
  writeFileSync(outPath, JSON.stringify(subject, null, 2) + "\n", "utf-8");
  console.log(`Wrote ${outPath}`);
}
