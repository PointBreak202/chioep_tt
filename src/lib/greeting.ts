import cseNames from "@/data/student-names-cse.json";
import aimlNames from "@/data/student-names-aiml.json";
import overrides from "@/data/greeting-overrides.json";

const NAME_LOOKUPS: Record<string, Record<string, string>> = {
  CSE: cseNames,
  AIML: aimlNames,
};

export function getGreeting(mis: string, branchCode: string): string {
  const override = (overrides as Record<string, string>)[mis];
  if (override) return override;

  const name = NAME_LOOKUPS[branchCode]?.[mis];
  if (name) return `Hey ${name}, here's your schedule`;

  return "Here's your schedule";
}
