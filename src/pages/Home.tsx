import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-12 px-4">
      <h1 className="text-5xl font-bold tracking-tight">🎸 Guitar App</h1>
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
        <Link
          to="/tab"
          className="flex-1 flex flex-col items-center gap-3 bg-gray-800 hover:bg-gray-700 transition-colors rounded-2xl p-8 text-center group"
        >
          <span className="text-4xl">📝</span>
          <span className="text-xl font-semibold">Tab Visualiser</span>
          <span className="text-sm text-gray-400">
            Paste your tab, visualise and save it
          </span>
        </Link>
        <Link
          to="/chords"
          className="flex-1 flex flex-col items-center gap-3 bg-gray-800 hover:bg-gray-700 transition-colors rounded-2xl p-8 text-center group"
        >
          <span className="text-4xl">🎵</span>
          <span className="text-xl font-semibold">Chord Library</span>
          <span className="text-sm text-gray-400">
            Browse SVG chord diagrams by note
          </span>
        </Link>
      </div>
    </div>
  )
}
