export default function QualityScoreCard({ suggestions }) {
  if (!suggestions?.length) return null

  const priorityColor = {
    HIGH: 'text-red-600 bg-red-50',
    MEDIUM: 'text-amber-600 bg-amber-50',
    LOW: 'text-slate-600 bg-slate-50',
  }

  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Code Quality Suggestions</h3>
      <ul className="space-y-2">
        {suggestions.map((s, idx) => (
          <li key={idx} className="text-sm border-b border-slate-100 pb-2">
            <span className={`text-xs px-2 py-0.5 rounded mr-2 ${priorityColor[s.priority] || ''}`}>
              {s.priority}
            </span>
            <span className="font-medium">{s.category}:</span> {s.description}
          </li>
        ))}
      </ul>
    </div>
  )
}
