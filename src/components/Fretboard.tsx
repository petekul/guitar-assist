import type { TabNote } from '../utils/tabParser'

// ── Layout constants ─────────────────────────────────────────────────────────
const FRET_W = 56       // px per fret cell
const STRING_GAP = 32   // px between strings
const PAD_T = 36        // above top string (space for inlay markers)
const PAD_B = 36        // below bottom string (space for fret numbers)
const PAD_L = 30        // left of nut (string labels)
const OPEN_W = 40       // width of the open-string zone (left of nut)
const NUT_W = 7         // nut bar thickness
const DOT_R = 12        // active note dot radius
const INLAY_R = 5       // fretboard inlay marker radius

const STRINGS = 6
const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E']
// String thicknesses: high e thinnest, low E thickest
const STRING_WIDTHS = [0.8, 1.0, 1.2, 1.5, 1.8, 2.2]

// Standard fretboard inlay positions
const SINGLE_INLAYS = [3, 5, 7, 9]
const DOUBLE_INLAY = 12

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  neck: '#2e1a0c',        // dark walnut
  neckEdge: '#1a0f05',    // darker edge
  openZone: '#221206',    // open-string area
  nut: '#e8d5b0',         // bone
  fret: '#9ca3af',        // silver-grey
  string: '#c4b080',      // metallic wound-string colour
  inlay: '#b8a07060',     // cream inlay, semi-transparent
  label: '#a89070',       // string label text
  fretNum: '#6b7280',     // fret number text
  noteFill: '#f59e0b',    // amber dot
  noteStroke: '#b45309',  // darker amber ring
  noteText: '#1a0a00',    // dark text inside dot
  openDot: '#fcd34d',     // slightly lighter for open-string dots
}

// ── Coordinate helpers ────────────────────────────────────────────────────────
function sy(stringIndex: number) {
  return PAD_T + stringIndex * STRING_GAP
}

// X centre of a note at `fret` (0 = open, 1-N = fret cells)
function noteX(fret: number) {
  if (fret === 0) return PAD_L + OPEN_W / 2
  return PAD_L + OPEN_W + NUT_W + (fret - 0.5) * FRET_W
}

// X of the right edge of a fret wire (fret 0 = nut right edge)
function fretWireX(fret: number) {
  return PAD_L + OPEN_W + NUT_W + fret * FRET_W
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  activeNotes: TabNote[]
  maxFret: number           // highest fret to render (minimum 12)
  prevNotes?: TabNote[]     // faded ghost of the previous frame
}

