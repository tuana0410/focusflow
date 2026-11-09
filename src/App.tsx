import { useEffect, useRef, useState } from "react";
import { BottomNav, type Tab } from "./components/BottomNav";
import { FocusTab } from "./components/FocusTab";
import { FlameIcon, StarIcon } from "./components/Icons";
import { ProgressTab } from "./components/ProgressTab";
import { SettingsTab } from "./components/SettingsTab";
import { useNow } from "./hooks/useNow";
import { playChime } from "./lib/chime";
import { formatClock } from "./lib/format";
import {
  INITIAL_STATE,
  STAGES,
  abandonSession,
  completeSession,
  stageProgress,
  startSession,
  visibleStreak,
  type ActiveSession,
  type GameState,
} from "./lib/game";
import {
  clearAll,
  loadActive,
  loadSettings,
  loadState,
  saveActive,
  saveSettings,
  saveState,
  type Settings,
} from "./lib/storage";

type Notice = { kind: "success" | "warn"; text: string };

export default function App() {
  const [game, setGame] = useState<GameState>(loadState);
  const [active, setActive] = useState<ActiveSession | null>(loadActive);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [tab, setTab] = useState<Tab>("focus");
  const [notice, setNotice] = useState<Notice | null>(null);
  const now = useNow(active !== null);

  // Remembers which session was already finished, so it is never counted twice
  const finishedRef = useRef<number | null>(null);

  // Save to the browser whenever something changes
  useEffect(() => saveState(game), [game]);
  useEffect(() => saveActive(active), [active]);
  useEffect(() => saveSettings(settings), [settings]);

  // When the time is up, finish the session (also works after a page reload)
  useEffect(() => {
    if (!active || now < active.endsAt || finishedRef.current === active.startedAt) return;
    finishedRef.current = active.startedAt;

    const result = completeSession(game, active);
    setGame(result.state);
    setActive(null);
    if (settings.sound) playChime();

    const stageName = STAGES[stageProgress(result.state.xp).index].name;
    setNotice({
      kind: "success",
      text: result.grew
        ? `Session done: +${result.gained} XP. Your plant grew into a ${stageName.toLowerCase()}!`
        : `Session done: +${result.gained} XP.`,
    });
  }, [now, active, game, settings.sound]);

  // Show the countdown in the browser tab
  useEffect(() => {
    document.title = active
      ? `${formatClock(Math.min(active.endsAt - now, active.endsAt - active.startedAt))} · FocusFlow`
      : "FocusFlow";
  }, [active, now]);

  function handleStart(label: string, minutes: number) {
    setNotice(null);
    setActive(startSession(label, minutes, Date.now()));
  }

  function handleGiveUp() {
    if (!active) return;
    setGame(abandonSession(game, active, Date.now()));
    setActive(null);
    setNotice({ kind: "warn", text: "Session stopped and your plant is sad. Finish the next one to cheer it up." });
  }

  function handleReset() {
    clearAll();
    setGame(INITIAL_STATE);
    setActive(null);
    setNotice(null);
    setTab("focus");
  }

  const name = settings.name.trim();
  const date = new Date(now).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long" });

  return (
    <div className="stage">
      <div className="app">
        <header className="header">
          <div>
            <h1 className="hello">Hi{name ? `, ${name}` : " there"}!</h1>
            <p className="date">{date}</p>
          </div>
          <div className="badges">
            <span className="badge" title="Day streak">
              <FlameIcon /> {visibleStreak(game, now)}
            </span>
            <span className="badge" title="Total XP">
              <StarIcon /> {game.xp} XP
            </span>
          </div>
        </header>

        {notice && (
          <div className={`notice ${notice.kind}`} role="status">
            <span>{notice.text}</span>
            <button type="button" className="notice-close" aria-label="Dismiss message" onClick={() => setNotice(null)}>
              ×
            </button>
          </div>
        )}

        <main className="content">
          {tab === "focus" && (
            <FocusTab
              game={game}
              active={active}
              now={now}
              dailyGoal={settings.dailyGoal}
              onStart={handleStart}
              onGiveUp={handleGiveUp}
            />
          )}
          {tab === "progress" && <ProgressTab game={game} now={now} />}
          {tab === "settings" && <SettingsTab settings={settings} onChange={setSettings} onReset={handleReset} />}
        </main>

        <BottomNav tab={tab} onChange={setTab} />
      </div>
    </div>
  );
}
