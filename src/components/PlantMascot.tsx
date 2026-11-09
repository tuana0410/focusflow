// The plant mascot, drawn as an SVG illustration.
// It has 6 growth stages and a sad "wilted" look after giving up.

interface Props {
  stage: number; // 0..5
  wilted: boolean;
  label: string;
}

const INK = "#1d1b1b";

const HEALTHY = { leaf: "#7cc576", leafDark: "#4f9a57", crown: "#7cc576", stem: "#4f9a57", flower: "#ef7a96" };
const WILTED = { leaf: "#c2b86e", leafDark: "#9a8f4b", crown: "#bfb46a", stem: "#9a8f4b", flower: "#c9a3ae" };

type Palette = typeof HEALTHY;

/** A leaf starting at (x, y), pointing at `angle` degrees, `len` px long. */
function Leaf({ x, y, angle, len, c }: { x: number; y: number; angle: number; len: number; c: Palette }) {
  const w = len * 0.34;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path
        d={`M0 0 C${len * 0.25} ${-w} ${len * 0.75} ${-w} ${len} 0 C${len * 0.75} ${w} ${len * 0.25} ${w} 0 0 Z`}
        fill={c.leaf}
        stroke={INK}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
      <path d={`M2 0 L${len * 0.78} 0`} stroke={c.leafDark} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  );
}

/** A stem drawn as a thick dark line with a thinner colored line on top. */
function Stem({ d, c, width = 5 }: { d: string; c: Palette; width?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={INK} strokeWidth={width + 5} strokeLinecap="round" />
      <path d={d} fill="none" stroke={c.stem} strokeWidth={width} strokeLinecap="round" />
    </>
  );
}

/** Several circles merged into one leafy crown with a single outline. */
function Crown({ circles, c }: { circles: [number, number, number][]; c: Palette }) {
  return (
    <>
      {circles.map(([x, y, r], i) => (
        <circle key={`o${i}`} cx={x} cy={y} r={r} fill={INK} stroke={INK} strokeWidth={8} />
      ))}
      {circles.map(([x, y, r], i) => (
        <circle key={`f${i}`} cx={x} cy={y} r={r} fill={c.crown} />
      ))}
      {circles.slice(0, 3).map(([x, y, r], i) => (
        <ellipse key={`h${i}`} cx={x - r * 0.35} cy={y - r * 0.4} rx={r * 0.28} ry={r * 0.16} fill="#fff" opacity={0.35} />
      ))}
    </>
  );
}

function Flower({ x, y, c }: { x: number; y: number; c: Palette }) {
  const petals = [0, 72, 144, 216, 288].map((a) => {
    const rad = (a * Math.PI) / 180;
    return [x + Math.sin(rad) * 7, y - Math.cos(rad) * 7];
  });
  return (
    <g>
      {petals.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={6} fill={c.flower} stroke={INK} strokeWidth={3} />
      ))}
      <circle cx={x} cy={y} r={4.5} fill="#f7b538" stroke={INK} strokeWidth={3} />
    </g>
  );
}

