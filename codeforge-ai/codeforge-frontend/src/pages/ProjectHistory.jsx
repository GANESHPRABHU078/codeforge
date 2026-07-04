import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectApi } from '../api/projectApi'

export default function ProjectHistory() {
  const [projects, setProjects] = useState([])
  const [query, setQuery] = useState('')

  const loadAll = () => projectApi.list(0, 50).then(({ data }) => setProjects(data.content || []))

  useEffect(() => { loadAll() }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return loadAll()
    const { data } = await projectApi.search(query)
    setProjects(data)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Project History</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Search by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn-primary" type="submit">Search</button>
      </form>
      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.id} className="card flex items-center justify-between">
            <div>
              <Link to={`/projects/${p.id}`} className="font-medium text-brand-700 hover:underline">{p.title}</Link>
              <div className="text-xs text-slate-400">{(p.techStack || []).join(', ')}</div>
            </div>
            <span className="text-xs text-slate-400">{p.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
