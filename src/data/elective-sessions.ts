export interface ElectiveSession {
  room: string;
  faculty: string;
}

// Open Electives: intentionally empty for now. The department's OE1/OE2/OE3
// timetables show "Data Analytics" runs as 3 parallel sections (NC-01/Ashwini
// Gawade, NC-02/Ankita Mali, NC-03/Shriganeshrajkumar Togare) at the same
// Thu/Fri hour as the generic OE placeholder, but we have no roster mapping
// a student's MIS to which specific section (OE1/2/3) they attend, so we
// can't resolve a single correct room/faculty per student. Showing one of
// the three guesses would be worse than the current generic label. Add
// entries here once a section roster is available. No current student picks
// Data Analytics as their OEC (checked against student-oec.json), so this
// isn't blocking anyone today.
export const OEC_SESSIONS: Record<string, ElectiveSession> = {
  "numerical methods": { room: "NC-01", faculty: "" },
};

export const HONORS_MINOR_SESSIONS: Record<string, ElectiveSession> = {
  "making sense of data": { room: "NC-04", faculty: "Shriganeshrajkumar Togare" },
  "fundamentals of information and coding theory": { room: "NC-28", faculty: "Deepak Kshirsagar" },
  "introduction to generative ai": { room: "NC-07", faculty: "Snehal Banarase" },
};
