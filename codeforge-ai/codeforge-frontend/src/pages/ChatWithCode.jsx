import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectApi } from '../api/projectApi'
import ChatWindow from '../components/ChatWindow'

export default function ChatWithCode() {
  const { id } = useParams()
  const [project, setProject] = useState(null)

  useEffect(() => {
    projectApi.getById(id)
      .then(({ data }) => setProject(data))
      .catch(() => {})
  }, [id])

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6 animate-fade-in flex flex-col h-[calc(100vh-120px)]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-4 flex-shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to={`/projects/${id}`} className="text-xs text-indigo-400 hover:underline">
              ← Back to Code Workspace
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Chat with <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">{project?.title || 'Project'}</span>
          </h1>
        </div>
      </div>

      {/* Main chat box container */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ChatWindow projectId={id} />
      </div>

    </div>
  )
}
