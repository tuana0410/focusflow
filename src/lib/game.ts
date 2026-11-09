// Game rules for FocusFlow. Everything here is a pure function,
// so it is easy to test and does not touch the DOM or localStorage.

export type SessionResult = "completed" | "abandoned";

export interface Session {
  id: string;
  label: string;
  minutes: number; // planned minutes, or minutes actually focused if abandoned
  result: SessionResult;
  xp: number;
  endedAt: number; // timestamp in ms
}

export interface GameState {
  xp: number;
  combo: number; // completed sessions in a row
  wilted: boolean; // true after giving up, until the next completed session
  streak: number; // days in a row with at least one completed session
  bestStreak: number;
  lastDay: string | null; // last day with a completed session, "YYYY-MM-DD"
  daily: Record<string, number>; // focused minutes per day, for the charts
  sessions: Session[]; // newest first
}

export interface ActiveSession {
  label: string;
  minutes: number;
  startedAt: number;
  endsAt: number;
}

export const DURATION_PRESETS = [15, 25, 50];
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 120;
export const MAX_LABEL_LENGTH = 40;
export const MAX_SAVED_SESSIONS = 50;

export const INITIAL_STATE: GameState = {
  xp: 0,
  combo: 0,
  wilted: false,
  streak: 0,
  bestStreak: 0,
  lastDay: null,
  daily: {},
  sessions: [],
};

// ---------- Plant stages ----------

export const STAGES = [
  { name: "Seed", minXp: 0 },
  { name: "Sprout", minXp: 25 },
  { name: "Sapling", minXp: 75 },
  { name: "Young plant", minXp: 175 },
  { name: "In bloom", minXp: 350 },
  { name: "Tree", minXp: 600 },
];

export function stageIndex(xp: number): number {
  let index = 0;
  STAGES.forEach((stage, i) => {
    if (xp >= stage.minXp) index = i;
  });
  return index;
}

/** How far the plant is between its current stage and the next one (0–100). */
export function stageProgress(xp: number) {
  const index = stageIndex(xp);
  const current = STAGES[index];
  const next = STAGES[index + 1] ?? null;
  if (!next) {
    return { index, current, next, percent: 100, xpToNext: 0 };
  }
  const span = next.minXp - current.minXp;
  const percent = Math.round(((xp - current.minXp) / span) * 100);
  return { index, current, next, percent, xpToNext: next.minXp - xp };
}

// ---------- XP and combo ----------

/** Each completed session in a row adds 0.25x, up to 2x. */
export function comboMultiplier(combo: number): number {
  return 1 + 0.25 * Math.min(Math.max(combo, 0), 4);
}

/** 1 XP per focused minute, times the combo bonus. */
export function xpForSession(minutes: number, combo: number): number {
  return Math.round(minutes * comboMultiplier(combo));
}

// ---------- Input checks ----------

export type MinutesCheck = { ok: true; minutes: number } | { ok: false; error: string };

export function parseMinutes(raw: string): MinutesCheck {
  const text = raw.trim();
  if (text === "") {
    return { ok: false, error: "Enter how many minutes you want to focus." };
  }
  if (!/^\d+$/.test(text)) {
    return { ok: false, error: "Use a whole number of minutes, like 25." };
  }
  const minutes = Number(text);
  if (minutes < MIN_MINUTES || minutes > MAX_MINUTES) {
    return { ok: false, error: `Pick between ${MIN_MINUTES} and ${MAX_MINUTES} minutes.` };
  }
  return { ok: true, minutes };
}

export function cleanLabel(raw: string): string {
  const text = raw.trim().replace(/\s+/g, " ").slice(0, MAX_LABEL_LENGTH);
  return text === "" ? "General" : text;
}

// ---------- Days and streaks ----------

/** Local date as "YYYY-MM-DD". */
export function dayKey(time: number): string {
  const d = new Date(time);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function previousDayKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d - 1).getTime());
}

/** The last `count` days as keys, oldest first, ending today. */
export function lastDays(now: number, count: number): string[] {
  const d = new Date(now);
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    keys.push(dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - i).getTime()));
  }
  return keys;
}

/** Sessions finished today. */
export function completedToday(state: GameState, now: number): number {
  const today = dayKey(now);
  return state.sessions.filter((s) => s.result === "completed" && dayKey(s.endedAt) === today).length;
}

/** The streak shown on screen: it drops to 0 if a whole day was missed. */
export function visibleStreak(state: GameState, now: number): number {
  const today = dayKey(now);
  if (state.lastDay === today || state.lastDay === previousDayKey(today)) {
    return state.streak;
  }
  return 0;
}

// ---------- Session results ----------

export function startSession(label: string, minutes: number, now: number): ActiveSession {
  return { label, minutes, startedAt: now, endsAt: now + minutes * 60_000 };
}

function makeId(time: number): string {
  return `${time}-${Math.random().toString(36).slice(2, 8)}`;
}

export function completeSession(state: GameState, active: ActiveSession) {
  const gained = xpForSession(active.minutes, state.combo);
  const day = dayKey(active.endsAt);

  let streak: number;
  if (state.lastDay === day) streak = state.streak;
  else if (state.lastDay === previousDayKey(day)) streak = state.streak + 1;
  else streak = 1;

  const session: Session = {
    id: makeId(active.endsAt),
    label: active.label,
    minutes: active.minutes,
    result: "completed",
    xp: gained,
    endedAt: active.endsAt,
  };

  const next: GameState = {
    xp: state.xp + gained,
    combo: state.combo + 1,
    wilted: false,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    lastDay: day,
    daily: { ...state.daily, [day]: (state.daily[day] ?? 0) + active.minutes },
    sessions: [session, ...state.sessions].slice(0, MAX_SAVED_SESSIONS),
  };

  return {
    state: next,
    gained,
    grew: stageIndex(next.xp) > stageIndex(state.xp),
  };
}

export function abandonSession(state: GameState, active: ActiveSession, now: number): GameState {
  const focused = Math.floor((Math.min(now, active.endsAt) - active.startedAt) / 60_000);

  const session: Session = {
    id: makeId(now),
    label: active.label,
    minutes: Math.max(focused, 0),
    result: "abandoned",
    xp: 0,
    endedAt: now,
  };

  return {
    ...state,
    combo: 0,
    wilted: true,
    sessions: [session, ...state.sessions].slice(0, MAX_SAVED_SESSIONS),
  };
}
