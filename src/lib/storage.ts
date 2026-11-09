// Saves progress in the browser. If the saved data is missing or broken,
// the app starts fresh instead of crashing.

import {
  INITIAL_STATE,
  MAX_MINUTES,
  MIN_MINUTES,
  type ActiveSession,
  type GameState,
  type Session,
} from "./game";

const STATE_KEY = "focusflow:v1";
const ACTIVE_KEY = "focusflow:active:v1";
const SETTINGS_KEY = "focusflow:settings:v1";

export interface Settings {
  name: string;
  sound: boolean;
  dailyGoal: number; // sessions per day
}

export const DEFAULT_SETTINGS: Settings = { name: "", sound: true, dailyGoal: 4 };

const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function isSession(v: unknown): v is Session {
  const s = v as Session;
  return (
    typeof s === "object" && s !== null &&
    typeof s.id === "string" &&
    typeof s.label === "string" &&
    isNumber(s.minutes) &&
    (s.result === "completed" || s.result === "abandoned") &&
    isNumber(s.xp) &&
    isNumber(s.endedAt)
  );
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked (private mode). The game still works, it just won't be saved.
  }
}

function readDaily(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (v && typeof v === "object") {
    for (const [key, minutes] of Object.entries(v)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && isNumber(minutes) && minutes >= 0) out[key] = minutes;
    }
  }
  return out;
}

export function loadState(): GameState {
  const data = readJson(STATE_KEY) as Partial<GameState> | null;
  if (!data || typeof data !== "object") return INITIAL_STATE;

  return {
    xp: isNumber(data.xp) && data.xp >= 0 ? data.xp : 0,
    combo: isNumber(data.combo) && data.combo >= 0 ? data.combo : 0,
    wilted: data.wilted === true,
    streak: isNumber(data.streak) && data.streak >= 0 ? data.streak : 0,
    bestStreak: isNumber(data.bestStreak) && data.bestStreak >= 0 ? data.bestStreak : 0,
    lastDay: typeof data.lastDay === "string" ? data.lastDay : null,
    daily: readDaily(data.daily),
    sessions: Array.isArray(data.sessions) ? data.sessions.filter(isSession) : [],
  };
}

export function saveState(state: GameState) {
  writeJson(STATE_KEY, state);
}

export function loadActive(): ActiveSession | null {
  const a = readJson(ACTIVE_KEY) as ActiveSession | null;
  if (
    a && typeof a === "object" &&
    typeof a.label === "string" &&
    isNumber(a.minutes) && a.minutes >= MIN_MINUTES && a.minutes <= MAX_MINUTES &&
    isNumber(a.startedAt) && isNumber(a.endsAt) && a.endsAt > a.startedAt
  ) {
    return a;
  }
  return null;
}

export function saveActive(active: ActiveSession | null) {
  if (active) {
    writeJson(ACTIVE_KEY, active);
  } else {
    try {
      localStorage.removeItem(ACTIVE_KEY);
    } catch {
      // ignore
    }
  }
}

export function loadSettings(): Settings {
  const s = readJson(SETTINGS_KEY) as Partial<Settings> | null;
  if (!s || typeof s !== "object") return DEFAULT_SETTINGS;
  return {
    name: typeof s.name === "string" ? s.name.slice(0, 20) : "",
    sound: typeof s.sound === "boolean" ? s.sound : DEFAULT_SETTINGS.sound,
    dailyGoal: isNumber(s.dailyGoal) && s.dailyGoal >= 1 && s.dailyGoal <= 8 ? Math.round(s.dailyGoal) : DEFAULT_SETTINGS.dailyGoal,
  };
}

export function saveSettings(settings: Settings) {
  writeJson(SETTINGS_KEY, settings);
}

export function clearAll() {
  try {
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // ignore
  }
}
