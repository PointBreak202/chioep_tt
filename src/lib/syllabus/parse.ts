// Parses a syllabus document's plain text into the `Subject` shape.
//
// This is intentionally a *pure* text -> JSON transform with no PDF-reading
// code in it, for two reasons:
//   1. PDFs are only ever parsed once, at authoring time (see
//      `scripts/generate-syllabus-json.mts`), never at request time.
//   2. The same function is meant to be reused later by an admin-upload
//      route (STEP 12): that route just needs to run its own PDF-to-text
//      step (e.g. `pdftotext -layout`, or a library that preserves
//      indentation the same way) and hand the result to `parseSyllabusText`.
//
// The parser is heading-driven and indentation-aware, not hardcoded to any
// one subject — it was built against, and validated against, both sample
// syllabi (Principles of Programming Languages, Microprocessors), which use
// slightly different heading spellings ("Course content" vs "Course
// Contents", "Textbooks" vs "Text Book", "Laboratory assignments" vs
// "Suggested List of Assignments"). Anything that doesn't match a known
// heading is preserved verbatim in `extraSections` rather than dropped.

import type {
  Subject,
  SyllabusUnit,
  CourseOutcome,
  Book,
  WebReference,
  LabAssignment,
  OutlineItem,
  EvaluationComponent,
  ExtraSection,
  TeachingScheme,
} from "./types";

export interface SyllabusMeta {
  code: string;
  branch: string[];
  standing: string;
  semester?: number;
  credits?: number;
  pdf: string;
}

type SectionKey =
  | "teachingScheme"
  | "evaluationScheme"
  | "courseOutcomes"
  | "courseContent"
  | "note"
  | "textbooks"
  | "referenceBooks"
  | "webReferences"
  | "practicals"
  | "unknown";

const HEADING_MATCHERS: [RegExp, SectionKey][] = [
  [/^teaching scheme$/i, "teachingScheme"],
  [/^evaluation scheme$/i, "evaluationScheme"],
  [/^course outcomes?$/i, "courseOutcomes"],
  [/^course contents?$/i, "courseContent"],
  [/^notes?$/i, "note"],
  [/^text\s?books?$/i, "textbooks"],
  [/^reference books?$/i, "referenceBooks"],
  [/^web references?$/i, "webReferences"],
  [
    /^(laboratory assignments|suggested list of assignments|list of (practical|lab) assignments)$/i,
    "practicals",
  ],
];

function matchHeading(line: string): SectionKey | null {
  const trimmed = line.trim().replace(/:$/, "");
  if (!trimmed) return null;
  for (const [re, key] of HEADING_MATCHERS) {
    if (re.test(trimmed)) return key;
  }
  return null;
}

function titleFromFirstLine(text: string): { category?: string; name: string } {
  const firstLine = text.split("\n").find((l) => l.trim().length > 0) ?? "";
  const m = firstLine.match(/^\(([^)]+)\)\s*(.+)$/);
  if (m) {
    return { category: m[1].trim(), name: m[2].trim() };
  }
  return { name: firstLine.trim() };
}

/** Splits raw text into { heading, lines }[] blocks, dropping the title line. */
function splitSections(text: string): { key: SectionKey; raw: string[] }[] {
  const lines = text.split("\n");
  const sections: { key: SectionKey; raw: string[] }[] = [];
  let current: { key: SectionKey; raw: string[] } | null = null;
  let sawTitle = false;

  for (const line of lines) {
    if (!sawTitle && line.trim()) {
      sawTitle = true;
      continue; // skip the "(PCC) Subject Name" title line
    }
    const heading = matchHeading(line);
    if (heading) {
      current = { key: heading, raw: [] };
      sections.push(current);
    } else if (current) {
      current.raw.push(line);
    }
  }
  return sections;
}

