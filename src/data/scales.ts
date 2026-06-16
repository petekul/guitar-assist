export const SCALE_ROOTS = [
  'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B',
] as const
export type ScaleRoot = (typeof SCALE_ROOTS)[number]

export const MAJOR_SCALES: Record<string, string[]> = {
  C:   ['C',  'D',  'E',  'F',  'G',  'A',  'B' ],
  'C#':['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#'],
  D:   ['D',  'E',  'F#', 'G',  'A',  'B',  'C#'],
  Eb:  ['Eb', 'F',  'G',  'Ab', 'Bb', 'C',  'D' ],
  E:   ['E',  'F#', 'G#', 'A',  'B',  'C#', 'D#'],
  F:   ['F',  'G',  'A',  'Bb', 'C',  'D',  'E' ],
  'F#':['F#', 'G#', 'A#', 'B',  'C#', 'D#', 'E#'],
  G:   ['G',  'A',  'B',  'C',  'D',  'E',  'F#'],
  Ab:  ['Ab', 'Bb', 'C',  'Db', 'Eb', 'F',  'G' ],
  A:   ['A',  'B',  'C#', 'D',  'E',  'F#', 'G#'],
  Bb:  ['Bb', 'C',  'D',  'Eb', 'F',  'G',  'A' ],
  B:   ['B',  'C#', 'D#', 'E',  'F#', 'G#', 'A#'],
}

export const MINOR_SCALES: Record<string, string[]> = {
  C:   ['C',  'D',  'Eb', 'F',  'G',  'Ab', 'Bb'],
  'C#':['C#', 'D#', 'E',  'F#', 'G#', 'A',  'B' ],
  D:   ['D',  'E',  'F',  'G',  'A',  'Bb', 'C' ],
  Eb:  ['Eb', 'F',  'Gb', 'Ab', 'Bb', 'Cb', 'Db'],
  E:   ['E',  'F#', 'G',  'A',  'B',  'C',  'D' ],
  F:   ['F',  'G',  'Ab', 'Bb', 'C',  'Db', 'Eb'],
  'F#':['F#', 'G#', 'A',  'B',  'C#', 'D',  'E' ],
  G:   ['G',  'A',  'Bb', 'C',  'D',  'Eb', 'F' ],
  Ab:  ['Ab', 'Bb', 'Cb', 'Db', 'Eb', 'Fb', 'Gb'],
  A:   ['A',  'B',  'C',  'D',  'E',  'F',  'G' ],
  Bb:  ['Bb', 'C',  'Db', 'Eb', 'F',  'Gb', 'Ab'],
  B:   ['B',  'C#', 'D',  'E',  'F#', 'G',  'A' ],
}

export const SCALE_DEGREES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const

// For each natural note that has a sharp neighbour, maps to its display label and
// the data key used in MAJOR_SCALES / MINOR_SCALES (flat spelling where conventional).
export const SHARP_VARIANTS: Record<string, { label: string; dataKey: string }> = {
  C: { label: 'C#', dataKey: 'C#' },
  D: { label: 'D#', dataKey: 'Eb' },
  F: { label: 'F#', dataKey: 'F#' },
  G: { label: 'G#', dataKey: 'Ab' },
  A: { label: 'A#', dataKey: 'Bb' },
}
