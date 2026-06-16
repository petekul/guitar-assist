import { useState } from 'react'
import { MAJOR_SCALES, MINOR_SCALES } from '../data/scales'
import {
  MAJOR_PROGRESSIONS,
  MINOR_PROGRESSIONS,
  resolveChordName,
  type Progression,
} from '../data/progressions'

function ProgressionCard({ progression, scaleNotes }: { progression: Progression; scaleNotes: string[] }) {
  const chordNames = progression.degrees.map((deg, i) =>
    resolveChordName(scaleNotes, deg, progression.qualities[i])
  )

  return (
    <div className="bg-gray-800 rounded-xl px-5 py-4 min-w-0">
      <p className="text-xs font-semibold text-gray-400 mb-3">{progression.name}</p>
      <div className="flex gap-4">
        {progression.numerals.map((numeral, i) => (
          <div key={i} className="flex flex-col items-center min-w-[2.5rem]">
            <span className="text-xs text-gray-500 mb-0.5">{numeral.toUpperCase()}</span>
            <span className="text-sm font-bold text-white">{chordNames[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProgressionBrowser({ note }: { note: string }) {
  const [mode, setMode] = useState<'major' | 'minor'>('major')
  const isMajor = mode === 'major'

  const scaleNotes = isMajor ? MAJOR_SCALES[note] : MINOR_SCALES[note]
  const progressions = isMajor ? MAJOR_PROGRESSIONS : MINOR_PROGRESSIONS

  if (!scaleNotes) return null

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Common Progressions
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('major')}
            className={`px-3 py-0.5 rounded text-xs font-semibold transition-colors ${
              isMajor ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Major
          </button>
          <button
            onClick={() => setMode('minor')}
            className={`px-3 py-0.5 rounded text-xs font-semibold transition-colors ${
              !isMajor ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Minor
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {progressions.map(prog => (
          <ProgressionCard key={prog.name} progression={prog} scaleNotes={scaleNotes} />
        ))}
      </div>
    </div>
  )
}