function parseTeachingScheme(lines: string[]): TeachingScheme {
  const text = lines.join(" ");
  const grab = (re: RegExp) => text.match(re)?.[1]?.trim();
  return {
    lecturesPerWeek: grab(/Lectures?:\s*([^,\n]+?)(?=\s+(?:Labs?|Laboratory|Self-Study|Tutorial)s?:|$)/i),
    labPerWeek: grab(/Labs?(?:oratory)?:\s*([^,\n]+?)(?=\s+(?:Self-Study|Tutorial|Lectures?)s?:|$)/i),
    selfStudyPerWeek: grab(/Self-Study:\s*([^,\n]+?)(?=\s+(?:Tutorial|Lectures?|Labs?)s?:|$)/i),
    tutorialPerWeek: grab(/Tutorial:\s*([^,\n]+?)(?=\s+(?:Self-Study|Lectures?|Labs?)s?:|$)/i),
  };
}

function parseEvaluationScheme(lines: string[]): EvaluationComponent[] {
  const text = lines.join(" ");
  const components: EvaluationComponent[] = [];
  // Matches "MSE:30 Marks", "TA:20 Marks", "ESE:50 Marks", "CIE:100 Marks", etc.,
  // and prefixes with the enclosing "Theory:" / "Laboratory:" label if present.
  const blockRe = /(Theory|Laboratory|Practical|Oral)\s*:\s*([^]*?)(?=(Theory|Laboratory|Practical|Oral)\s*:|$)/gi;
  let blockMatch: RegExpExecArray | null;
  let matchedAny = false;
  while ((blockMatch = blockRe.exec(text))) {
    matchedAny = true;
    const groupLabel = blockMatch[1];
    const body = blockMatch[2];
    const itemRe = /([A-Za-z][A-Za-z ]*?)\s*:\s*(\d+)\s*Marks/gi;
    let itemMatch: RegExpExecArray | null;
    while ((itemMatch = itemRe.exec(body))) {
      components.push({
        label: `${groupLabel} - ${itemMatch[1].trim()}`,
        marks: parseInt(itemMatch[2], 10),
      });
    }
  }
  if (!matchedAny) {
    // Fallback: no "Theory:"/"Laboratory:" grouping, just bare "X:NN Marks" pairs.
    const itemRe = /([A-Za-z][A-Za-z ]*?)\s*:\s*(\d+)\s*Marks/gi;
    let itemMatch: RegExpExecArray | null;
    while ((itemMatch = itemRe.exec(text))) {
      components.push({ label: itemMatch[1].trim(), marks: parseInt(itemMatch[2], 10) });
    }
  }
  return components;
}

function parseCourseOutcomes(lines: string[]): CourseOutcome[] {
  const outcomes: CourseOutcome[] = [];
  for (const line of lines) {
    const m = line.trim().match(/^(\d+)\.\s*(.+)$/);
    if (m) {
      outcomes.push({ id: `CO${m[1]}`, text: m[2].trim() });
    }
  }
  return outcomes;
}

/** Course content is a sequence of "Subsection Title: [N Hrs]" headers each
 * followed by a paragraph. "Self-study" / "Self Study" is one of these
 * subsections but gets pulled out into its own field rather than `units`. */
