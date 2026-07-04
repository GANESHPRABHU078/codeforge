export default function VersionTimeline({ versions, onRestore }) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Version History</h3>
      <ul className="space-y-2">
        {versions.map((v) => (
          <li key={v.versionNumber} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2">
            <div>
              <span className="font-medium">v{v.versionNumber}</span>
              <span className="text-slate-500 ml-2">{v.changeSummary}</span>
            </div>
            <button
              onClick={() => onRestore(v.versionNumber)}
              className="text-brand-600 hover:underline"
            >
              Restore
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
