import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { loadSavedTabs, saveTab, type SavedTab } from '../utils/tabParser'

export default function TabInput() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [songName, setSongName] = useState(searchParams.get('songName') ?? '')
  const [tab, setTab] = useState(searchParams.get('tab') ?? '')
  const [capo, setCapo] = useState(Number(searchParams.get('capo') ?? 0))
  const [saved, setSaved] = useState<SavedTab[]>(() => loadSavedTabs())
  const [justSaved, setJustSaved] = useState(false)

  function handleSave() {
    if (!tab.trim()) return
    const existing = saved.find((t) => t.songName === songName)
    saveTab({ id: existing ? existing.id : Date.now().toString(), songName, tab, capo, savedAt: new Date().toISOString() })
    setSaved(loadSavedTabs())
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tab.trim()) return
    const params = new URLSearchParams({ tab, songName, capo: String(capo) })
    navigate(`/fretboard?${params.toString()}`)
  }

  function handleLoad(t: SavedTab) {
    setSongName(t.songName)
    setTab(t.tab)
    setCapo(t.capo)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-1">Tab Input</h1>
      <p className="text-gray-400 mb-8 text-sm">
        Paste your guitar tab below. Each string line should start with its
        label (e|, B|, G|, D|, A|, or E|).
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">
              Song name (optional)
            </label>
            <input
              type="text"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              placeholder="e.g. Wonderwall"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Capo</label>
            <select
              value={capo}
              onChange={(e) => setCapo(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value={0}>None</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Fret {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Tab</label>
          <textarea
            value={tab}
            onChange={(e) => setTab(e.target.value)}
            rows={16}
            placeholder={`e|--3--2--3--2-|-3-----3---------|
B|--------3----|----3-----1------|
G|-----0-----0-|----0------------|
D|--2----------|-----------------|
A|-------------|-3---------------|
E|-------------|-----------------|`}
            className="tab-display w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-green-300 focus:outline-none focus:border-amber-500 resize-y"
          />
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Tip: Copy tabs from sites like Ultimate Guitar and paste them here.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!tab.trim()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                justSaved
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {justSaved ? '✓ Saved' : 'Save'}
            </button>
            <button
              type="submit"
              disabled={!tab.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Visualise →
            </button>
          </div>
        </div>
      </form>

      {saved.length > 0 && (
        <div className="mt-12 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-300">Saved Tabs</h2>
            <Link to="/library" className="text-xs text-amber-400 hover:text-amber-300">
              View all →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {saved.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3 gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{t.songName || 'Untitled'}</p>
                  <p className="text-xs text-gray-500">
                    {t.capo > 0 ? `Capo ${t.capo} · ` : ''}
                    {new Date(t.savedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleLoad(t)}
                  className="text-xs text-amber-400 hover:text-amber-300 shrink-0"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