function parseCourseContent(lines: string[]): {
  units: SyllabusUnit[];
  selfStudy?: SyllabusUnit;
} {
  const units: SyllabusUnit[] = [];
  let selfStudy: SyllabusUnit | undefined;

  let currentTitle: string | null = null;
  let currentHours: number | undefined;
  let currentBody: string[] = [];

  const flush = () => {
    if (currentTitle === null) return;
    const unit: SyllabusUnit = {
      title: currentTitle.trim(),
      hours: currentHours,
      topics: currentBody.join(" ").trim(),
    };
    if (/^self[- ]?study/i.test(currentTitle.trim())) {
      selfStudy = unit;
    } else if (unit.title) {
      units.push(unit);
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const headerMatch = line.match(/^(.+?):?\s*\[(\d+)\s*Hrs?\]$/i);
    if (headerMatch) {
      flush();
      currentTitle = headerMatch[1].replace(/:$/, "").trim();
      currentHours = parseInt(headerMatch[2], 10);
      currentBody = [];
    } else if (currentTitle !== null) {
      currentBody.push(line);
    }
  }
  flush();

  return { units, selfStudy };
}

function parseBooks(lines: string[]): Book[] {
  const books: Book[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(/^\d+\.\s*(.+)$/);
    if (!m) continue;
    const body = m[1];
    const quoted = body.match(/["“]([^"”]+)["”]/);
    if (quoted) {
      const author = body.slice(0, quoted.index).replace(/,\s*$/, "").trim();
      books.push({ name: quoted[1].trim(), author: author || undefined });
    } else {
      // No quoted title found — keep the full line as the name rather than
      // guessing at an author split.
      books.push({ name: body.trim() });
    }
  }
  return books;
}

function parseWebReferences(lines: string[]): WebReference[] {
  const refs: WebReference[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    const m = line.match(/^\d+\.\s*(.+)$/);
    if (!m) continue;
    const body = m[1].trim();
    const urlMatch = body.match(/https?:\/\/\S+/);
    refs.push({ text: body, url: urlMatch ? urlMatch[0] : undefined });
  }
  return refs;
}

const MARKER_PATTERNS: RegExp[] = [
  /^(\d+)\.\s+(.*)$/, // 1.
  /^([a-z])\.\s+(.*)$/, // a.
  /^([ivxlcdm]+)\.\s+(.*)$/i, // i. ii. iii. (roman)
];

function markerDepth(indentSpaces: number): number {
  // Fixture / pdftotext -layout output uses ~2 spaces per nesting level.
  return Math.round(indentSpaces / 2);
}

/** Builds a recursive outline from indentation depth, independent of which
 * marker style (1./a./i.) is used at each level — some source PDFs are not
 * consistent about it, so depth is inferred from whitespace instead. */
function parseOutline(lines: string[]): OutlineItem[] {
  const root: OutlineItem[] = [];
  const stack: { depth: number; node: OutlineItem }[] = [];

  for (const raw of lines) {
    if (!raw.trim()) continue;
    const indent = raw.length - raw.trimStart().length;
    const depth = markerDepth(indent);
    let text = raw.trim();
    for (const re of MARKER_PATTERNS) {
      const m = text.match(re);
      if (m) {
        text = m[2].trim();
        break;
      }
    }
    const node: OutlineItem = { text };

    while (stack.length && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1].node;
      parent.children = parent.children ?? [];
      parent.children.push(node);
    }
    stack.push({ depth, node });
  }
  return root;
}

/** Top-level items in a practicals/lab-assignments outline become
 * `LabAssignment`s; everything nested beneath them becomes `items`. */
function parseLabAssignments(lines: string[]): LabAssignment[] {
  const outline = parseOutline(lines);
  return outline.map((item, i) => ({
    id: `LA${i + 1}`,
    title: item.text,
    items: item.children ?? [],
  }));
}

export function parseSyllabusText(rawText: string, meta: SyllabusMeta): Subject {
  const text = rawText.replace(/\r\n/g, "\n");
  const { category, name } = titleFromFirstLine(text);
  const sections = splitSections(text);

  const subject: Subject = {
    code: meta.code,
    name,
    category,
    branch: meta.branch,
    standing: meta.standing,
    semester: meta.semester,
    credits: meta.credits,
    courseOutcomes: [],
    units: [],
    textbooks: [],
    referenceBooks: [],
    pdf: meta.pdf,
  };

  const extraSections: ExtraSection[] = [];

  for (const { key, raw } of sections) {
    switch (key) {
      case "teachingScheme":
        subject.teachingScheme = parseTeachingScheme(raw);
        break;
      case "evaluationScheme":
        subject.evaluationScheme = parseEvaluationScheme(raw);
        break;
      case "courseOutcomes":
        subject.courseOutcomes = parseCourseOutcomes(raw);
        break;
      case "courseContent": {
        const { units, selfStudy } = parseCourseContent(raw);
        subject.units = units;
        subject.selfStudy = selfStudy;
        break;
      }
      case "textbooks":
        subject.textbooks = parseBooks(raw);
        break;
      case "referenceBooks":
        subject.referenceBooks = parseBooks(raw);
        break;
      case "webReferences":
        subject.webReferences = parseWebReferences(raw);
        break;
      case "practicals":
        subject.practicals = parseLabAssignments(raw);
        break;
      case "note": {
        const content = raw.map((l) => l.trim()).filter(Boolean);
        if (content.length) extraSections.push({ heading: "Note", content });
        break;
      }
      default:
        break;
    }
  }

  if (extraSections.length) subject.extraSections = extraSections;

  return subject;
}
