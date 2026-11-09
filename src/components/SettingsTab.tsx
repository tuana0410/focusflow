import { useState } from "react";
import type { Settings } from "../lib/storage";

interface Props {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onReset: () => void;
}

export function SettingsTab({ settings, onChange, onReset }: Props) {
  const [confirmReset, setConfirmReset] = useState(false);

  const setGoal = (goal: number) => onChange({ ...settings, dailyGoal: Math.min(8, Math.max(1, goal)) });

  return (
    <div className="tab settings-tab">
      <h2 className="tab-title">Settings</h2>

      <section className="card setting-row">
        <div>
          <h3 className="card-title">Your name</h3>
          <p className="muted">Shown in the greeting.</p>
        </div>
        <input
          type="text"
          className="name-input"
          value={settings.name}
          maxLength={20}
          placeholder="optional"
          aria-label="Your name"
          onChange={(e) => onChange({ ...settings, name: e.target.value })}
        />
      </section>

      <section className="card setting-row">
        <div>
          <h3 className="card-title">Daily goal</h3>
          <p className="muted">Sessions per day.</p>
        </div>
        <div className="stepper">
          <button type="button" aria-label="Fewer sessions" onClick={() => setGoal(settings.dailyGoal - 1)} disabled={settings.dailyGoal <= 1}>
            −
          </button>
          <span aria-live="polite">{settings.dailyGoal}</span>
          <button type="button" aria-label="More sessions" onClick={() => setGoal(settings.dailyGoal + 1)} disabled={settings.dailyGoal >= 8}>
            +
          </button>
        </div>
      </section>

      <section className="card setting-row">
        <div>
          <h3 className="card-title">Sound</h3>
          <p className="muted">Short chime when a session ends.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.sound}
          aria-label="Sound"
          className={`switch ${settings.sound ? "on" : ""}`}
          onClick={() => onChange({ ...settings, sound: !settings.sound })}
        >
          <span />
        </button>
      </section>

      <section className="card">
        <h3 className="card-title">Reset progress</h3>
        <p className="muted">Deletes your XP, plant, streak and history in this browser.</p>
        {confirmReset ? (
          <div className="confirm-buttons left">
            <button type="button" className="btn" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                onReset();
                setConfirmReset(false);
              }}
            >
              Yes, delete everything
            </button>
          </div>
        ) : (
          <button type="button" className="btn" onClick={() => setConfirmReset(true)}>
            Reset…
          </button>
        )}
      </section>

      <p className="about">
        FocusFlow by <a href="https://tuana0410.github.io">Tuana Metdar</a>. Progress is saved only in this browser.
      </p>
    </div>
  );
}
