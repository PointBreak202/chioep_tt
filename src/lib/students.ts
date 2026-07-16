import cseFullNames from "@/data/student-fullnames-cse.json";
import aimlFullNames from "@/data/student-fullnames-aiml.json";
import { resolveMis } from "./mis";

export interface StudentDirectoryEntry {
  mis: string;
  name: string;
  branchCode: string;
  branchName: string;
  division: number;
  batchLabel: string | null;
}

let cachedDirectory: StudentDirectoryEntry[] | null = null;

export function getStudentDirectory(): StudentDirectoryEntry[] {
  if (cachedDirectory) return cachedDirectory;

  const allNames: Record<string, string> = {
    ...(cseFullNames as Record<string, string>),
    ...(aimlFullNames as Record<string, string>),
  };

  const entries: StudentDirectoryEntry[] = [];
  for (const [mis, name] of Object.entries(allNames)) {
    const resolution = resolveMis(mis);
    if (!resolution.ok) continue;
    entries.push({
      mis,
      name,
      branchCode: resolution.profile.branchCode,
      branchName: resolution.profile.branchName,
      division: resolution.profile.division,
      batchLabel: resolution.profile.batchLabel,
    });
  }

  cachedDirectory = entries;
  return entries;
}

export function searchStudents(
  query: string,
  excludeMis: string[],
  limit = 8
): StudentDirectoryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const excludeSet = new Set(excludeMis);
  const directory = getStudentDirectory();

  const matches = directory.filter((s) => {
    if (excludeSet.has(s.mis)) return false;
    return s.name.toLowerCase().includes(q) || s.mis.includes(q);
  });

  matches.sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(q) || a.mis.startsWith(q);
    const bStarts = b.name.toLowerCase().startsWith(q) || b.mis.startsWith(q);
    if (aStarts !== bStarts) return aStarts ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return matches.slice(0, limit);
}
