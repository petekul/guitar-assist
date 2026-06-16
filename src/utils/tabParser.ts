// Parses guitar tab text into a normalised 6-string tab.
//
// Strings are mapped by position, not by label name.  The top line in each
// tab block becomes string 0 (high e), the next string 1 (B), and so on.
// This means tabs that use "E|" for both the top and bottom string work
// correctly — label characters are stripped but never used for ordering.
//
// A "block" is a run of up to 6 consecutive tab lines.  Any non-tab line
// (lyrics, headers, blank lines) ends the current block.  All blocks are
// then stitched into one continuous 6-string tab.

const STRING_ORDER = ['e', 'B', 'G', 'D', 'A', 'E'] as const

// A line is a tab line if it has a 1-char label, then | or -, then content
// that contains at least one dash or digit (rules out chord names like "Am-").
function isTabLine(line: string): boolean {
  const t = line.trim()
  if (t.length < 3) return false
  const sep = t[1]
  if (sep !== '|' && sep !== '-') return false
  const body = sep === '|' ? t.slice(2) : t.slice(1)
  return body.includes('-') || /\d/.test(body)
}

// Strips the 1-char label and any leading | to get raw tab content.
function extractContent(line: string): string {
  const t = line.trim()
  const rest = t.slice(1)
  return rest.startsWith('|') ? rest.slice(1) : rest
}

export function parseTab(rawTab: string): string {
  const lines = rawTab.split(/\r?\n/)

  // Collect blocks: each block is an ordered array of content strings,
  // one per string line, in the order they appear (top → bottom).
  const blocks: string[][] = []
  let current: string[] = []

  for (const line of lines) {
    if (!isTabLine(line)) {
      if (current.length > 0) { blocks.push(current); current = [] }
      continue
    }
    // Reaching 6 lines means we've finished one full block; start the next.
    if (current.length >= 6) { blocks.push(current); current = [] }
    current.push(extractContent(line))
  }
  if (current.length > 0) blocks.push(current)

  if (blocks.length === 0) return rawTab

  // Concatenate all blocks into one long tab.
  // Index 0 = top string (high e), index 5 = bottom string (low E).
  const result = ['', '', '', '', '', '']

  for (const block of blocks) {
    const maxLen = Math.max(0, ...block.map((c) => c.length))
    for (let i = 0; i < 6; i++) {
      result[i] += (block[i] ?? '-'.repeat(maxLen)).padEnd(maxLen, '-')
    }
  }

  return STRING_ORDER.map((s, i) => `${s}|${result[i]}`).join('\n')
}

// ── Frame parser ────────────────────────────────────────────────────────────
// Converts the cleaned 6-string tab (output of parseTab) into a sequence of
// "frames" – each frame being the set of notes played at one moment in time.

// Post-processes frames to insert synthetic intermediate frames for slides.
// For each slide-destination frame, looks up the last note on the same string,
// walks every fret between source and destination, and injects a frame per step.
// Also marks the source frame so the playback engine can apply pre-slide timing.
function insertSlideFrames(frames: TabFrame[]): TabFrame[] {
  const result: TabFrame[] = []
  const lastFretPerString: (number | null)[] = new Array(6).fill(null)

  for (const frame of frames) {
    const slideDestNotes = frame.notes.filter((n) => n.slideDestination)

    if (slideDestNotes.length === 0) {
      for (const n of frame.notes) lastFretPerString[n.stringIndex] = n.fret
      result.push(frame)
      continue
    }

    // Collect intermediate frets for every sliding string
    const intermsByString = new Map<number, number[]>()
    for (const note of slideDestNotes) {
      const src = lastFretPerString[note.stringIndex]
      if (src === null || src === note.fret) continue
      const dir = note.fret > src ? 1 : -1
      const ints: number[] = []
      for (let f = src + dir; f !== note.fret; f += dir) ints.push(f)
      if (ints.length > 0) intermsByString.set(note.stringIndex, ints)
    }

    if (intermsByString.size > 0) {
      // Mark the nearest non-synthetic preceding frame on any slide string as the source
      for (let ri = result.length - 1; ri >= 0; ri--) {
        const pf = result[ri]
        if (pf.slideIntermediate) continue
        if (pf.notes.some((n) => intermsByString.has(n.stringIndex))) {
          result[ri] = {
            ...pf,
            slideSource: true,
            notes: pf.notes.map((n) =>
              intermsByString.has(n.stringIndex) ? { ...n, slideSource: true } : n
            ),
          }
          break
        }
      }

      // One frame per intermediate step (aligned across all sliding strings)
      const maxLen = Math.max(...[...intermsByString.values()].map((a) => a.length))
      for (let idx = 0; idx < maxLen; idx++) {
        const notes: TabNote[] = []
        intermsByString.forEach((ints, si) => {
          if (idx < ints.length) notes.push({ stringIndex: si, fret: ints[idx], slideIntermediate: true })
        })
        result.push({ notes, col: frame.col, slideIntermediate: true })
      }
    }

    for (const n of frame.notes) lastFretPerString[n.stringIndex] = n.fret
    result.push(frame)
  }

  return result
}

