import { useState } from "react";
import { formatClock } from "../lib/format";
import { comboMultiplier, xpForSession, type ActiveSession } from "../lib/game";

interface Props {
  active: ActiveSession;
  now: number;
  combo: number;
  onGiveUp: () => void;
}

// Half-circle progress arc, like a music player slider
const R = 110;
const ARC = `M ${130 - R} 130 A ${R} ${R} 0 0 1 ${130 + R} 130`;
const ARC_LENGTH = Math.PI * R;

export function Timer({ active, now, combo, onGiveUp }: Props) {
  const [confirming, setConfirming] = useState(false);

  const total = active.endsAt - active.startedAt;
  const remaining = Math.min(active.endsAt - now, total);
  const done = Math.min(1, Math.max(0, (total - remaining) / total));
  const reward = xpForSession(active.minutes, combo);
  const endsAt = new Date(active.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Position of the knob on the arc
  const angle = Math.PI * (1 - done);
  const knobX = 130 + R * Math.cos(angle);
  const knobY = 130 - R * Math.sin(angle);

  return (
    <div className="timer">
      <p className="timer-label">{active.label}</p>

      <div className="arc-wrap">
        <svg
          className="arc"
          viewBox="0 0 260 150"
          role="progressbar"
          aria-label="Session progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(done * 100)}
        >
          <path d={ARC} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={16} strokeLinecap="round" strokeDasharray="2 14" />
          <path
            d={ARC}
            fill="none"
            stroke="#fff8e7"
            strokeWidth={16}
            strokeLinecap="round"
            strokeDasharray={`${ARC_LENGTH * done} ${ARC_LENGTH}`}
          />
          <circle cx={knobX} cy={knobY} r={13} fill="#1d1b1b" stroke="#fff8e7" strokeWidth={5} />
        </svg>
        <p className="big-clock running">{formatClock(remaining)}</p>
      </div>

      <p className="timer-meta">
        ends {endsAt} · <b>+{reward} XP</b>
        {combo > 0 && <> · combo x{comboMultiplier(combo)}</>}
      </p>

      {confirming ? (
        <div className="confirm" role="alertdialog" aria-label="Give up this session?">
          <p>Give up? No XP, your combo resets and your plant gets sad.</p>
          <div className="confirm-buttons">
            <button type="button" className="btn" onClick={() => setConfirming(false)} autoFocus>
              Keep going
            </button>
            <button type="button" className="btn danger" onClick={onGiveUp}>
              Give up
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn ghost" onClick={() => setConfirming(true)}>
          Give up
        </button>
      )}
    </div>
  );
}