export default function Fretboard({ activeNotes, maxFret, prevNotes = [] }: Props) {
  const displayFrets = Math.max(maxFret, 12)

  const svgW = PAD_L + OPEN_W + NUT_W + displayFrets * FRET_W + 12
  const svgH = PAD_T + (STRINGS - 1) * STRING_GAP + PAD_B

  const neckTop = sy(0)
  const neckBottom = sy(STRINGS - 1)
  const neckLeft = PAD_L + OPEN_W
  const neckRight = neckLeft + NUT_W + displayFrets * FRET_W

  // Centre y between B (1) and D (3) for single inlays
  const inlayMidY = (sy(1) + sy(3)) / 2

  // Active note lookup: Map<`${si}-${fret}`, true>
  const activeSet = new Set(activeNotes.map((n) => `${n.stringIndex}-${n.fret}`))
  const prevSet = new Set(prevNotes.map((n) => `${n.stringIndex}-${n.fret}`))

  return (
    <div className="overflow-x-auto">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ fontFamily: 'ui-monospace, Consolas, monospace', display: 'block' }}
      >
        {/* ── Neck background ── */}
        <rect
          x={neckLeft}
          y={neckTop - 4}
          width={neckRight - neckLeft}
          height={(STRINGS - 1) * STRING_GAP + 8}
          fill={C.neck}
          rx={3}
        />
        {/* Open-string zone */}
        <rect
          x={PAD_L}
          y={neckTop - 4}
          width={OPEN_W}
          height={(STRINGS - 1) * STRING_GAP + 8}
          fill={C.openZone}
          rx={3}
        />
        {/* Subtle wood-grain gradient overlay */}
        <defs>
          <linearGradient id="grain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,200,100,0.05)" />
            <stop offset="50%" stopColor="rgba(0,0,0,0.0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
          </linearGradient>
        </defs>
        <rect
          x={neckLeft}
          y={neckTop - 4}
          width={neckRight - neckLeft}
          height={(STRINGS - 1) * STRING_GAP + 8}
          fill="url(#grain)"
          rx={3}
        />

        {/* ── Fret wires ── */}
        {Array.from({ length: displayFrets }, (_, i) => i + 1).map((f) => (
          <rect
            key={f}
            x={fretWireX(f) - 1}
            y={neckTop - 3}
            width={2}
            height={(STRINGS - 1) * STRING_GAP + 6}
            fill={C.fret}
            rx={1}
          />
        ))}

        {/* ── Nut ── */}
        <rect
          x={neckLeft}
          y={neckTop - 5}
          width={NUT_W}
          height={(STRINGS - 1) * STRING_GAP + 10}
          fill={C.nut}
          rx={2}
        />

        {/* ── Inlay markers ── */}
        {SINGLE_INLAYS.filter((f) => f <= displayFrets).map((f) => (
          <circle key={f} cx={noteX(f)} cy={inlayMidY} r={INLAY_R} fill={C.inlay} />
        ))}
        {DOUBLE_INLAY <= displayFrets && (
          <>
            <circle cx={noteX(12)} cy={sy(1) + 6} r={INLAY_R} fill={C.inlay} />
            <circle cx={noteX(12)} cy={sy(4) - 6} r={INLAY_R} fill={C.inlay} />
          </>
        )}
        {/* Additional inlays for >12 frets */}
        {[15, 17, 19, 21].filter((f) => f <= displayFrets).map((f) => (
          <circle key={f} cx={noteX(f)} cy={inlayMidY} r={INLAY_R} fill={C.inlay} />
        ))}
        {24 <= displayFrets && (
          <>
            <circle cx={noteX(24)} cy={sy(1) + 6} r={INLAY_R} fill={C.inlay} />
            <circle cx={noteX(24)} cy={sy(4) - 6} r={INLAY_R} fill={C.inlay} />
          </>
        )}

        {/* ── Strings ── */}
        {STRING_LABELS.map((_, i) => (
          <line
            key={i}
            x1={PAD_L}
            y1={sy(i)}
            x2={neckRight + 4}
            y2={sy(i)}
            stroke={C.string}
            strokeWidth={STRING_WIDTHS[i]}
          />
        ))}

        {/* ── String labels ── */}
        {STRING_LABELS.map((label, i) => (
          <text
            key={label + i}
            x={PAD_L - 6}
            y={sy(i) + 4}
            textAnchor="end"
            fontSize={11}
            fill={C.label}
          >
            {label}
          </text>
        ))}

        {/* ── Fret numbers ── */}
        {Array.from({ length: displayFrets }, (_, i) => i + 1).map((f) => (
          <text
            key={f}
            x={noteX(f)}
            y={neckBottom + PAD_B - 10}
            textAnchor="middle"
            fontSize={10}
            fill={C.fretNum}
          >
            {f}
          </text>
        ))}

        {/* ── Ghost notes (previous frame) ── */}
        {prevNotes
          .filter((n) => !activeSet.has(`${n.stringIndex}-${n.fret}`))
          .map((n) => (
            <circle
              key={`ghost-${n.stringIndex}-${n.fret}`}
              cx={noteX(n.fret)}
              cy={sy(n.stringIndex)}
              r={DOT_R - 2}
              fill="none"
              stroke={C.noteFill}
              strokeWidth={1}
              opacity={0.3}
            />
          ))}

        {/* ── Active note dots ── */}
        {activeNotes.map((n) => {
          const isNew = !prevSet.has(`${n.stringIndex}-${n.fret}`)
          return (
            <g key={`note-${n.stringIndex}-${n.fret}`}>
              {/* Glow ring for new notes */}
              {isNew && (
                <circle
                  cx={noteX(n.fret)}
                  cy={sy(n.stringIndex)}
                  r={DOT_R + 4}
                  fill={C.noteFill}
                  opacity={0.2}
                />
              )}
              <circle
                cx={noteX(n.fret)}
                cy={sy(n.stringIndex)}
                r={DOT_R}
                fill={n.fret === 0 ? C.openDot : C.noteFill}
                stroke={C.noteStroke}
                strokeWidth={1.5}
              />
              <text
                x={noteX(n.fret)}
                y={sy(n.stringIndex) + 4}
                textAnchor="middle"
                fontSize={n.fret >= 10 ? 8 : 10}
                fontWeight="bold"
                fill={C.noteText}
              >
                {n.fret === 0 ? 'O' : n.fret}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
