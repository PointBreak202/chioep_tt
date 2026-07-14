import { getAllTimetables, type DayKey } from "./timetable";

export interface RoomStatus {
  code: string;
  name: string;
  free: boolean;
  occupiedBy?: string;
  until?: string;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function getRoomStatuses(day: DayKey, nowMinutes: number): RoomStatus[] {
  const roomNames = new Map<string, string>();
  const occupancy = new Map<
    string,
    { start: number; end: number; label: string }[]
  >();

  for (const { data } of getAllTimetables()) {
    for (const [code, name] of Object.entries(data.rooms)) {
      if (!roomNames.has(code)) roomNames.set(code, name);
    }

    const slots = data.schedule[day] ?? [];
    for (const slot of slots) {
      const start = timeToMinutes(slot.start);
      const end = timeToMinutes(slot.end);

      if (slot.type === "common" && slot.room) {
        const label = `${data.division} · ${data.subjectNames[slot.subject ?? ""] ?? slot.subject}`;
        const list = occupancy.get(slot.room) ?? [];
        list.push({ start, end, label });
        occupancy.set(slot.room, list);
      }

      if (slot.type === "batchwise" && slot.batches) {
        for (const [batchLabel, entry] of Object.entries(slot.batches)) {
          if (!entry.room) continue;
          const label = `${batchLabel} · ${entry.label ?? entry.subject}`;
          const list = occupancy.get(entry.room) ?? [];
          list.push({ start, end, label });
          occupancy.set(entry.room, list);
        }
      }
    }
  }

  const statuses: RoomStatus[] = [];
  for (const [code, name] of roomNames) {
    const bookings = occupancy.get(code) ?? [];
    const current = bookings.find(
      (b) => nowMinutes >= b.start && nowMinutes < b.end
    );

    if (current) {
      const untilH = Math.floor(current.end / 60);
      const untilM = current.end % 60;
      statuses.push({
        code,
        name,
        free: false,
        occupiedBy: current.label,
        until: `${String(untilH).padStart(2, "0")}:${String(untilM).padStart(2, "0")}`,
      });
    } else {
      statuses.push({ code, name, free: true });
    }
  }

  return statuses.sort((a, b) => {
    if (a.free !== b.free) return a.free ? -1 : 1;
    return a.code.localeCompare(b.code);
  });
}
