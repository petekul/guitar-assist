import { MAJOR_SCALES, MINOR_SCALES, SCALE_DEGREES } from '../data/scales'

export default function ScaleCard({ note, label }: { note: string; label?: string }) {
  const major = MAJOR_SCALES[note]
  const minor = MINOR_SCALES[note]
  if (!major && !minor) return null

  return (
    <div className="bg-gray-800 rounded-xl px-5 py-4 mb-8">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        {label ?? note} Scales
      </h2>
      <div className="space-y-3">
        {major && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-green-400 w-10 shrink-0">Major</span>
            <div className="flex">
              {SCALE_DEGREES.map((deg, i) => (
                <div key={deg} className="flex flex-col items-center w-10">
                  <span className="text-xs text-gray-500">{deg}</span>
                  <span className="text-sm font-bold text-white">{major[i]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {minor && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-blue-400 w-10 shrink-0">Minor</span>
            <div className="flex">
              {SCALE_DEGREES.map((deg, i) => (
                <div key={deg} className="flex flex-col items-center w-10">
                  <span className="text-xs text-gray-500">{deg}</span>
                  <span className="text-sm font-bold text-white">{minor[i]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