export interface TabNote {
  stringIndex: number        // 0 = high e, 1 = B, 2 = G, 3 = D, 4 = A, 5 = low E
  fret: number               // 0 = open string
  hammerOn?: boolean         // destination of a hammer-on (preceded by 'h')
  slideSource?: boolean      // this note starts a slide
  slideIntermediate?: boolean // synthetic note inserted between slide source and destination
  slideDestination?: boolean  // destination of a slide (preceded by '/' or '\')
}

export interface TabFrame {
  notes: TabNote[]
  col: number
  hammerOn?: boolean
  slideSource?: boolean
  slideIntermediate?: boolean
  slideDestination?: boolean
}

export function parseTabToFrames(parsedTab: string): TabFrame[] {
  const lines = parsedTab.split('\n')

  // Extract raw content per string, stripping the 2-char "X|" prefix
  const contents = STRING_ORDER.map((s) => {
    const line = lines.find((l) => l.startsWith(s + '|'))
    return line ? line.slice(2) : ''
  })

  // Gather every note with its start column and which string it's on
  type RawNote = { col: number; stringIndex: number; fret: number; hammerOn: boolean; slideDestination: boolean }
  const all: RawNote[] = []

  contents.forEach((content, si) => {
    let i = 0
    while (i < content.length) {
      const ch = content[i]
      if (ch >= '0' && ch <= '9') {
        const nx = content[i + 1] ?? ''
        const prevCh = i > 0 ? content[i - 1] : ''
        const hammerOn = prevCh === 'h' || prevCh === 'H' || prevCh === 'p' || prevCh === 'P'
        const slideDestination = prevCh === '/' || prevCh === '\\'
        if (nx >= '0' && nx <= '9') {
          all.push({ col: i, stringIndex: si, fret: parseInt(ch + nx, 10), hammerOn, slideDestination })
          i += 2
        } else {
          all.push({ col: i, stringIndex: si, fret: parseInt(ch, 10), hammerOn, slideDestination })
          i++
        }
      } else {
        i++
      }
    }
  })

  // Sort by column first, then string index
  all.sort((a, b) => a.col - b.col || a.stringIndex - b.stringIndex)

  // Group notes within 1 column of each other into the same frame
  // (handles multi-digit fret numbers that shift sibling strings by 1 column)
  const frames: TabFrame[] = []
  let i = 0
  while (i < all.length) {
    const refCol = all[i].col
    const notes: TabNote[] = []
    while (i < all.length && all[i].col <= refCol + 1) {
      notes.push({ stringIndex: all[i].stringIndex, fret: all[i].fret, hammerOn: all[i].hammerOn, slideDestination: all[i].slideDestination })
      i++
    }
    frames.push({
      notes,
      col: refCol,
      hammerOn: notes.some((n) => n.hammerOn),
      slideDestination: notes.some((n) => n.slideDestination),
    })
  }

  return insertSlideFrames(frames)
}

export interface SavedTab {
  id: string
  songName: string
  tab: string
  capo: number
  savedAt: string
}

const STORAGE_KEY = 'guitar_saved_tabs'

export function loadSavedTabs(): SavedTab[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveTab(tab: SavedTab): void {
  const tabs = loadSavedTabs()
  const existing = tabs.findIndex((t) => t.id === tab.id)
  if (existing >= 0) {
    tabs[existing] = tab
  } else {
    tabs.unshift(tab)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs))
}

export function deleteTab(id: string): void {
  const tabs = loadSavedTabs().filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs))
}
