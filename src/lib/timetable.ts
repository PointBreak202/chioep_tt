import cseSy1 from "@/data/timetables/cse-sy-1.json";
import cseSy2 from "@/data/timetables/cse-sy-2.json";
import cseSy3 from "@/data/timetables/cse-sy-3.json";
import cseSy4 from "@/data/timetables/cse-sy-4.json";
import aimlSy1 from "@/data/timetables/aiml-sy-1.json";
import studentOec from "@/data/student-oec.json";
import studentLanguage from "@/data/student-language.json";
import studentHonorsMinor from "@/data/student-honors-minor.json";

const OEC: Record<string, string> = studentOec;
const LANGUAGE: Record<string, string> = studentLanguage;
const HONORS_MINOR: Record<string, { title: string; kind: string }> =
  studentHonorsMinor;

export const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

interface BatchEntry {
  subject: string;
  label?: string;
  room?: string;
  faculty?: string;
}

interface ScheduleSlot {
  start: string;
  end: string;
  type: "common" | "lunch" | "batchwise";
  subject?: string;
  room?: string;
  batches?: Record<string, BatchEntry>;
}

export interface TimetableData {
  division: string;
  branch: string;
  standing: string;
  confidence: string;
  rooms: Record<string, string>;
  faculty: Record<string, string>;
  subjectNames: Record<string, string>;
  schedule: Record<string, ScheduleSlot[]>;
}

const TIMETABLES: Record<string, TimetableData> = {
  "CSE-1": cseSy1 as TimetableData,
  "CSE-2": cseSy2 as TimetableData,
  "CSE-3": cseSy3 as TimetableData,
  "CSE-4": cseSy4 as TimetableData,
  "AIML-1": aimlSy1 as TimetableData,
};

export function getAllTimetables(): { key: string; data: TimetableData }[] {
  return Object.entries(TIMETABLES).map(([key, data]) => ({ key, data }));
}

export interface AgendaItem {
  start: string;
  end: string;
  kind: "class" | "lab" | "lunch" | "free-period" | "unverified";
  title: string;
  room: string | null;
  faculty: string | null;
  /** Stable identifier for the subject, used to attach subject todos. Null for lunch/free periods. */
  subjectKey: string | null;
}

export function getTimetable(branch: string, division: number): TimetableData | null {
  return TIMETABLES[`${branch}-${division}`] ?? null;
}

export function resolveDayAgenda(
  timetable: TimetableData,
  day: DayKey,
  batchLabel: string | null,
  mis: string | null = null
): AgendaItem[] {
  const slots = timetable.schedule[day] ?? [];
  const items: AgendaItem[] = [];

  for (const slot of slots) {
    if (slot.type === "lunch") {
      items.push({
        start: slot.start,
        end: slot.end,
        kind: "lunch",
        title: "Lunch",
        room: null,
        faculty: null,
        subjectKey: null,
      });
      continue;
    }

    if (slot.type === "common" && slot.subject) {
      let name = timetable.subjectNames[slot.subject] ?? slot.subject;
      let facultyName: string | null =
        timetable.faculty[slot.subject] ?? null;
      const roomName = slot.room ? timetable.rooms[slot.room] ?? slot.room : null;

      if (slot.subject === "OE" && mis && OEC[mis]) {
        name = OEC[mis];
        facultyName = null;
      } else if (slot.subject === "LL" && mis && LANGUAGE[mis]) {
        name = LANGUAGE[mis];
        facultyName = null;
      } else if (slot.subject === "HM") {
        if (mis && HONORS_MINOR[mis]) {
          const entry = HONORS_MINOR[mis];
          name = `${entry.kind}: ${entry.title}`;
          facultyName = null;
        } else {
          continue;
        }
      }

      items.push({
        start: slot.start,
        end: slot.end,
        kind: "class",
        title: name,
        room: roomName,
        faculty: facultyName,
        subjectKey: slot.subject,
      });
      continue;
    }

    if (slot.type === "batchwise" && slot.batches) {
      const entry = batchLabel ? slot.batches[batchLabel] : undefined;
      if (!entry) continue;

      const isUnverified = entry.label?.includes("unverified") ?? false;
      const isLab = entry.subject !== "LEC" && !!entry.room;
      const roomName = entry.room ? timetable.rooms[entry.room] ?? entry.room : null;
      const facultyName = entry.faculty ?? timetable.faculty[entry.subject];

      let title = entry.label?.replace(/\s*\(unverified.*?\)/i, "") ?? entry.subject;
      if (entry.subject === "LEC") title = "Lecture";

      items.push({
        start: slot.start,
        end: slot.end,
        kind: isUnverified ? "unverified" : isLab ? "lab" : "class",
        title,
        room: roomName,
        faculty: facultyName ?? null,
        subjectKey: entry.subject,
      });
    }
  }

  return items.sort((a, b) => a.start.localeCompare(b.start));
}

export function todayDayKey(): DayKey {
  return DAY_KEYS[new Date().getDay()];
}

function timeStrToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export interface AgendaSplit {
  current: AgendaItem | null;
  upcoming: AgendaItem[];
}

/**
 * Splits a day's agenda into the currently-running item (if any) and the
 * remaining upcoming items, based on the given time-of-day in minutes
 * since midnight. Completed items are excluded entirely.
 */
export function splitAgendaByNow(
  items: AgendaItem[],
  nowMinutes: number
): AgendaSplit {
  let current: AgendaItem | null = null;
  const upcoming: AgendaItem[] = [];

  for (const item of items) {
    const startM = timeStrToMinutes(item.start);
    const endM = timeStrToMinutes(item.end);

    if (nowMinutes >= startM && nowMinutes < endM) {
      current = item;
    } else if (startM > nowMinutes) {
      upcoming.push(item);
    }
  }

  return { current, upcoming };
}

/**
 * Minutes remaining until the given end time ("HH:MM"), relative to
 * nowMinutes (minutes since midnight). Never negative.
 */
export function minutesUntil(endTime: string, nowMinutes: number): number {
  return Math.max(0, timeStrToMinutes(endTime) - nowMinutes);
}
