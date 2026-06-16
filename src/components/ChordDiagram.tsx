import type { ChordPosition } from '../data/chords'

interface Props {
  position: ChordPosition
  label: string
  size?: number
}

const STRINGS = 6
const FRETS_SHOWN = 4
const PAD_LEFT = 28
const PAD_TOP = 30
const PAD_BOTTOM = 12
const STRING_GAP = 18
const FRET_GAP = 20
const DOT_R = 7
const NUT_H = 5

const GRID_W = (STRINGS - 1) * STRING_GAP
const GRID_H = FRETS_SHOWN * FRET_GAP
const SVG_W = PAD_LEFT + GRID_W + 16
const SVG_H = PAD_TOP + GRID_H + PAD_BOTTOM

const sx = (i: number) => PAD_LEFT + i * STRING_GAP
const fy = (f: number) => PAD_TOP + f * FRET_GAP

export default function ChordDiagram({ position, label, size = 1 }: Props) {
  const { frets, fingers, barres, baseFret } = position
  const showNut = baseFret === 1

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm font-semibold text-white leading-none">
        {label}
      </span>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W * size}
        height={SVG_H * size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Open / muted string indicators */}
        {frets.map((fret, i) => {
          if (fret === 0) {
            return (
              <text
                key={i}
                x={sx(i)}
                y={PAD_TOP - 12}
                textAnchor="middle"
                fontSize={12}
                fill="#e2e8f0"
              >
                O
              </text>
            )
          }
          if (fret === -1) {
            return (
              <text
                key={i}
                x={sx(i)}
                y={PAD_TOP - 12}
                textAnchor="middle"
                fontSize={12}
                fill="#e2e8f0"
              >
                ✕
              </text>
            )
          }
          return null
        })}

        {/* Nut or baseFret label */}
        {showNut ? (
          <rect
            x={PAD_LEFT}
            y={PAD_TOP - NUT_H}
            width={GRID_W}
            height={NUT_H}
            fill="#e2e8f0"
            rx={1}
          />
        ) : (
          <text
            x={PAD_LEFT - 5}
            y={PAD_TOP + FRET_GAP / 2 + 4}
            textAnchor="end"
            fontSize={11}
            fill="#cbd5e1"
          >
            {baseFret}fr
          </text>
        )}

        {/* Fret lines */}
        {Array.from({ length: FRETS_SHOWN + 1 }, (_, f) => (
          <line
            key={f}
            x1={PAD_LEFT}
            y1={fy(f)}
            x2={PAD_LEFT + GRID_W}
            y2={fy(f)}
            stroke="#64748b"
            strokeWidth={1}
          />
        ))}

        {/* String lines */}
        {Array.from({ length: STRINGS }, (_, i) => (
          <line
            key={i}
            x1={sx(i)}
            y1={PAD_TOP}
            x2={sx(i)}
            y2={PAD_TOP + GRID_H}
            stroke="#94a3b8"
            strokeWidth={1.5}
          />
        ))}

        {/* Barre bars */}
        {barres.map((barreFret) => {
          // Find leftmost and rightmost string covered by this barre
          const covered = frets
            .map((f, i) => ({ f, i }))
            .filter(({ f }) => f === barreFret)
          if (covered.length < 2) return null
          const leftStr = covered[0].i
          const rightStr = covered[covered.length - 1].i
          const y = fy(barreFret - 1) + FRET_GAP / 2
          return (
            <rect
              key={barreFret}
              x={sx(leftStr) - DOT_R}
              y={y - DOT_R}
              width={sx(rightStr) - sx(leftStr) + DOT_R * 2}
              height={DOT_R * 2}
              rx={DOT_R}
              fill="#f59e0b"
            />
          )
        })}

        {/* Finger dots */}
        {frets.map((fret, i) => {
          if (fret <= 0) return null
          if (barres.includes(fret)) return null
          const x = sx(i)
          const y = fy(fret - 1) + FRET_GAP / 2
          const finger = fingers[i]
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={DOT_R} fill="#f59e0b" />
              {finger > 0 && (
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#1f2937"
                >
                  {finger}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
