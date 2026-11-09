import type { ComponentType } from "react";
import { ChartIcon, SlidersIcon, TimerIcon } from "./Icons";

export type Tab = "focus" | "progress" | "settings";

const TABS: { id: Tab; label: string; Icon: ComponentType }[] = [
  { id: "focus", label: "Focus", Icon: TimerIcon },
  { id: "progress", label: "Progress", Icon: ChartIcon },
  { id: "settings", label: "Settings", Icon: SlidersIcon },
];

interface Props {
  tab: Tab;
  onChange: (tab: Tab) => void;
}

export function BottomNav({ tab, onChange }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={tab === id ? "is-on" : ""}
          aria-current={tab === id ? "page" : undefined}
          onClick={() => onChange(id)}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
