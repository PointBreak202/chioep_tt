import { getTimetable, resolveDayAgenda, DAY_KEYS, type DayKey } from "./timetable";

export interface ComparisonStudent {
  mis: string;
  branchCode: string;
  division: number;
  batchLabel: string | null;
}

export interface FreeSlot {
  start: string;
  end: string;
  durationMinutes: number;
}

const DAY_START = "08:30";
const DAY_END = "18:30";
const BUSY_KINDS = new Set(["class", "lab", "unverified"]);

type Interval = [number, number];

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toTimeStr(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged: Interval[] = [sorted[0]];
  for (const [s, e] of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (s <= last[1]) {
      last[1] = Math.max(last[1], e);
    } else {
      merged.push([s, e]);
    }
  }
  return merged;
}

function invertIntervals(busy: Interval[], dayStart: number, dayEnd: number): Interval[] {
  const free: Interval[] = [];
  let cursor = dayStart;
  for (const [s, e] of busy) {
    if (s > cursor) free.push([cursor, Math.min(s, dayEnd)]);
    cursor = Math.max(cursor, e);
  }
  if (cursor < dayEnd) free.push([cursor, dayEnd]);
  return free;
}

function intersectIntervalLists(a: Interval[], b: Interval[]): Interval[] {
  const result: Interval[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const start = Math.max(a[i][0], b[j][0]);
    const end = Math.min(a[i][1], b[j][1]);
    if (start < end) result.push([start, end]);
    if (a[i][1] < b[j][1]) i++;
    else j++;
  }
  return result;
}

function getFreeIntervalsForStudent(student: ComparisonStudent, day: DayKey): Interval[] {
  const timetable = getTimetable(student.branchCode, student.division);
  const dayStart = toMinutes(DAY_START);
  const dayEnd = toMinutes(DAY_END);

  if (!timetable) return [[dayStart, dayEnd]];

  const agenda = resolveDayAgenda(timetable, day, student.batchLabel, student.mis);
  const busy = agenda
    .filter((item) => BUSY_KINDS.has(item.kind))
    .map((item): Interval => [toMinutes(item.start), toMinutes(item.end)]);

  return invertIntervals(mergeIntervals(busy), dayStart, dayEnd);
}

export function findCommonFreeSlots(
  students: ComparisonStudent[],
  day: DayKey,
  minDurationMinutes = 30
): FreeSlot[] {
  let common: Interval[] | null = null;

  for (const student of students) {
    const free = getFreeIntervalsForStudent(student, day);
    common = common === null ? free : intersectIntervalLists(common, free);
    if (common.length === 0) break;
  }

  return (common ?? [])
    .filter(([s, e]) => e - s >= minDurationMinutes)
    .map(([s, e]) => ({ start: toTimeStr(s), end: toTimeStr(e), durationMinutes: e - s }))
    .sort((a, b) => b.durationMinutes - a.durationMinutes);
}

export function getTomorrowDayKey(today: DayKey): DayKey {
  const idx = DAY_KEYS.indexOf(today);
  return DAY_KEYS[(idx + 1) % DAY_KEYS.length];
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hour${h > 1 ? "s" : ""}`;
  return `${h} hour${h > 1 ? "s" : ""} ${m} min`;
}
