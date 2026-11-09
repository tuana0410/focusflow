import { useState, type FormEvent } from "react";
import { DURATION_PRESETS, MAX_LABEL_LENGTH, MAX_MINUTES, MIN_MINUTES, cleanLabel, parseMinutes } from "../lib/game";
import { PlayIcon } from "./Icons";

interface Props {
  onStart: (label: string, minutes: number) => void;
}

export function SessionSetup({ onStart }: Props) {
  const [label, setLabel] = useState("");
  const [preset, setPreset] = useState<number | "custom">(25);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);

  // What the big clock shows before starting
  const preview = preset === "custom" ? (parseMinutes(custom).ok ? Number(custom.trim()) : null) : preset;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const check = preset === "custom" ? parseMinutes(custom) : { ok: true as const, minutes: preset };
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setError(null);
    onStart(cleanLabel(label), check.minutes);
  }

  return (
    <form className="setup" onSubmit={handleSubmit} noValidate>
      <p className="big-clock" aria-hidden="true">
        {preview === null ? "--:--" : `${String(preview).padStart(2, "0")}:00`}
      </p>

      <label className="field">
        <span className="field-label">What are you working on?</span>
        <input
          type="text"
          value={label}
          maxLength={MAX_LABEL_LENGTH}
          placeholder="e.g. Numerical methods, chapter 3"
          onChange={(e) => setLabel(e.target.value)}
        />
      </label>

      <fieldset className="field">
        <legend className="field-label">How long?</legend>
        <div className="chips">
          {DURATION_PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              className={`chip ${preset === m ? "is-on" : ""}`}
              aria-pressed={preset === m}
              onClick={() => {
                setPreset(m);
                setError(null);
              }}
            >
              {m}m
            </button>
          ))}
          <button
            type="button"
            className={`chip ${preset === "custom" ? "is-on" : ""}`}
            aria-pressed={preset === "custom"}
            onClick={() => setPreset("custom")}
          >
            custom
          </button>
        </div>

        {preset === "custom" && (
          <label className="custom-row">
            <input
              type="text"
              inputMode="numeric"
              value={custom}
              placeholder={`${MIN_MINUTES}–${MAX_MINUTES}`}
              aria-label="Custom minutes"
              aria-invalid={error !== null}
              aria-describedby={error ? "setup-error" : undefined}
              onChange={(e) => {
                setCustom(e.target.value);
                setError(null);
              }}
              autoFocus
            />
            <span>minutes</span>
          </label>
        )}
      </fieldset>

      {error && (
        <p className="error" id="setup-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="play-btn">
        <span className="play-circle">
          <PlayIcon />
        </span>
        Start focusing
      </button>
    </form>
  );
}
