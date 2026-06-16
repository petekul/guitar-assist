export interface Progression {
  name: string
  numerals: string[]
  degrees: number[]
  qualities: Array<'major' | 'minor' | 'dim'>
}

// Natural major scale harmonisation: I ii iii IV V vi vii°
export const MAJOR_PROGRESSIONS: Progression[] = [
  {
    name: 'Blues / Rock',
    numerals: ['I', 'IV', 'V'],
    degrees:  [0,   3,   4],
    qualities: ['major', 'major', 'major'],
  },
  {
    name: 'Pop',
    numerals: ['I', 'V', 'vi', 'IV'],
    degrees:  [0,   4,   5,    3],
    qualities: ['major', 'major', 'minor', 'major'],
  },
  {
    name: '50s',
    numerals: ['I', 'vi', 'IV', 'V'],
    degrees:  [0,   5,    3,   4],
    qualities: ['major', 'minor', 'major', 'major'],
  },
  {
    name: 'Jazz ii–V–I',
    numerals: ['ii', 'V', 'I'],
    degrees:  [1,    4,   0],
    qualities: ['minor', 'major', 'major'],
  },
  {
    name: 'Canon',
    numerals: ['I', 'V', 'vi', 'iii', 'IV'],
    degrees:  [0,   4,   5,    2,     3],
    qualities: ['major', 'major', 'minor', 'minor', 'major'],
  },
  {
    name: 'Classic Rock',
    numerals: ['I', 'IV', 'I', 'V'],
    degrees:  [0,   3,   0,   4],
    qualities: ['major', 'major', 'major', 'major'],
  },
]

// Natural minor scale harmonisation: i ii° III iv v VI VII
export const MINOR_PROGRESSIONS: Progression[] = [
  {
    name: 'Minor Pop',
    numerals: ['i', 'VI', 'III', 'VII'],
    degrees:  [0,   5,    2,     6],
    qualities: ['minor', 'major', 'major', 'major'],
  },
  {
    name: 'Minor Rock',
    numerals: ['i', 'VII', 'VI', 'VII'],
    degrees:  [0,   6,     5,   6],
    qualities: ['minor', 'major', 'major', 'major'],
  },
  {
    name: 'Natural Minor',
    numerals: ['i', 'iv', 'VII', 'III'],
    degrees:  [0,   3,    6,     2],
    qualities: ['minor', 'minor', 'major', 'major'],
  },
  {
    name: 'Minor Blues',
    numerals: ['i', 'iv', 'v'],
    degrees:  [0,   3,   4],
    qualities: ['minor', 'minor', 'minor'],
  },
  {
    name: 'Descending',
    numerals: ['i', 'VII', 'VI', 'v'],
    degrees:  [0,   6,     5,   4],
    qualities: ['minor', 'major', 'major', 'minor'],
  },
]

export function resolveChordName(scaleNotes: string[], degree: number, quality: 'major' | 'minor' | 'dim'): string {
  const note = scaleNotes[degree]
  if (quality === 'minor') return `${note}m`
  if (quality === 'dim')   return `${note}dim`
  return note
}
