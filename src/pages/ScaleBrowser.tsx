import { useState } from 'react'
import { SCALE_ROOTS, MAJOR_SCALES, MINOR_SCALES, SCALE_DEGREES } from '../data/scales'
import ProgressionBrowser from '../components/ProgressionBrowser'

export default function ScaleBrowser() {
  const [mode, setMode] = useState<'major' | 'minor'>('major')
  const [selectedRoot, setSelectedRoot] = useState<string>('C')
  const scales = mode === 'major' ? MAJOR_SCALES : MINOR_SCALES
  const isMajor = mode === 'major'

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">Scale Browser</h1>
      <p className="text-gray-400 mb-8">
        Natural major and minor scales across all 12 keys
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setMode('major')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            isMajor
              ? 'bg-green-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Major
        </button>
        <button
          onClick={() => setMode('minor')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            !isMajor
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Minor
        </button>
      </div>

      {/* Scale table */}
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left pb-3 pr-6 text-gray-500 font-medium w-14">Key</th>
              {SCALE_DEGREES.map(d => (
                <th key={d} className="pb-3 px-4 text-gray-500 font-medium text-center w-14">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCALE_ROOTS.map((root, idx) => (
              <tr
                key={root}
                onClick={() => setSelectedRoot(root)}
                className={`border-t cursor-pointer transition-colors hover:bg-gray-900/60 ${
                  idx % 2 === 0 ? 'border-gray-800' : 'border-gray-800/60'
                } ${root === selectedRoot ? 'bg-gray-800/80' : ''}`}
              >
                <td className={`py-3 pr-6 font-bold text-base ${isMajor ? 'text-green-400' : 'text-blue-400'}`}>
                  {root}
                </td>
                {scales[root].map((note, i) => (
                  <td
                    key={i}
                    className={`py-3 px-4 text-center font-semibold ${
                      i === 0 ? 'text-amber-300' : 'text-white'
                    }`}
                  >
                    {note}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 mb-8 text-xs text-gray-600">
        Pattern — Major: W W H W W W H &nbsp;·&nbsp; Minor: W H W W H W W
      </p>

      <h2 className="text-xl font-bold mb-4">{selectedRoot} Progressions</h2>
      <ProgressionBrowser note={selectedRoot} />
    </div>
  )
}
