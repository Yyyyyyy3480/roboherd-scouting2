import { get, has } from "lodash";

/*
 Blue Alliance API helper for Roboherd scouting
 Works with 2026 FRC events
*/

const TBA_BASE = "https://www.thebluealliance.com/api/v3";

// Use Vite environment variable
const TBA_KEY: string = import.meta.env.VITE_TBA_KEY;

const headers = {
  "X-TBA-Auth-Key": TBA_KEY
};

/* ---------------- TYPES ---------------- */

export interface TBATeam {
  key: string;
  team_number: number;
  nickname?: string;
  name?: string;
}

export interface TBAMatchAlliance {
  team_keys: string[];
  score: number;
}

export interface TBAMatch {
  key: string;
  match_number: number;
  comp_level: string;

  alliances: {
    red: TBAMatchAlliance;
    blue: TBAMatchAlliance;
  };
}

export interface MatchSlot {
  alliance: "red" | "blue";
  position: number;
}

/* ---------------- ERROR HELPERS ---------------- */

export const isFailed = (data: unknown): boolean => {
  return has(data, "Error");
};

export const getError = (data: unknown): string | undefined => {
  return get(data, "Error");
};

/* ---------------- API FETCH ---------------- */

async function tbaFetch(endpoint: string) {
  const res = await fetch(`${TBA_BASE}${endpoint}`, {
    headers
  });

  const data = await res.json();

  if (isFailed(data)) {
    console.error("TBA API Error:", getError(data));
  }

  return data;
}

/* ---------------- EVENT DATA ---------------- */

export const getTeams = async (eventKey: string): Promise<TBATeam[]> => {
  return tbaFetch(`/event/${eventKey}/teams/simple`);
};

export const getMatches = async (eventKey: string): Promise<TBAMatch[]> => {
  return tbaFetch(`/event/${eventKey}/matches/simple`);
};

/* ---------------- TEAM HELPERS ---------------- */

export const getTeamName = (num: number, teams?: TBATeam[]): string => {
  if (!teams) return `Team ${num}`;

  const team = teams.find(t => t.key === `frc${num}`);

  return team?.nickname ?? team?.name ?? `Team ${num}`;
};

/* ---------------- MATCH HELPERS ---------------- */

export const getAllianceTeams = (
  match: TBAMatch,
  alliance: "red" | "blue"
): number[] => {
  return match.alliances[alliance].team_keys.map(team =>
    parseInt(team.replace("frc", ""))
  );
};

export const getMatchTeams = (match: TBAMatch) => {
  return {
    red: getAllianceTeams(match, "red"),
    blue: getAllianceTeams(match, "blue")
  };
};

/* ---------------- MATCH LOOKUP ---------------- */

export const getMatchByNumber = (
  matches: TBAMatch[],
  matchNumber: number,
  level: string = "qm"
): TBAMatch | undefined => {
  return matches.find(
    m => m.match_number === matchNumber && m.comp_level === level
  );
};

/* ---------------- SCOUTING AUTO-FILL ---------------- */

export const getTeamForSlot = (
  matches: TBAMatch[],
  matchNumber: number,
  slot: MatchSlot
): number | undefined => {

  const match = getMatchByNumber(matches, matchNumber);

  if (!match) return undefined;

  const teams = getAllianceTeams(match, slot.alliance);

  return teams[slot.position - 1];
};

export const getScoutAssignment = (
  matches: TBAMatch[],
  matchNumber: number,
  slot: MatchSlot
) => {

  const team = getTeamForSlot(matches, matchNumber, slot);

  return {
    match: matchNumber,
    alliance: slot.alliance,
    position: slot.position,
    team
  };
};
