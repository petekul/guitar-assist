import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useDraggable,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ChordDiagram from '../components/ChordDiagram'
import ScaleCard from '../components/ScaleCard'
import ProgressionBrowser from '../components/ProgressionBrowser'
import {
  NOTE_KEYS,
  getChordsForNote,
  chordName,
  type ChordEntry,
} from '../data/chords'
import { SHARP_VARIANTS } from '../data/scales'
import {
  useSelectedChords,
  type SelectedChord,
} from '../context/SelectedChordsContext'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LibraryDragData {
  type: 'library-chord'
  note: string
  entry: ChordEntry
  posIndex: number
}

type ActiveDrag =
  | (LibraryDragData)
  | { type: 'selected-chord'; chord: SelectedChord }

// ---------------------------------------------------------------------------
// Selected section
// ---------------------------------------------------------------------------

function SortableItem({ chord }: { chord: SelectedChord }) {
  const { removeChord } = useSelectedChords()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: chord.id, data: { type: 'selected-chord' } })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }}
      className="relative group"
    >
      <button
        onClick={() => removeChord(chord.id)}
        className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 bg-gray-600 hover:bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none"
        title="Remove"
      >
        ×
      </button>
      <div
        {...attributes}
        {...listeners}
        className="bg-gray-800 rounded-lg p-3 cursor-grab active:cursor-grabbing select-none"
      >
        <ChordDiagram
          position={chord.entry.positions[chord.posIndex]}
          label={chordName(chord.note, chord.entry.suffix)}
          size={0.9}
        />
      </div>
    </div>
  )
}

