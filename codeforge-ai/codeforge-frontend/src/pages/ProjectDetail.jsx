import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectApi } from '../api/projectApi'
import VersionTimeline from '../components/VersionTimeline'
import toast from 'react-hot-toast'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    projectApi.getById(id)
      .then(({ data }) => setProject(data))
      .catch(() => {})

    projectApi.listVersions(id)
      .then(({ data }) => setVersions(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleRestore = async (versionNumber) => {
    try {
      await projectApi.restoreVersion(id, versionNumber)
      toast.success(`Restored version ${versionNumber} successfully`)
      // reload project files
      const { data } = await projectApi.getById(id)
      setProject(data)
    } catch {
      toast.error('Version restoration failed')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 animate-fade-in">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
        <span className="text-xs text-slate-500">Loading project configuration...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-fade-in">
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/history" className="text-xs text-indigo-400 hover:underline">
              ← Back to Project History
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white">{project?.title || 'Project Details'}</h1>
        </div>
        <Link to={`/projects/${id}`} className="btn-primary py-2 px-4 text-xs font-bold">
          Open Workspace
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: requirement info */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
              Original Functional Specifications
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap">
              {project?.originalRequirement || 'No original specification recorded.'}
            </p>
          </div>

          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
              System Architecture Info
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
              <div>
                <span className="text-slate-500 block mb-1">Status:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase">
                  {project?.status || 'COMPLETED'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Created At:</span>
                <span>{project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: version timeline */}
        <div className="glass-panel p-6 space-y-4 bg-slate-900/10">
          <VersionTimeline versions={versions} onRestore={handleRestore} />
        </div>
      </div>

    </div>
  )
}
