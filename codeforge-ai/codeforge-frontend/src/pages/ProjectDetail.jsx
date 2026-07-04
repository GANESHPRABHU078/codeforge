import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { projectApi } from '../api/projectApi'
import VersionTimeline from '../components/VersionTimeline'
import toast from 'react-hot-toast'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [versions, setVersions] = useState([])

  useEffect(() => {
    projectApi.getById(id).then(({ data }) => setProject(data))
    projectApi.listVersions(id).then(({ data }) => setVersions(data)).catch(() => {})
  }, [id])

  const handleRestore = async (versionNumber) => {
    try {
      await projectApi.restoreVersion(id, versionNumber)
      toast.success(`Restored version ${versionNumber}`)
    } catch {
      toast.error('Restore failed')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold">{project?.title}</h1>
      <div className="card">
        <h3 className="font-semibold mb-2">Original Requirement</h3>
        <p className="text-sm text-slate-600">{project?.originalRequirement}</p>
      </div>
      <VersionTimeline versions={versions} onRestore={handleRestore} />
    </div>
  )
}
