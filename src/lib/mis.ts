import misMapping from "@/data/mis-mapping.json";
import aimlDiv1Roster from "@/data/batch-rosters/aiml-1.json";

const BATCH_ROSTERS: Record<string, Record<string, string>> = {
  "AIML-1": aimlDiv1Roster,
};

export type MisResolution =
  | { ok: true; profile: ResolvedProfile }
  | { ok: false; reason: MisErrorReason };

export type MisErrorReason =
  | "invalid_format"
  | "unknown_branch"
  | "unsupported_branch"
  | "unknown_year"
  | "roll_out_of_range";

export interface ResolvedProfile {
  mis: string;
  branchCode: string;
  branchName: string;
  standing: string;
  division: number;
  batchLabel: string | null;
  batchNumber: number | null;
  needsManualBatch: boolean;
}

interface BatchRange {
  batch: number;
  rollStart: number;
  rollEnd: number;
}

interface DivisionRange {
  division: number;
  rollStart: number;
  rollEnd: number;
  batches: BatchRange[] | null;
}

export function resolveMis(rawMis: string): MisResolution {
  const mis = rawMis.trim();

  if (!/^\d{9}$/.test(mis) || !mis.startsWith("61")) {
    return { ok: false, reason: "invalid_format" };
  }

  const yearCode = mis.slice(2, 4);
  const branchCode = mis.slice(4, 6);
  const roll = parseInt(mis.slice(6, 9), 10);

  const branch = (misMapping.branches as Record<string, { code: string; name: string }>)[
    branchCode
  ];
  if (!branch) {
    return { ok: false, reason: "unknown_branch" };
  }

  if (!misMapping.supportedBranches.includes(branch.code)) {
    return { ok: false, reason: "unsupported_branch" };
  }

  const standing = (misMapping.yearCodeToStanding as Record<string, string>)[yearCode];
  if (!standing) {
    return { ok: false, reason: "unknown_year" };
  }

  const divisionsForBranch = (
    misMapping.divisions as Record<string, Record<string, DivisionRange[]>>
  )[branch.code]?.[standing];

  if (!divisionsForBranch) {
    return { ok: false, reason: "unsupported_branch" };
  }

  const match = divisionsForBranch.find(
    (d) => roll >= d.rollStart && roll <= d.rollEnd
  );

  if (!match) {
    return { ok: false, reason: "roll_out_of_range" };
  }

  let batchNumber: number | null = null;
  let batchLabel: string | null = null;
  let needsManualBatch = false;

  const rosterKey = `${branch.code}-${match.division}`;
  const roster = BATCH_ROSTERS[rosterKey];
  const rosterHit = roster?.[mis];

  if (rosterHit) {
    batchLabel = rosterHit;
    const batchMatch = rosterHit.match(/S(\d+)/);
    batchNumber = batchMatch ? parseInt(batchMatch[1], 10) : null;
  } else if (match.batches) {
    const batchMatch = match.batches.find(
      (b) => roll >= b.rollStart && roll <= b.rollEnd
    );
    if (batchMatch) {
      batchNumber = batchMatch.batch;
      const format = (misMapping.batchLabelFormat as Record<string, string>)[
        branch.code
      ];
      batchLabel = format
        .replace("{division}", String(match.division))
        .replace("{batch}", String(batchNumber));
    } else {
      needsManualBatch = true;
    }
  } else {
    needsManualBatch = true;
  }

  return {
    ok: true,
    profile: {
      mis,
      branchCode: branch.code,
      branchName: branch.name,
      standing,
      division: match.division,
      batchLabel,
      batchNumber,
      needsManualBatch,
    },
  };
}

export const MIS_ERROR_MESSAGES: Record<MisErrorReason, string> = {
  invalid_format: "That doesn't look like a valid MIS number. It should be 9 digits, starting with 61.",
  unknown_branch: "We couldn't recognize the branch from this MIS number.",
  unsupported_branch: "Your branch isn't supported yet. We're starting with CSE and AIML, more are on the way.",
  unknown_year: "We don't have timetable support for your admission year yet.",
  roll_out_of_range: "We couldn't match this MIS number to a division. Double check the number and try again.",
};
