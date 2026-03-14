import { get, has } from "lodash";

const TBA_BASE = "https://www.thebluealliance.com/api/v3";

const TBA_KEY = "YOUR_TBA_KEY";

const headers = {
  "X-TBA-Auth-Key": TBA_KEY
};

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

// Detect API error
export const isFailed = (data: unknown): boolean => {
  return has(data, "Error");
};

// Get error message
export const getError = (data: unknown): string | undefined => {
  return get(data, "Error");
};

// Get team name
export const getTeamName = (num: number, teams?: TBATeam[]): string => {
  if (!teams) return `Team ${num}`;

  const team = teams.find(t => t.key === `frc${num}`);

  return team?.nickname ?? team?.name ?? `Team ${num}`;
};

// Fetch helper
async function tbaFetch(endpoint: string) {
  const res = await fetch(`${TBA_BASE}${endpoint}`, {
    headers
  });

  return res.json();
}

// Get teams at event
export const getTeams = async (eventKey: string): Promise<TBATeam[]> => {
  return tbaFetch(`/event/${eventKey}/teams/simple`);
};

// Get matches at event
export const getMatches = async (eventKey: string): Promise<TBAMatch[]> => {
  return tbaFetch(`/event/${eventKey}/matches/simple`);
};

// Get alliance teams
export const getAllianceTeams = (
  match: TBAMatch,
  alliance: "red" | "blue"
): number[] => {
  return match.alliances[alliance].team_keys.map(team =>
    parseInt(team.replace("frc", ""))
  );
};

// Get all match teams
export const getMatchTeams = (match: TBAMatch) => {
  return {
    red: getAllianceTeams(match, "red"),
    blue: getAllianceTeams(match, "blue")
  };
};
Quick way to confirm the problem

Open:

src/common/tba.ts

Search for:

isFailed(
getError(
getTeamName(

If they appear twice, delete one copy.

One more thing (important for your deployment)

If you're deploying with GitHub Actions + Vite PWA, never put your TBA API key directly in the file.

Instead use:

VITE_TBA_KEY

in your .env.

Example:

const TBA_KEY = import.meta.env.VITE_TBA_KEY;

✅ If you'd like, I can also help you add automatic match/team autofill for your scouting form (huge time saver during competitions).

can you give me the full file including the match and team autofill

Below is a complete tba.ts file you can drop into:

src/common/tba.ts

It includes:

Team + match fetching from The Blue Alliance

Error handling

Team name lookup

Match + team autofill helpers for scouting forms

It is written to work with 2026 FIRST Robotics Competition events.

Full tba.ts
import { get, has } from "lodash";

/*
  Blue Alliance API helper for Roboherd scouting
  Works with 2026 FRC events
*/

const TBA_BASE = "https://www.thebluealliance.com/api/v3";

// Uses Vite env variable (recommended for deployments)
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

/*
  Match team slot used for scouting auto-assignment
  Example: Red 1, Blue 3, etc
*/
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

/*
  Returns the team number for a scouting slot
  Example: match 12 red 2 -> team number
*/

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

/*
  Returns the full scouting assignment
*/

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
