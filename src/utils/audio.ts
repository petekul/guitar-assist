import { Howl } from 'howler'

// ── Note mapping ──────────────────────────────────────────────────────────────
// Open-string MIDI note numbers for standard tuning (index 0 = high e, 5 = low E)
const OPEN_STRING_MIDI = [64, 59, 55, 50, 45, 40] as const

// Flat notation used by the soundfont CDN filenames (e.g. "Gb" not "F#")
const NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const

export function getMidiNote(stringIndex: number, fret: number): number {
  return OPEN_STRING_MIDI[stringIndex] + fret
}

export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1
  const name = NOTE_NAMES[midi % 12]
  return `${name}${octave}`
}

export function getNoteLabel(stringIndex: number, fret: number): string {
  return midiToNoteName(getMidiNote(stringIndex, fret))
}

// ── Howler sample loader ──────────────────────────────────────────────────────
// Samples sourced from gleitz/midi-js-soundfonts (GitHub Pages, CORS-enabled)
const CDN =
  'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_guitar_nylon-mp3'

// Cache: note name → Howl instance
const cache = new Map<string, Howl>()

let masterVolume = 0.7

function getHowl(noteName: string): Howl {
  if (cache.has(noteName)) return cache.get(noteName)!
  const howl = new Howl({
    src: [`${CDN}/${noteName}.mp3`],
    volume: masterVolume,
    preload: true,
    onloaderror: (_id, err) =>
      console.warn(`[audio] failed to load ${noteName}:`, err),
  })
  cache.set(noteName, howl)
  return howl
}

// ── Public API ────────────────────────────────────────────────────────────────

export function setVolume(v: number) {
  masterVolume = v
  cache.forEach((h) => h.volume(v))
}

/** Play the note produced by pressing `fret` on `stringIndex`. */
export function playNote(stringIndex: number, fret: number): void {
  const noteName = midiToNoteName(getMidiNote(stringIndex, fret))
  const howl = getHowl(noteName)
  // Stop any currently playing instance of this exact note then replay,
  // so rapid re-triggers don't pile up indefinitely.
  howl.stop()
  howl.volume(masterVolume)
  howl.play()
}

/** Play all notes in a chord simultaneously. */
export function playChord(notes: { stringIndex: number; fret: number }[]): void {
  notes.forEach((n) => playNote(n.stringIndex, n.fret))
}

/** Prefetch samples for every unique note in the tab so first-play is instant. */
export function preloadNotes(
  notes: { stringIndex: number; fret: number }[],
): void {
  const seen = new Set<string>()
  for (const { stringIndex, fret } of notes) {
    const name = midiToNoteName(getMidiNote(stringIndex, fret))
    if (!seen.has(name)) {
      seen.add(name)
      getHowl(name) // triggers preload
    }
  }
}

/** Stop all currently playing sounds immediately. */
export function stopAll(): void {
  cache.forEach((h) => h.stop())
}