function SelectedSection({ draggingLibItem }: { draggingLibItem: boolean }) {
  const { selected, clearAll } = useSelectedChords()
  const { setNodeRef, isOver } = useDroppable({ id: 'selected-zone' })

  const highlight = draggingLibItem || isOver

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-3">
        <h2 className="text-xl font-bold">Selected Chords</h2>
        {selected.length > 0 && (
          <>
            <span className="text-sm text-gray-400">{selected.length} chord{selected.length !== 1 ? 's' : ''}</span>
            <button
              onClick={clearAll}
              className="px-4 py-1.5 rounded-lg bg-gray-700 hover:bg-red-600 text-gray-200 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Reset
            </button>
          </>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[136px] rounded-xl border-2 border-dashed p-4 transition-colors ${
          highlight
            ? 'border-amber-400 bg-amber-500/5'
            : 'border-gray-700 bg-gray-900/40'
        }`}
      >
        <SortableContext items={selected.map(c => c.id)} strategy={rectSortingStrategy}>
          {selected.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[88px] text-gray-500 text-sm select-none">
              Drag chord variants here to build a progression
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {selected.map(chord => (
                <SortableItem key={chord.id} chord={chord} />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function voicingLabel(position: { baseFret: number; barres: number[] }): string {
  if (position.barres.length > 0) return `barre fr. ${position.baseFret}`
  if (position.baseFret === 1) return 'open'
  return `fr. ${position.baseFret}`
}

// ---------------------------------------------------------------------------
// Library — expanded voicing card (individually draggable)
// ---------------------------------------------------------------------------

function DraggableVoicingCard({
  note, entry, posIndex,
}: {
  note: string
  entry: ChordEntry
  posIndex: number
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `lib-v-${note}-${entry.suffix}-${posIndex}`,
    data: { type: 'library-chord', note, entry, posIndex } as LibraryDragData,
  })

  return (
    <div ref={setNodeRef} style={{ opacity: isDragging ? 0.35 : 1 }}>
      <div
        {...attributes}
        {...listeners}
        className="bg-gray-700 hover:bg-gray-600 rounded-lg p-3 cursor-grab active:cursor-grabbing select-none transition-colors"
        title="Drag to add to progression"
      >
        <ChordDiagram
          position={entry.positions[posIndex]}
          label={`${chordName(note, entry.suffix)} (${voicingLabel(entry.positions[posIndex])})`}
          size={1}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Library — chord card (header-toggle style)
// ---------------------------------------------------------------------------

function ChordCard({ entry, note }: { entry: ChordEntry; note: string }) {
  const [expanded, setExpanded] = useState(false)
  const name = chordName(note, entry.suffix)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `lib-${note}-${entry.suffix}-0`,
    disabled: expanded,
    data: { type: 'library-chord', note, entry, posIndex: 0 } as LibraryDragData,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.35 : 1 }}
      className="bg-gray-800 rounded-xl overflow-hidden"
    >
      {/* Header bar */}
      <div
        className={`flex items-center gap-2 px-3 py-2 select-none transition-colors ${entry.positions.length > 1 ? 'cursor-pointer hover:bg-gray-700' : ''}`}
        onClick={() => entry.positions.length > 1 && setExpanded(v => !v)}
      >
        <span className="text-sm font-semibold text-white flex-1">{name}</span>
        <div
          {...attributes}
          {...listeners}
          className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing leading-none px-1"
          title="Drag to add to progression"
          onClick={e => e.stopPropagation()}
        >
          ⠿
        </div>
        {entry.positions.length > 1 && (
          <span className="text-gray-500 text-xs w-3 text-center">
            {expanded ? '▲' : '▼'}
          </span>
        )}
      </div>

      {/* Default voicing — always visible */}
      <div className="px-3 pb-3 pt-2 border-t border-gray-700 flex justify-center">
        <DraggableVoicingCard note={note} entry={entry} posIndex={0} />
      </div>

      {/* Extra voicings — shown when expanded */}
      {expanded && entry.positions.length > 1 && (
        <div className="px-3 pb-3 border-t border-gray-700 flex flex-wrap gap-3 pt-2">
          {entry.positions.slice(1).map((_, i) => (
            <DraggableVoicingCard key={i + 1} note={note} entry={entry} posIndex={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ChordsByNote() {
  const { note = 'A' } = useParams<{ note: string }>()
  const upper = note.toUpperCase()
  const { selected, addChord, reorder } = useSelectedChords()
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)

  const sharpVariant = SHARP_VARIANTS[upper]
  const [useVariant, setUseVariant] = useState(false)
  useEffect(() => { setUseVariant(false) }, [upper])

  const scaleKey   = useVariant && sharpVariant ? sharpVariant.dataKey : upper
  const scaleLabel = useVariant && sharpVariant ? sharpVariant.label   : upper

  if (!NOTE_KEYS.includes(upper as (typeof NOTE_KEYS)[number])) {
    return (
      <div className="p-10 text-white">
        Unknown note "{note}".{' '}
        <Link to="/chords" className="underline text-amber-400">Back to library</Link>
      </div>
    )
  }

  const chords = getChordsForNote(upper)

  function handleDragStart({ active }: DragStartEvent) {
    const data = active.data.current
    if (data?.type === 'library-chord') {
      setActiveDrag(data as LibraryDragData)
    } else if (data?.type === 'selected-chord') {
      const chord = selected.find(c => c.id === active.id)
      if (chord) setActiveDrag({ type: 'selected-chord', chord })
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveDrag(null)
    if (!over) return

    const data = active.data.current
    if (data?.type === 'library-chord') {
      // Drop onto selected zone or any item within it
      const droppedOnSelected =
        over.id === 'selected-zone' || selected.some(c => c.id === over.id)
      if (droppedOnSelected) {
        addChord(data.note, data.entry, data.posIndex)
      }
    } else if (data?.type === 'selected-chord') {
      const fromIdx = selected.findIndex(c => c.id === active.id)
      const toIdx = selected.findIndex(c => c.id === over.id)
      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        reorder(fromIdx, toIdx)
      }
    }
  }

  const overlayChord =
    activeDrag?.type === 'selected-chord' ? activeDrag.chord : null
  const overlayLib =
    activeDrag?.type === 'library-chord' ? activeDrag : null

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-950 text-white px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/chords" className="text-gray-400 hover:text-white text-sm">
            ← Chord Library
          </Link>
          <h1 className="text-3xl font-bold">{upper} Chords</h1>
        </div>

        {/* Note selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {NOTE_KEYS.map(n => (
            <Link
              key={n}
              to={`/chords/${n}`}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                n === upper
                  ? 'bg-amber-500 text-gray-900'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {n}
            </Link>
          ))}
        </div>

        {/* Two-column middle section */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-8">

          {/* Left — Selected Chords */}
          <div className="flex-1 min-w-0">
            <SelectedSection draggingLibItem={activeDrag?.type === 'library-chord'} />
          </div>

          {/* Right — Scales + Progressions */}
          <div className="lg:w-[440px] shrink-0 lg:max-h-[300px] lg:overflow-y-auto lg:pr-1">
            {sharpVariant && (
              <div className="flex gap-1 mb-4">
                <button
                  onClick={() => setUseVariant(false)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    !useVariant ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {upper}
                </button>
                <button
                  onClick={() => setUseVariant(true)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    useVariant ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {sharpVariant.label}
                </button>
              </div>
            )}
            <ScaleCard note={scaleKey} label={scaleLabel} />
            <ProgressionBrowser note={scaleKey} />
          </div>
        </div>

        {/* Full-width chord library */}
        <div className="flex flex-wrap gap-4 items-start">
          {chords.map(entry => (
            <ChordCard key={entry.suffix} entry={entry} note={upper} />
          ))}
          {chords.length === 0 && (
            <p className="text-gray-400">No chord data available for {upper}.</p>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {overlayLib && (
          <div className="bg-gray-800 rounded-lg p-3 shadow-2xl rotate-2 opacity-90 pointer-events-none">
            <ChordDiagram
              position={overlayLib.entry.positions[overlayLib.posIndex]}
              label={chordName(overlayLib.note, overlayLib.entry.suffix)}
              size={0.9}
            />
          </div>
        )}
        {overlayChord && (
          <div className="bg-gray-800 rounded-lg p-3 shadow-2xl opacity-90 pointer-events-none">
            <ChordDiagram
              position={overlayChord.entry.positions[overlayChord.posIndex]}
              label={chordName(overlayChord.note, overlayChord.entry.suffix)}
              size={0.9}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
