export default function VersionTimeline({ versions, onRestore }) {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-850 pb-2">
        <h3 className="text-sm font-bold text-slate-200">Version History</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">Restore any previous build version.</p>
      </div>

      {versions.length === 0 ? (
        <div className="text-xs text-slate-500 italic py-4">No snapshots saved yet.</div>
      ) : (
        <div className="relative border-l border-slate-800 pl-4 ml-2 space-y-5">
          {versions.map((v) => (
            <div key={v.versionNumber} className="relative space-y-1">
              
              {/* Bullet point on the timeline border */}
              <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-500 border border-[#07090e] shadow-md shadow-indigo-500/20"></div>
              
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-white">Version {v.versionNumber}</span>
                <button
                  onClick={() => onRestore(v.versionNumber)}
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                  Restore
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-mono truncate max-w-[150px]">
                {v.changeSummary || 'No summary description.'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
