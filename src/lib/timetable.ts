import cseSy1 from "@/data/timetables/cse-sy-1.json";
import cseSy2 from "@/data/timetables/cse-sy-2.json";
import cseSy3 from "@/data/timetables/cse-sy-3.json";
import cseSy4 from "@/data/timetables/cse-sy-4.json";
import aimlSy1 from "@/data/timetables/aiml-sy-1.json";

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

interface TimetableData {
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

export interface AgendaItem {
  start: string;
  end: string;
  kind: "class" | "lab" | "lunch" | "free-period" | "unverified";
  title: string;
  room: string | null;
  faculty: string | null;
}

export function getTimetable(branch: string, division: number): TimetableData | null {
  return TIMETABLES[`${branch}-${division}`] ?? null;
}

export function resolveDayAgenda(
  timetable: TimetableData,
  day: DayKey,
  batchLabel: string | null
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
      });
      continue;
    }

    if (slot.type === "common" && slot.subject) {
      const name = timetable.subjectNames[slot.subject] ?? slot.subject;
      const facultyName = timetable.faculty[slot.subject];
      const roomName = slot.room ? timetable.rooms[slot.room] ?? slot.room : null;
      items.push({
        start: slot.start,
        end: slot.end,
        kind: "class",
        title: name,
        room: roomName,
        faculty: facultyName ?? null,
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
      });
    }
  }

  return items.sort((a, b) => a.start.localeCompare(b.start));
}

export function todayDayKey(): DayKey {
  return DAY_KEYS[new Date().getDay()];
}
