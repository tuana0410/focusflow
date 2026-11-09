import { dayKey, lastDays, visibleStreak, type GameState } from "../lib/game";

interface Props {
  game: GameState;
  now: number;
}

const WEEKS = 12;

/** Color level for the activity map, by focused minutes. */
function level(minutes: number): number {
  if (minutes <= 0) return 0;
  if (minutes < 25) return 1;
  if (minutes < 50) return 2;
  if (minutes < 100) return 3;
  return 4;
}

function shortDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "short" });
}

export function ProgressTab({ game, now }: Props) {
  const week = lastDays(now, 7);
  const weekMinutes = week.map((k) => game.daily[k] ?? 0);
  const weekTotal = weekMinutes.reduce((a, b) => a + b, 0);
  const best = Math.max(...weekMinutes);
  const chartMax = Math.max(60, best);

  const totalMinutes = Object.values(game.daily).reduce((a, b) => a + b, 0);
  const streak = visibleStreak(game, now);

  // Activity map: 12 columns (weeks), 7 rows (Mon..Sun), ending this week
  const today = new Date(now);
  const mondayOffset = (today.getDay() + 6) % 7; // 0 = Monday
  const days = lastDays(now, WEEKS * 7 - (6 - mondayOffset));
  const cells: (string | null)[] = [...days, ...Array<null>(6 - mondayOffset).fill(null)];

  const todayKey = dayKey(now);
  const todaySessions = game.sessions.filter((s) => dayKey(s.endedAt) === todayKey);

  return (
    <div className="tab progress-tab">
      <h2 className="tab-title">Your progress</h2>

      <div className="pills">
        <div className="pill mint">
          <b>{totalMinutes}</b>
          <span>total min</span>
        </div>
        <div className="pill pink">
          <b>{streak}</b>
          <span>day streak</span>
        </div>
        <div className="pill dashed">
          <b>{game.bestStreak}</b>
          <span>best streak</span>
        </div>
      </div>

      <section className="card">
        <div className="week-head">
          <p className="huge">
            {weekTotal}
            <small>min</small>
          </p>
          <p className="muted">focused in the last 7 days</p>
        </div>

        <div className="bars" role="img" aria-label={`Minutes per day: ${week.map((k, i) => `${shortDay(k)} ${weekMinutes[i]}`).join(", ")}`}>
          {week.map((k, i) => {
            const m = weekMinutes[i];
            const isBest = m > 0 && m === best;
            return (
              <div className="bar-col" key={k}>
                {isBest && <span className="bar-tip">{m} min</span>}
                <div className="bar-track">
                  <div className={`bar ${isBest ? "best" : ""}`} style={{ height: `${(m / chartMax) * 100}%` }} />
                </div>
                <span className={`bar-day ${k === todayKey ? "today" : ""}`}>{shortDay(k)}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h3 className="card-title">Activity map</h3>
        <div className="heatmap" role="img" aria-label={`Focused days in the last ${WEEKS} weeks`}>
          {cells.map((k, i) =>
            k ? (
              <span key={i} className={`cell l${level(game.daily[k] ?? 0)}`} title={`${k}: ${game.daily[k] ?? 0} min`} />
            ) : (
              <span key={i} className="cell empty" />
            ),
          )}
        </div>
        <div className="legend" aria-hidden="true">
          less
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={`cell l${l}`} />
          ))}
          more
        </div>
      </section>

      <section className="card">
        <h3 className="card-title">Today</h3>
        {todaySessions.length === 0 ? (
          <p className="muted">No sessions yet today. Your first one starts the streak.</p>
        ) : (
          <ul className="history">
            {todaySessions.map((s) => (
              <li key={s.id} className={s.result}>
                <span className="h-time">
                  {new Date(s.endedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="h-label">{s.label}</span>
                <span className="h-xp">{s.result === "completed" ? `+${s.xp} XP` : "gave up"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
