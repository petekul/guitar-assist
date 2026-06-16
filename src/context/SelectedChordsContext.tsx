import { createContext, useContext, useState, type ReactNode } from 'react'
import type { ChordEntry } from '../data/chords'

export interface SelectedChord {
  id: string
  note: string
  entry: ChordEntry
  posIndex: number
}

interface SelectedChordsCtx {
  selected: SelectedChord[]
  addChord: (note: string, entry: ChordEntry, posIndex: number) => void
  removeChord: (id: string) => void
  reorder: (fromIdx: number, toIdx: number) => void
  clearAll: () => void
}

const Ctx = createContext<SelectedChordsCtx | null>(null)

let counter = 0
const genId = () => `sc-${++counter}-${Date.now()}`

export function SelectedChordsProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<SelectedChord[]>([])

  const addChord = (note: string, entry: ChordEntry, posIndex: number) => {
    setSelected(prev => [...prev, { id: genId(), note, entry, posIndex }])
  }

  const removeChord = (id: string) => {
    setSelected(prev => prev.filter(c => c.id !== id))
  }

  const reorder = (fromIdx: number, toIdx: number) => {
    setSelected(prev => {
      const next = [...prev]
      const [item] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, item)
      return next
    })
  }

  const clearAll = () => setSelected([])

  return (
    <Ctx.Provider value={{ selected, addChord, removeChord, reorder, clearAll }}>
      {children}
    </Ctx.Provider>
  )
}

export const useSelectedChords = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSelectedChords must be used within SelectedChordsProvider')
  return ctx
}
