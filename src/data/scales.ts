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
