import guitarDb from '@tombatossals/chords-db/lib/guitar.json'

export interface ChordPosition {
  frets: number[]
  fingers: number[]
  baseFret: number
  barres: number[]
  capo?: boolean
}

export interface ChordEntry {
  key: string
  suffix: string
  positions: ChordPosition[]
}

export type GuitarDb = typeof guitarDb

// Keys available in the DB (guitar.json uses these names)
export const NOTE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
export type NoteKey = (typeof NOTE_KEYS)[number]

// Map URL-friendly note name to DB key name
const NOTE_TO_DB_KEY: Record<string, keyof typeof guitarDb.chords> = {
  C: 'C',
  D: 'D',
  E: 'E',
  F: 'F',
  G: 'G',
  A: 'A',
  B: 'B',
}

// Suffixes to display on the chord pages (matching the original app's selection)
export const CHORD_SUFFIXES = [
  'major',
  'minor',
  '6',
  'm6',
  '69',
  '7',
  'm7',
  'maj7',
  '7b5',
  'aug7',
  'm7b5',
  '7b9',
  '9',
  'm9',
  'maj9',
  'add9',
  '13',
  'sus2',
  'sus4',
  'dim',
  'dim7',
  'aug',
] as const

// Display name for a given suffix
export function suffixLabel(suffix: string): string {
  if (suffix === 'major') return ''
  if (suffix === 'minor') return 'm'
  return suffix
}

// Full chord display name e.g. "Am7", "Cmaj7", "A" (major)
export function chordName(key: string, suffix: string): string {
  return key + suffixLabel(suffix)
}

export function getChordsForNote(note: string): ChordEntry[] {
  const dbKey = NOTE_TO_DB_KEY[note]
  if (!dbKey) return []
  const all = guitarDb.chords[dbKey] as ChordEntry[]
  return CHORD_SUFFIXES.map((s) => all.find((c) => c.suffix === s)).filter(
    Boolean,
  ) as ChordEntry[]
}

export function getChordEntry(
  note: string,
  suffix: string,
): ChordEntry | undefined {
  const dbKey = NOTE_TO_DB_KEY[note]
  if (!dbKey) return undefined
  const all = guitarDb.chords[dbKey] as ChordEntry[]
  return all.find((c) => c.suffix === suffix)
}

export const guitarInstrument = guitarDb.main