function PlantStage({ stage, c }: { stage: number; c: Palette }) {
  switch (stage) {
    case 0:
      return (
        <g>
          <ellipse cx={100} cy={132} rx={10} ry={7} transform="rotate(-20 100 132)" fill="#a0703f" stroke={INK} strokeWidth={3.5} />
          <path d="M120 112 l0 -8 M116 108 l8 0 M80 118 l0 -6 M77 115 l6 0" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    case 1:
      return (
        <g>
          <Stem d="M100 142 Q97 124 100 108" c={c} />
          <Leaf x={99} y={110} angle={-150} len={30} c={c} />
          <Leaf x={101} y={110} angle={-30} len={30} c={c} />
        </g>
      );
    case 2:
      return (
        <g>
          <Stem d="M100 142 Q95 108 102 70" c={c} />
          <Leaf x={98} y={124} angle={-165} len={28} c={c} />
          <Leaf x={99} y={112} angle={-18} len={30} c={c} />
          <Leaf x={99} y={96} angle={-155} len={30} c={c} />
          <Leaf x={101} y={86} angle={-25} len={28} c={c} />
          <Leaf x={102} y={72} angle={-95} len={24} c={c} />
        </g>
      );
    case 3:
      return (
        <g>
          <Stem d="M100 142 Q97 118 100 92" c={c} width={6} />
          <Crown circles={[[100, 74, 30], [74, 90, 20], [126, 90, 20], [84, 56, 20], [116, 56, 20]]} c={c} />
        </g>
      );
    case 4:
      return (
        <g>
          <Stem d="M100 142 Q97 118 100 92" c={c} width={6} />
          <Crown circles={[[100, 72, 32], [72, 90, 21], [128, 90, 21], [82, 52, 21], [118, 52, 21]]} c={c} />
          <Flower x={80} y={64} c={c} />
          <Flower x={120} y={78} c={c} />
          <Flower x={102} y={44} c={c} />
        </g>
      );
    default:
      return (
        <g>
          <Stem d="M100 142 L100 96 M100 112 L84 98 M100 106 L116 92" c={{ ...c, stem: "#9c6b45" }} width={10} />
          <Crown circles={[[100, 62, 40], [62, 84, 27], [138, 84, 27], [70, 44, 25], [130, 44, 25], [100, 26, 24]]} c={c} />
          <Flower x={72} y={56} c={c} />
          <Flower x={128} y={50} c={c} />
          <Flower x={100} y={30} c={c} />
          <Flower x={60} y={88} c={c} />
          <Flower x={140} y={90} c={c} />
          <circle cx={104} cy={82} r={7} fill="#f08a4b" stroke={INK} strokeWidth={3} />
        </g>
      );
  }
}

function Face({ wilted }: { wilted: boolean }) {
  if (wilted) {
    return (
      <g stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none">
        <path d="M76 175 Q82 170 88 175" />
        <path d="M112 175 Q118 170 124 175" />
        <path d="M90 192 Q100 184 110 192" />
        <path d="M132 160 q5 8 0 11 q-5 -3 0 -11 Z" fill="#8ecae6" strokeWidth={2.5} />
      </g>
    );
  }
  return (
    <g>
      <circle cx={82} cy={174} r={5.5} fill={INK} />
      <circle cx={118} cy={174} r={5.5} fill={INK} />
      <circle cx={84} cy={172} r={1.8} fill="#fff" />
      <circle cx={120} cy={172} r={1.8} fill="#fff" />
      <ellipse className="cheek" cx={68} cy={184} rx={8} ry={4.5} fill="#ef7a96" opacity={0.85} />
      <ellipse className="cheek" cx={132} cy={184} rx={8} ry={4.5} fill="#ef7a96" opacity={0.85} />
      <path d="M91 184 Q100 194 109 184" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
    </g>
  );
}

export function PlantMascot({ stage, wilted, label }: Props) {
  const c = wilted ? WILTED : HEALTHY;
  return (
    <svg className={`mascot ${wilted ? "is-wilted" : ""}`} viewBox="0 0 200 220" role="img" aria-label={label}>
      {/* soil */}
      <ellipse cx={100} cy={138} rx={50} ry={8} fill="#6b4a3a" stroke={INK} strokeWidth={4} />
      {/* plant, tilted a little when wilted */}
      <g className="mascot-plant" transform={wilted ? "rotate(-7 100 140) translate(0 4)" : undefined}>
        <PlantStage stage={stage} c={c} />
      </g>
      {/* pot */}
      <rect className="pot-rim" x={42} y={136} width={116} height={24} rx={9} fill="#2f6f68" stroke={INK} strokeWidth={4} />
      <path className="pot-body" d="M52 160 L148 160 L139 206 Q138 212 132 212 L68 212 Q62 212 61 206 Z" fill="#3f8f86" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <Face wilted={wilted} />
    </svg>
  );
}
