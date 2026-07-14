import facultyData from "@/data/faculty-directory.json";

export interface Faculty {
  id: string;
  name: string;
  designation: string;
  subjects: string[];
  email: string;
  cabin: string;
  advisor: boolean;
  advisorFor: string | null;
}

export function getFacultyDirectory(): Faculty[] {
  return facultyData as Faculty[];
}
