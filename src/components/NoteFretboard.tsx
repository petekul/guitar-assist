import { useRef, useState } from 'react'
import { SCALE_ROOTS, NOTE_COLORS } from '../data/scales'
import { playNote } from '../utils/audio'

// ── Layout constants ─────────────────────────────────────────────────────────
const FRET_W = 46
const STRING_GAP = 28
const PAD_T = 28
const PAD_B = 26
const PAD_L = 26
const OPEN_W = 34
const NUT_W = 6
const DOT_R = 11
const INLAY_R = 4

const STRINGS = 6
// High e first (index 0) through low E (index 5) — matches the rest of the app
const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E']
const STRING_WIDTHS = [0.8, 1.0, 1.2, 1.5, 1.8, 2.2]

// Chromatic semitone offset of each open string, relative to C
const OPEN_STRING_SEMITONE = [4, 11, 7, 2, 9, 4]

const SINGLE_INLAYS = [3, 5, 7, 9]
const DOUBLE_INLAY = 12

const C = {
  neck: '#2e1a0c',
  openZone: '#221206',
  nut: '#e8d5b0',
  fret: '#9ca3af',
  string: '#c4b080',
  inlay: '#b8a07060',
  label: '#a89070',
  fretNum: '#6b7280',
}

function sy(stringIndex: number) {
  return PAD_T + stringIndex * STRING_GAP
}

function noteX(fret: number) {
  if (fret === 0) return PAD_L + OPEN_W / 2
  return PAD_L + OPEN_W + NUT_W + (fret - 0.5) * FRET_W
}

function fretWireX(fret: number) {
  return PAD_L + OPEN_W + NUT_W + fret * FRET_W
}

function noteNameAt(stringIndex: number, fret: number): string {
  const semitone = (OPEN_STRING_SEMITONE[stringIndex] + fret) % 12
  return SCALE_ROOTS[semitone]
}

interface Props {
  frets?: number
}

export default function NoteFretboard({ frets = 12 }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const resetTimer = useRef<number | null>(null)

  function handleNoteClick(si: number, fret: number) {
    playNote(si, fret)
    const key = `${si}-${fret}`
    setActiveKey(key)
    if (resetTimer.current) window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setActiveKey(null), 160)
  }

  const svgW = PAD_L + OPEN_W + NUT_W + frets * FRET_W + 12
  const svgH = PAD_T + (STRINGS - 1) * STRING_GAP + PAD_B

  const neckTop = sy(0)
  const neckBottom = sy(STRINGS - 1)
  const neckLeft = PAD_L + OPEN_W
  const neckRight = neckLeft + NUT_W + frets * FRET_W
  const inlayMidY = (sy(1) + sy(3)) / 2

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{ fontFamily: 'ui-monospace, Consolas, monospace', display: 'block' }}
        >
          {/* Neck background */}
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

          {/* Fret wires */}
          {Array.from({ length: frets }, (_, i) => i + 1).map((f) => (
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

          {/* Nut */}
          <rect
            x={neckLeft}
            y={neckTop - 5}
            width={NUT_W}
            height={(STRINGS - 1) * STRING_GAP + 10}
            fill={C.nut}
            rx={2}
          />

          {/* Inlay markers */}
          {SINGLE_INLAYS.filter((f) => f <= frets).map((f) => (
            <circle key={f} cx={noteX(f)} cy={inlayMidY} r={INLAY_R} fill={C.inlay} />
          ))}
          {DOUBLE_INLAY <= frets && (
            <>
              <circle cx={noteX(12)} cy={sy(1) + 5} r={INLAY_R} fill={C.inlay} />
              <circle cx={noteX(12)} cy={sy(4) - 5} r={INLAY_R} fill={C.inlay} />
            </>
          )}

          {/* Strings */}
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

          {/* String labels */}
          {STRING_LABELS.map((label, i) => (
            <text
              key={label + i}
              x={PAD_L - 6}
              y={sy(i) + 4}
              textAnchor="end"
              fontSize={10}
              fill={C.label}
            >
              {label}
            </text>
          ))}

          {/* Fret numbers */}
          {Array.from({ length: frets }, (_, i) => i + 1).map((f) => (
            <text
              key={f}
              x={noteX(f)}
              y={neckBottom + PAD_B - 8}
              textAnchor="middle"
              fontSize={9}
              fill={C.fretNum}
            >
              {f}
            </text>
          ))}

          {/* Every note, all strings × all frets (incl. open), coloured by note name */}
          {STRING_LABELS.map((_, si) =>
            Array.from({ length: frets + 1 }, (_, fret) => {
              const name = noteNameAt(si, fret)
              const color = NOTE_COLORS[name]
              const key = `${si}-${fret}`
              const isActive = activeKey === key
              return (
                <g
                  key={key}
                  onClick={() => handleNoteClick(si, fret)}
                  className="cursor-pointer hover:opacity-80 active:opacity-60"
                  style={{
                    transform: isActive ? 'scale(1.3)' : 'scale(1)',
                    transformOrigin: `${noteX(fret)}px ${sy(si)}px`,
                    transition: isActive ? 'transform 60ms ease-out' : 'transform 160ms ease-out',
                  }}
                >
                  <circle
                    cx={noteX(fret)}
                    cy={sy(si)}
                    r={DOT_R}
                    fill={color}
                    stroke="#00000040"
                    strokeWidth={1}
                  />
                  <text
                    x={noteX(fret)}
                    y={sy(si) + 3.5}
                    textAnchor="middle"
                    fontSize={name.length > 1 ? 8 : 9.5}
                    fontWeight="bold"
                    fill="#0a0a0a"
                    className="pointer-events-none select-none"
                  >
                    {name}
                  </text>
                </g>
              )
            }),
          )}
        </svg>
      </div>

      {/* Legend — note name → colour, fixed regardless of position */}
      <div className="flex flex-wrap gap-2 mt-4">
        {SCALE_ROOTS.map((n) => (
          <div key={n} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: NOTE_COLORS[n] }}
            />
            <span className="text-xs text-gray-400">{n}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
