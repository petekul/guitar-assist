import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadSavedTabs, deleteTab, type SavedTab } from '../utils/tabParser'

export default function TabLibrary() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState<SavedTab[]>(() => loadSavedTabs())

  function handleDelete(id: string) {
    deleteTab(id)
    setSaved(loadSavedTabs())
  }

  function toFretboard(t: SavedTab) {
    const params = new URLSearchParams({ tab: t.tab, songName: t.songName, capo: String(t.capo) })
    navigate(`/fretboard?${params.toString()}`)
  }

  function toEdit(t: SavedTab) {
    const params = new URLSearchParams({ tab: t.tab, songName: t.songName, capo: String(t.capo) })
    navigate(`/tab?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Tabs</h1>
          <p className="text-gray-400 text-sm mt-1">{saved.length} saved tab{saved.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/tab"
          className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + New Tab
        </Link>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <p className="text-lg mb-2">No saved tabs yet.</p>
          <Link to="/tab" className="text-amber-400 hover:text-amber-300 text-sm underline">
            Input a tab to get started
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((t) => (
            <div
              key={t.id}
              className="bg-gray-900 rounded-xl p-5 flex flex-col gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base truncate">{t.songName || 'Untitled'}</p>
                <div className="flex items-center gap-2 mt-1">
                  {t.capo > 0 && (
                    <span className="text-xs text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded">
                      Capo {t.capo}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(t.savedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <pre className="tab-display text-xs text-green-400/60 leading-relaxed overflow-hidden max-h-16 pointer-events-none select-none">
                {t.tab.split('\n').slice(0, 3).join('\n')}
              </pre>

              <div className="flex gap-2">
                <button
                  onClick={() => toFretboard(t)}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-gray-900 font-medium text-sm py-1.5 rounded-lg transition-colors"
                >
                  Play
                </button>
                <button
                  onClick={() => toEdit(t)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm py-1.5 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
