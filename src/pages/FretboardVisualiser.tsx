import { useSearchParams, Link } from 'react-router-dom'
import { useState, useMemo, useEffect, useRef } from 'react'
import Fretboard from '../components/Fretboard'
import { parseTab, parseTabToFrames, saveTab, type SavedTab } from '../utils/tabParser'
import {
  playChord,
  preloadNotes,
  stopAll,
  setVolume,
  getNoteLabel,
} from '../utils/audio'

// ── Tab text with sliding window and highlighted cursor ──────────────────────
const STRING_ORDER = ['e', 'B', 'G', 'D', 'A', 'E']

function TabWindow({ tab, col }: { tab: string; col: number }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const charRef = useRef<HTMLSpanElement>(null)
  const [windowHalf, setWindowHalf] = useState(36)

  useEffect(() => {
    const wrap = wrapRef.current
    const char = charRef.current
    if (!wrap || !char) return
    const measure = () => {
      const charW = char.getBoundingClientRect().width
      if (charW > 0) setWindowHalf(Math.max(10, Math.floor(wrap.clientWidth / charW / 2) - 2))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  const lines = tab.split('\n')
  const contentLen = Math.max(...lines.map((l) => l.slice(2).length))
  const start = Math.max(0, col - windowHalf)
  const end = Math.min(contentLen, col + windowHalf)
  const hl = col - start

  return (
    <div ref={wrapRef}>
      {/* Hidden single char used to measure monospace character width */}
      <span ref={charRef} className="tab-display text-xs absolute invisible pointer-events-none" aria-hidden>X</span>
      <pre className="tab-display text-xs leading-relaxed select-none">
        {lines.map((line, i) => {
          const label = line.slice(0, 2)
          const content = line.slice(2)
          const win = content.slice(start, end)
          const before = win.slice(0, hl)
          const cursor = win.slice(hl, hl + 2)
          const after = win.slice(hl + 2)
          return (
            <span key={i}>
              <span className="text-gray-600">{label}</span>
              <span className="text-green-500">{before}</span>
              <span className="bg-amber-500 text-gray-950 rounded-sm">{cursor}</span>
              <span className="text-green-500">{after}</span>
              {'\n'}
            </span>
          )
        })}
      </pre>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function FretboardVisualiser() {
  const [searchParams] = useSearchParams()
  const rawTab = searchParams.get('tab') ?? ''
  const songName = searchParams.get('songName') ?? ''
  const capo = Number(searchParams.get('capo') ?? 0)

  const parsedTab = useMemo(() => parseTab(rawTab), [rawTab])
  const frames = useMemo(() => parseTabToFrames(parsedTab), [parsedTab])

  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [bpm, setBpm] = useState(80)
  const [justSaved, setJustSaved] = useState(false)

  function handleSave() {
    const entry: SavedTab = {
      id: Date.now().toString(),
      songName,
      tab: parsedTab,
      capo,
      savedAt: new Date().toISOString(),
    }
    saveTab(entry)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  const [audioOn, setAudioOn] = useState(true)
  const [volume, setVolumeState] = useState(0.7)
  const [loadingAudio, setLoadingAudio] = useState(false)

  const maxFret = useMemo(
    () => Math.max(12, ...frames.flatMap((f) => f.notes.map((n) => n.fret))),
    [frames],
  )

  const currentFrame = frames[frameIndex]
  const prevFrame = frameIndex > 0 ? frames[frameIndex - 1] : null

  // ── Audio preload when enabled ────────────────────────────────────────────
  useEffect(() => {
    if (!audioOn || frames.length === 0) return
    setLoadingAudio(true)
    const allNotes = frames.flatMap((f) => f.notes)
    preloadNotes(allNotes)
    // Give Howler a moment to start fetching, then clear the loading state
    const t = setTimeout(() => setLoadingAudio(false), 800)
    return () => clearTimeout(t)
  }, [audioOn, frames])

  // Stop all sounds when leaving the page
  useEffect(() => () => stopAll(), [])

  // ── Volume sync ───────────────────────────────────────────────────────────
  useEffect(() => {
    setVolume(volume)
  }, [volume])

  // ── Play notes on every frame change ─────────────────────────────────────
  // Use a ref so the effect doesn't re-register on audioOn/currentFrame changes
  const audioOnRef = useRef(audioOn)
  audioOnRef.current = audioOn

  useEffect(() => {
    if (!audioOnRef.current || !currentFrame) return
    if (currentFrame.slideIntermediate) return  // visual-only; no audio during slide glide
    playChord(currentFrame.notes)
  }, [frameIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-play ─────────────────────────────────────────────────────────────
  // Uses setTimeout chains so hammer-on frames can fire at a fraction of the
  // beat duration instead of waiting for the full BPM interval.
  useEffect(() => {
    if (!playing) return
    const nextIndex = frameIndex + 1
    if (nextIndex >= frames.length) {
      setPlaying(false)
      return
    }
    const fullMs = (60 / bpm) * 1000
    const curr = frames[frameIndex]
    const next = frames[nextIndex]
    let ms: number
    if (curr.slideSource && (next.slideIntermediate || next.slideDestination)) {
      // Let the source note ring for half a beat before the slide begins
      ms = Math.max(80, fullMs * 0.5)
    } else if (next.slideIntermediate || next.slideDestination) {
      // Already inside the slide — move through each step quickly
      ms = 40
    } else if (next.hammerOn) {
      ms = Math.max(60, fullMs * 0.25)
    } else {
      ms = fullMs
    }
    const t = setTimeout(() => setFrameIndex(nextIndex), ms)
    return () => clearTimeout(t)
  }, [playing, bpm, frameIndex, frames])

  // ── Keyboard nav ──────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setFrameIndex((i) => {
          let n = Math.min(frames.length - 1, i + 1)
          while (n < frames.length - 1 && frames[n].slideIntermediate) n++
          return n
        })
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setFrameIndex((i) => {
          let n = Math.max(0, i - 1)
          while (n > 0 && frames[n].slideIntermediate) n--
          return n
        })
      } else if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      } else if (e.key === 'm' || e.key === 'M') {
        setAudioOn((a) => !a)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [frames])

  const progress = frames.length > 1 ? frameIndex / (frames.length - 1) : 0

  // ── Guard renders ─────────────────────────────────────────────────────────
  if (!rawTab) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">
          No tab loaded.{' '}
          <Link to="/tab" className="underline text-amber-400">Input a tab first</Link>
        </p>
      </div>
    )
  }

  if (frames.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">
          No notes found in this tab.{' '}
          <Link to="/tab" className="underline text-amber-400">Try a different tab</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={`/visualiser?${searchParams.toString()}`}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Tab
          </Link>
          <h1 className="text-xl font-bold">
            {songName || 'Fretboard Visualiser'}
          </h1>
          {capo > 0 && (
            <span className="text-xs font-medium text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded">
              Capo {capo}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              justSaved
                ? 'bg-green-600 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-gray-900'
            }`}
          >
            {justSaved ? '✓ Saved' : 'Save Tab'}
          </button>
          <p className="text-xs text-gray-500 hidden sm:block">
            ← → step &nbsp;·&nbsp; Space play/pause &nbsp;·&nbsp; M mute
          </p>
        </div>
      </div>

      {/* ── Fretboard ── */}
      <div className="mx-4 mb-4 bg-gray-900 rounded-2xl p-4 shadow-xl">
        <Fretboard
          activeNotes={currentFrame?.notes ?? []}
          prevNotes={prevFrame?.notes ?? []}
          maxFret={maxFret}
        />
      </div>

      {/* ── Current notes summary ── */}
      <div className="mx-4 mb-4 flex flex-wrap gap-2 justify-center">
        {STRING_ORDER.map((label, si) => {
          const note = currentFrame?.notes.find((n) => n.stringIndex === si)
          const noteName = note ? getNoteLabel(note.stringIndex, note.fret) : null
          return (
            <div
              key={label}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-mono ${
                note
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-gray-800 text-gray-600'
              }`}
            >
              <span className="font-semibold">{label}</span>
              {note ? (
                <>
                  <span className="text-gray-500">fret {note.fret}</span>
                  <span className="text-amber-400 text-xs">{noteName}</span>
                </>
              ) : (
                <span>—</span>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Playback controls ── */}
      <div className="mx-4 mb-4 bg-gray-900 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        {/* Prev */}
        <button
          onClick={() => setFrameIndex((i) => { let n = Math.max(0, i - 1); while (n > 0 && frames[n].slideIntermediate) n--; return n })}
          disabled={frameIndex === 0}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xl"
        >
          ‹
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => setPlaying((p) => !p)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold transition-colors text-lg"
        >
          {playing ? '⏸' : '▶'}
        </button>

        {/* Next */}
        <button
          onClick={() => setFrameIndex((i) => { let n = Math.min(frames.length - 1, i + 1); while (n < frames.length - 1 && frames[n].slideIntermediate) n++; return n })}
          disabled={frameIndex === frames.length - 1}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xl"
        >
          ›
        </button>

        {/* Frame counter */}
        <span className="text-sm text-gray-400 tabular-nums">
          {frameIndex + 1} / {frames.length}
        </span>

        {/* BPM */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">BPM</span>
          <input
            type="range"
            min={30}
            max={240}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-20 accent-amber-500"
          />
          <span className="text-sm text-gray-300 tabular-nums w-8">{bpm}</span>
        </div>

        {/* ── Audio controls ── */}
        <div className="ml-auto flex items-center gap-3">
          {/* Volume — only visible when audio is on */}
          {audioOn && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Vol</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolumeState(Number(e.target.value))}
                className="w-20 accent-amber-500"
              />
            </div>
          )}

          {/* Audio toggle */}
          <button
            onClick={() => setAudioOn((a) => !a)}
            title={audioOn ? 'Mute (M)' : 'Enable audio (M)'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              audioOn
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span>{audioOn ? '🔊' : '🔇'}</span>
            <span>{audioOn ? (loadingAudio ? 'Loading…' : 'Audio on') : 'Audio off'}</span>
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="mx-4 mb-4">
        <div
          className="relative h-2 bg-gray-800 rounded-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const ratio = (e.clientX - rect.left) / rect.width
            setFrameIndex(Math.round(ratio * (frames.length - 1)))
          }}
        >
          <div
            className="absolute left-0 top-0 h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow -translate-x-1/2"
            style={{ left: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* ── Tab window ── */}
      <div className="mb-6 bg-gray-900 sm:mx-4 sm:rounded-2xl p-4 overflow-x-auto">
        <p className="text-xs text-gray-600 mb-2 font-sans">Current position in tab</p>
        {currentFrame && <TabWindow tab={parsedTab} col={currentFrame.col} />}
      </div>
    </div>
  )
}
