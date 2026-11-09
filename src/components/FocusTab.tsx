import { completedToday, stageProgress, type ActiveSession, type GameState } from "../lib/game";
import { LeafDot } from "./Icons";
import { PlantMascot } from "./PlantMascot";
import { SessionSetup } from "./SessionSetup";
import { Timer } from "./Timer";

interface Props {
  game: GameState;
  active: ActiveSession | null;
  now: number;
  dailyGoal: number;
  onStart: (label: string, minutes: number) => void;
  onGiveUp: () => void;
}

export function FocusTab({ game, active, now, dailyGoal, onStart, onGiveUp }: Props) {
  const progress = stageProgress(game.xp);
  const doneToday = completedToday(game, now);
  const slots = Math.max(dailyGoal, doneToday);

  return (
    <div className="tab focus-tab">
      {/* Plant card: pink top, yellow hill with the mascot */}
      <section className="plant-card" aria-label="Your plant">
        <div className="plant-top">
          <div>
            <p className="eyebrow">Level {progress.index + 1}</p>
            <h2 className="plant-name">
              {progress.current.name}
              {game.wilted && <span className="sad-tag">sad</span>}
            </h2>
          </div>
          <p className="next-pill">
            {progress.next ? (
              <>
                <b>{progress.xpToNext} XP</b> to {progress.next.name.toLowerCase()}
              </>
            ) : (
              <b>Fully grown</b>
            )}
          </p>
        </div>

        <div className="plant-stage">
          <PlantMascot
            stage={progress.index}
            wilted={game.wilted}
            label={`Your plant: ${progress.current.name}${game.wilted ? ", wilted" : ""}`}
          />
        </div>

        <div
          className="grow-bar"
          role="progressbar"
          aria-label="Progress to the next stage"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
        >
          <div className="grow-fill" style={{ width: `${progress.percent}%` }} />
        </div>
      </section>

      {/* Daily goal, one leaf per session */}
      <section className="goal" aria-label="Daily goal">
        <p>
          Today <b>{doneToday}/{dailyGoal}</b>
        </p>
        <div className="leaves">
          {Array.from({ length: slots }, (_, i) => (
            <LeafDot key={i} done={i < doneToday} />
          ))}
        </div>
      </section>

      {/* Timer card */}
      <section className={`timer-card ${active ? "is-running" : ""}`} aria-label="Focus timer">
        {active ? (
          <Timer active={active} now={now} combo={game.combo} onGiveUp={onGiveUp} />
        ) : (
          <SessionSetup onStart={onStart} />
        )}
      </section>
    </div>
  );
}
