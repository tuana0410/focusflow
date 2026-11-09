import { describe, expect, it } from "vitest";
import {
  INITIAL_STATE,
  abandonSession,
  cleanLabel,
  comboMultiplier,
  completeSession,
  dayKey,
  parseMinutes,
  previousDayKey,
  lastDays,
  completedToday,
  stageIndex,
  stageProgress,
  startSession,
  visibleStreak,
  xpForSession,
} from "./game";

const day = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

describe("parseMinutes", () => {
  it("accepts whole numbers in range", () => {
    expect(parseMinutes("25")).toEqual({ ok: true, minutes: 25 });
    expect(parseMinutes(" 120 ")).toEqual({ ok: true, minutes: 120 });
  });

  it("rejects empty, broken and out-of-range input", () => {
    for (const bad of ["", "   ", "abc", "2.5", "-5", "0", "121", "1e3"]) {
      expect(parseMinutes(bad).ok).toBe(false);
    }
  });
});

describe("cleanLabel", () => {
  it("falls back to General and trims long labels", () => {
    expect(cleanLabel("   ")).toBe("General");
    expect(cleanLabel("  Numerical   methods ")).toBe("Numerical methods");
    expect(cleanLabel("x".repeat(80))).toHaveLength(40);
  });
});

describe("xp and combo", () => {
  it("gives 1 XP per minute with no combo", () => {
    expect(xpForSession(25, 0)).toBe(25);
  });

  it("caps the combo bonus at 2x", () => {
    expect(comboMultiplier(1)).toBe(1.25);
    expect(comboMultiplier(4)).toBe(2);
    expect(comboMultiplier(10)).toBe(2);
  });
});

describe("plant stages", () => {
  it("maps XP to the right stage", () => {
    expect(stageIndex(0)).toBe(0);
    expect(stageIndex(24)).toBe(0);
    expect(stageIndex(25)).toBe(1);
    expect(stageIndex(10_000)).toBe(5);
  });

  it("reports progress to the next stage", () => {
    expect(stageProgress(50)).toMatchObject({ index: 1, percent: 50, xpToNext: 25 });
    expect(stageProgress(700)).toMatchObject({ index: 5, next: null, percent: 100 });
  });

});

describe("days and streaks", () => {
  it("handles month and year boundaries", () => {
    expect(previousDayKey("2026-03-01")).toBe("2026-02-28");
    expect(previousDayKey("2027-01-01")).toBe("2026-12-31");
  });

  it("drops the visible streak after a missed day", () => {
    const state = { ...INITIAL_STATE, streak: 4, lastDay: "2026-11-08" };
    expect(visibleStreak(state, day(2026, 11, 9))).toBe(4);
    expect(visibleStreak(state, day(2026, 11, 10))).toBe(0);
  });
});

describe("charts data", () => {
  it("lists the last days oldest first, across a month change", () => {
    expect(lastDays(day(2026, 12, 2), 3)).toEqual(["2026-11-30", "2026-12-01", "2026-12-02"]);
  });

  it("adds focused minutes to the day and counts today's sessions", () => {
    const now = day(2026, 11, 9);
    let state = completeSession(INITIAL_STATE, startSession("A", 25, now)).state;
    state = completeSession(state, startSession("B", 15, now + 3_600_000)).state;
    expect(state.daily["2026-11-09"]).toBe(40);
    expect(completedToday(state, now)).toBe(2);
  });
});

describe("completing and abandoning sessions", () => {
  it("adds XP, combo and starts a streak", () => {
    const active = startSession("Math", 25, day(2026, 11, 9));
    const result = completeSession(INITIAL_STATE, active);
    expect(result.gained).toBe(25);
    expect(result.grew).toBe(true); // 0 -> 25 XP reaches Sprout
    expect(result.state).toMatchObject({ xp: 25, combo: 1, streak: 1, lastDay: "2026-11-09" });
    expect(result.state.sessions[0]).toMatchObject({ label: "Math", result: "completed", xp: 25 });
  });

  it("grows the streak on the next day but not twice on the same day", () => {
    const first = completeSession(INITIAL_STATE, startSession("A", 10, day(2026, 11, 9))).state;
    const sameDay = completeSession(first, startSession("B", 10, day(2026, 11, 9, 15))).state;
    expect(sameDay.streak).toBe(1);
    const nextDay = completeSession(sameDay, startSession("C", 10, day(2026, 11, 10))).state;
    expect(nextDay.streak).toBe(2);
    expect(nextDay.bestStreak).toBe(2);
  });

  it("giving up resets combo, wilts the plant and gives no XP", () => {
    const start = day(2026, 11, 9);
    const state = { ...INITIAL_STATE, xp: 40, combo: 3 };
    const next = abandonSession(state, startSession("Math", 25, start), start + 10 * 60_000);
    expect(next).toMatchObject({ xp: 40, combo: 0, wilted: true });
    expect(next.sessions[0]).toMatchObject({ result: "abandoned", minutes: 10, xp: 0 });
  });

  it("a completed session revives a wilted plant", () => {
    const wilted = { ...INITIAL_STATE, wilted: true };
    const next = completeSession(wilted, startSession("A", 5, day(2026, 11, 9))).state;
    expect(next.wilted).toBe(false);
  });

  it("uses the local date for day keys", () => {
    expect(dayKey(day(2026, 1, 5))).toBe("2026-01-05");
  });
});
