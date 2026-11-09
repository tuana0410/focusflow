// Small line icons used across the app. All use the current text color.

type IconProps = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const TimerIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 9.5v4l2.5 2M9.5 2.5h5M12 2.5V6" />
  </svg>
);

export const ChartIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 20h16M6.5 20V12M11 20V5M15.5 20V9M20 20v-6" />
  </svg>
);

export const SlidersIcon = ({ size = 22 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2.3" />
    <circle cx="9" cy="17" r="2.3" />
  </svg>
);

export const FlameIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)} fill="#f08a4b">
    <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.2 1.2-3.6 2.4-4.6.2 1.6.9 2.6 1.9 3.1C11 9 11.3 6 12 3Z" />
  </svg>
);

export const StarIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)} fill="#f7b538">
    <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.5-4.2 6.1-.8Z" />
  </svg>
);

export const PlayIcon = ({ size = 28 }: IconProps) => (
  <svg {...base(size)} fill="currentColor">
    <path d="M8 5.5v13l11-6.5Z" />
  </svg>
);

/** A small leaf used for the daily goal. Filled when the session is done. */
export const LeafDot = ({ done }: { done: boolean }) => (
  <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
    <path
      d="M5 25 C5 12 12 5 25 5 C25 18 18 25 5 25 Z"
      fill={done ? "#7cc576" : "#fff"}
      stroke="#1d1b1b"
      strokeWidth="2.6"
      strokeLinejoin="round"
    />
    <path d="M7 23 L19 11" stroke={done ? "#4f9a57" : "#c9c2b0"} strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);
