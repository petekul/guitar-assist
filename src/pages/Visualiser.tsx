import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import {
  parseTab,
  saveTab,
  loadSavedTabs,
  deleteTab,
  type SavedTab,
} from '../utils/tabParser'

function SavedTabsList({
  tabs,
  onDelete,
  onLoad,
}: {
  tabs: SavedTab[]
  onDelete: (id: string) => void
  onLoad: (tab: SavedTab) => void
}) {
  if (tabs.length === 0) return null
  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-gray-300 mb-3">Saved Tabs</h2>
      <div className="flex flex-col gap-2">
        {tabs.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 gap-4"
          >
            <div>
              <p className="font-medium text-sm">{t.songName || 'Untitled'}</p>
              <p className="text-xs text-gray-500">
                {t.capo > 0 ? `Capo ${t.capo} · ` : ''}
                {new Date(t.savedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onLoad(t)}
                className="text-xs text-amber-400 hover:text-amber-300"
              >
                Load
              </button>
              <button
                onClick={() => onDelete(t.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Visualiser() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const rawTab = searchParams.get('tab') ?? ''
  const songName = searchParams.get('songName') ?? ''
  const capo = Number(searchParams.get('capo') ?? 0)

  const [saved, setSaved] = useState(() => loadSavedTabs())
  const [justSaved, setJustSaved] = useState(false)

  const cleanedTab = useMemo(() => parseTab(rawTab), [rawTab])

  function handleSave() {
    const entry: SavedTab = {
      id: Date.now().toString(),
      songName,
      tab: cleanedTab,
      capo,
      savedAt: new Date().toISOString(),
    }
    saveTab(entry)
    setSaved(loadSavedTabs())
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  function handleDelete(id: string) {
    deleteTab(id)
    setSaved(loadSavedTabs())
  }

  function handleLoad(t: SavedTab) {
    const params = new URLSearchParams({
      tab: t.tab,
      songName: t.songName,
      capo: String(t.capo),
    })
    navigate(`/visualiser?${params.toString()}`)
  }

  if (!rawTab) {
    return (
      <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
        <p className="text-gray-400">
          No tab provided.{' '}
          <Link to="/tab" className="underline text-amber-400">
            Input a tab
          </Link>
        </p>
        <SavedTabsList tabs={saved} onDelete={handleDelete} onLoad={handleLoad} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <Link
            to="/tab"
            className="text-sm text-gray-400 hover:text-white block mb-1"
          >
            ← Edit tab
          </Link>
          <h1 className="text-2xl font-bold">
            {songName || 'Tab Visualiser'}
            {capo > 0 && (
              <span className="ml-2 text-sm font-normal text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded">
                Capo {capo}
              </span>
            )}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/fretboard?${searchParams.toString()}`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            🎸 Fretboard
          </Link>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              justSaved
                ? 'bg-green-600 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-gray-900'
            }`}
          >
            {justSaved ? '✓ Saved' : 'Save Tab'}
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
        <pre className="tab-display text-green-300 text-sm leading-relaxed">
          {cleanedTab}
        </pre>
      </div>

      <details className="mt-6">
        <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">
          Show original tab
        </summary>
        <div className="mt-3 bg-gray-900 rounded-xl p-6 overflow-x-auto">
          <pre className="tab-display text-gray-500 text-sm">{rawTab}</pre>
        </div>
      </details>

      <SavedTabsList tabs={saved} onDelete={handleDelete} onLoad={handleLoad} />
    </div>
  )
}
