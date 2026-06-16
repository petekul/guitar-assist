import { Link } from 'react-router-dom'
import { NOTE_KEYS } from '../data/chords'

export default function ChordLibrary() {
  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Chord Library</h1>
      <p className="text-gray-400 mb-10">
        Select a note to browse chord diagrams
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 max-w-lg">
        {NOTE_KEYS.map((note) => (
          <Link
            key={note}
            to={`/chords/${note}`}
            className="flex items-center justify-center w-16 h-16 rounded-xl bg-gray-800 hover:bg-amber-500 hover:text-gray-900 text-2xl font-bold transition-colors"
          >
            {note}
          </Link>
        ))}
      </div>
    </div>
  )
}
