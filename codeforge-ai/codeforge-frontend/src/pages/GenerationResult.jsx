import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectApi } from '../api/projectApi'
import { generationApi } from '../api/generationApi'
import FileTree from '../components/FileTree'
import CodeEditor from '../components/CodeEditor'
import toast from 'react-hot-toast'

// ── Run-command detection helpers ───────────────────────────────────────────
function inferRunCommands(project) {
  const stack = (project?.techStack || []).map((s) => s.toLowerCase())
  const title = (project?.title || '').toLowerCase()
  const commands = []

  const hasSpring = stack.some((s) => s.includes('spring') || s.includes('java') || s.includes('maven'))
  const hasReact  = stack.some((s) => s.includes('react') || s.includes('node') || s.includes('tailwind'))
  const hasDocker = stack.some((s) => s.includes('docker'))
  const hasPython = stack.some((s) => s.includes('python') || s.includes('flask') || s.includes('fastapi'))
  const hasNode   = stack.some((s) => s.includes('node') || s.includes('express'))

  if (hasDocker) {
    commands.push({ label: 'Docker (Full Stack)', color: 'blue', steps: [
      { cmd: 'docker-compose up --build', desc: 'Build and start all services' },
      { cmd: 'docker-compose ps', desc: 'Check running container status' },
    ]})
  }

  if (hasSpring) {
    commands.push({ label: 'Backend — Spring Boot', color: 'emerald', steps: [
      { cmd: 'cd backend', desc: 'Navigate to backend directory' },
      { cmd: 'mvn clean install -DskipTests', desc: 'Build the Maven project' },
      { cmd: 'java -jar target/*.jar', desc: 'Start the Spring Boot server (port 8080)' },
    ]})
  }

  if (hasPython) {
    commands.push({ label: 'Backend — Python', color: 'yellow', steps: [
      { cmd: 'pip install -r requirements.txt', desc: 'Install Python dependencies' },
      { cmd: 'python main.py', desc: 'Start the server' },
    ]})
  }

  if (hasNode && !hasReact) {
    commands.push({ label: 'Backend — Node.js', color: 'green', steps: [
      { cmd: 'cd backend && npm install', desc: 'Install Node dependencies' },
      { cmd: 'npm run dev', desc: 'Start Node.js server' },
    ]})
  }

  if (hasReact) {
    commands.push({ label: 'Frontend — React', color: 'teal', steps: [
      { cmd: 'cd frontend', desc: 'Navigate to the frontend directory' },
      { cmd: 'npm install', desc: 'Install all dependencies' },
      { cmd: 'npm run dev', desc: 'Start Vite dev server (default http://localhost:5173)' },
    ]})
  }

  // Fallback
  if (commands.length === 0) {
    commands.push({ label: 'General Setup', color: 'indigo', steps: [
      { cmd: 'npm install', desc: 'Install dependencies' },
      { cmd: 'npm run dev', desc: 'Start development server' },
    ]})
  }

  return commands
}

const cmdColorMap = {
  blue:   'text-blue-400 bg-blue-500/5 border-blue-500/20',
  emerald:'text-emerald-400 bg-emerald-500/5 border-emerald-500/20',
  teal:   'text-teal-400 bg-teal-500/5 border-teal-500/20',
  indigo: 'text-indigo-400 bg-indigo-500/5 border-indigo-500/20',
  green:  'text-green-400 bg-green-500/5 border-green-500/20',
  yellow: 'text-yellow-400 bg-yellow-500/5 border-yellow-500/20',
}

// ── Modify Progress Stages ──────────────────────────────────────────────────
const MODIFY_STAGES = [
  'Analyzing change request...',
  'Planning updated file structure...',
  'Regenerating affected modules...',
  'Saving new version...',
]

// ── Main Component ──────────────────────────────────────────────────────────
export default function GenerationResult() {
  const { id } = useParams()
  const [project, setProject]           = useState(null)
  const [files, setFiles]               = useState([])
  const [activeFile, setActiveFile]     = useState(null)
  const [activeTab, setActiveTab]       = useState('explain')
  const [actionOutput, setActionOutput] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Modify panel state
  const [modifyPrompt, setModifyPrompt]     = useState('')
  const [modifyLoading, setModifyLoading]   = useState(false)
  const [modifyStage, setModifyStage]       = useState(-1)
  const modifyTimerRef                      = useRef(null)

  // Copy feedback state
  const [copiedCmd, setCopiedCmd] = useState(null)

  useEffect(() => {
    projectApi.getById(id)
      .then(({ data }) => {
        setProject(data)
        if (data.files && data.files.length > 0) {
          setFiles(data.files)
          setActiveFile(data.files[0])
        }
      })
      .catch(() => {})
  }, [id])

  useEffect(() => () => { if (modifyTimerRef.current) clearTimeout(modifyTimerRef.current) }, [])

  const runAction = async (actionFn, label, tabName) => {
    if (!activeFile) return toast.error('Select a file first')
    setActiveTab(tabName)
    setActionLoading(true)
    setActionOutput('')
    try {
      const { data } = await actionFn({ projectId: id, fileName: activeFile.fileName })
      setActionOutput(typeof data === 'string' ? data : JSON.stringify(data, null, 2))
      toast.success(`${label} complete`)
    } catch {
      toast.error(`${label} execution failed`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const { data } = await projectApi.download(id)
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${project?.title || 'project'}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Project ZIP downloaded!')
    } catch {
      toast.error('ZIP generation failed')
    }
  }

  const handleCopyCode = () => {
    if (!actionOutput) return
    navigator.clipboard.writeText(actionOutput)
    toast.success('Copied to clipboard!')
  }

  const handleCopyCmd = (cmd) => {
    navigator.clipboard.writeText(cmd)
    setCopiedCmd(cmd)
    setTimeout(() => setCopiedCmd(null), 2000)
  }

  // ── Modify Project ─────────────────────────────────────────────────────────
  const animateModifyStages = () => {
    let idx = 0
    const next = () => {
      setModifyStage(idx)
      if (idx < MODIFY_STAGES.length - 1) {
        modifyTimerRef.current = setTimeout(() => { idx++; next() }, 4000)
      }
    }
    next()
  }

  const handleModify = async () => {
    if (!modifyPrompt.trim()) return toast.error('Describe the change you want')
    setModifyLoading(true)
    setModifyStage(0)
    animateModifyStages()
    try {
      const { data } = await generationApi.modifyProject({
        requirement: modifyPrompt,
        techStack: project?.techStack || [],
        projectId: id,
      })
      clearTimeout(modifyTimerRef.current)
      setModifyStage(-1)
      setModifyPrompt('')
      toast.success('Project updated successfully!')
      // Reload project files
      const { data: updated } = await projectApi.getById(data.projectId || id)
      setProject(updated)
      setFiles(updated.files || [])
      if (updated.files?.length) setActiveFile(updated.files[0])
    } catch (err) {
      clearTimeout(modifyTimerRef.current)
      setModifyStage(-1)
      toast.error(err.response?.data?.message || 'Modification failed')
    } finally {
      setModifyLoading(false)
    }
  }

  const runCommands = project ? inferRunCommands(project) : []

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-fade-in">

      {/* ── Workspace Header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Active Project
            </span>
            <span className="text-slate-500 text-xs">v{project?.version || 1}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{project?.title || 'Loading Code Workspace...'}</h1>
          {project?.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.techStack.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-[9px] font-bold text-slate-500">{t}</span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/projects/${id}/chat`} className="btn-secondary py-2 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat with Code
          </Link>
          <button onClick={handleDownload} className="btn-primary py-2 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export ZIP
          </button>
        </div>
      </div>

      {/* ── File Explorer + Code Editor ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File Tree */}
        <div className="glass-panel p-4 flex flex-col h-[550px] space-y-4">
          <div className="font-bold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Project Files
          </div>
          <div className="flex-1 overflow-y-auto">
            <FileTree
              files={files.length ? files : (project?.files || [])}
              activeFile={activeFile}
              onSelect={setActiveFile}
            />
          </div>
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-500">
            <div className="font-semibold text-slate-400 mb-1">Active File:</div>
            <div className="truncate text-teal-400 font-mono">{activeFile ? activeFile.fileName : 'None selected'}</div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="lg:col-span-3 glass-panel p-4 flex flex-col h-[550px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              <span className="text-xs font-mono text-slate-300">
                {activeFile ? activeFile.filePath + activeFile.fileName : 'No file open'}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">{activeFile?.language || ''}</span>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden bg-slate-950/60 border border-slate-800/80">
            <CodeEditor file={activeFile} />
          </div>
        </div>
      </div>

      {/* ── SDLC AI Co-Pilot Agents ──────────────────────────────────────── */}
      <div className="glass-panel p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">SDLC AI Co-Pilot Agents</h2>
          <p className="text-xs text-slate-400 mt-0.5">Select a file above, then trigger any secondary agent.</p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { fn: generationApi.explain,               label: 'Explain Code',          tab: 'explain'    },
            { fn: generationApi.generateTests,         label: 'Generate Unit Tests',   tab: 'tests'      },
            { fn: generationApi.generateDocs,          label: 'Auto-Documentation',    tab: 'docs'       },
            { fn: generationApi.detectErrors,          label: 'Detect Bugs / Errors',  tab: 'errors'     },
            { fn: generationApi.refactor,              label: 'Refactor Module',        tab: 'refactor'   },
            { fn: generationApi.qualitySuggestions,    label: 'Quality & Patterns',    tab: 'quality'    },
            { fn: generationApi.deploymentSuggestions, label: 'Docker & Deploy Guide', tab: 'deployment' },
          ].map(({ fn, label, tab }) => (
            <button
              key={tab}
              onClick={() => runAction(fn, label, tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'bg-slate-900/50 text-slate-400 border border-transparent hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden min-h-[160px]">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs">
            <span className="font-mono text-slate-400">console_output.txt</span>
            {actionOutput && (
              <button onClick={handleCopyCode} className="text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-150">
                Copy Content
              </button>
            )}
          </div>
          <div className="p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {actionLoading ? (
              <div className="flex items-center gap-2 py-4 text-slate-400">
                <svg className="animate-spin h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Agent executing on <span className="text-teal-400">{activeFile?.fileName}</span>...</span>
              </div>
            ) : actionOutput ? actionOutput : (
              <span className="text-slate-500 italic">No output yet. Select a file and trigger an agent above.</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Step 6: Modify Project Panel ─────────────────────────────────── */}
      <div className="glass-panel p-6 space-y-5 border-l-4 border-indigo-500/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Modify Project</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Request AI-driven changes without rebuilding from scratch. e.g. <em className="text-indigo-400 not-italic">"Add JWT authentication"</em>, <em className="text-indigo-400 not-italic">"Convert DB to PostgreSQL"</em>, <em className="text-indigo-400 not-italic">"Add Redis caching layer"</em>
            </p>
          </div>
        </div>

        {modifyLoading ? (
          /* Modify Progress */
          <div className="space-y-4 bg-slate-950/60 rounded-xl border border-slate-800 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Applying Changes...</span>
              <span className="text-[10px] text-indigo-400 font-semibold">
                Step {modifyStage + 1} / {MODIFY_STAGES.length}
              </span>
            </div>
            <div className="space-y-2.5">
              {MODIFY_STAGES.map((label, idx) => (
                <div key={idx} className={`flex items-center gap-3 text-xs transition-all duration-300 ${idx < modifyStage ? 'opacity-50' : idx === modifyStage ? 'opacity-100' : 'opacity-25'}`}>
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-200 ${
                    idx < modifyStage  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                    idx === modifyStage ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' :
                                          'bg-slate-900 border-slate-800 text-slate-600'
                  }`}>
                    {idx < modifyStage ? (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : idx === modifyStage ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <span className="text-[8px] font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span className={idx === modifyStage ? 'text-slate-200 font-semibold' : 'text-slate-500'}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <textarea
              className="flex-1 h-20 bg-slate-950/60 border border-slate-800 focus:border-indigo-500/50 rounded-xl p-3.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all"
              placeholder='Describe what you want to change or add (e.g. "Add JWT authentication with refresh tokens", "Convert the database from MongoDB to PostgreSQL", "Add email notification service")'
              value={modifyPrompt}
              onChange={(e) => setModifyPrompt(e.target.value)}
            />
            <button
              onClick={handleModify}
              disabled={modifyLoading}
              className="btn-primary px-5 py-2 text-xs font-bold flex-shrink-0 self-start"
            >
              Apply Change
            </button>
          </div>
        )}

        {/* Quick change chips */}
        {!modifyLoading && (
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] text-slate-600 self-center">Quick:</span>
            {[
              'Add JWT authentication',
              'Convert DB to PostgreSQL',
              'Add Redis caching',
              'Add email notifications',
              'Add Docker Compose setup',
              'Add Swagger API docs',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => setModifyPrompt(chip)}
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-900/50 text-slate-400 border border-slate-800 hover:border-indigo-500/30 hover:text-indigo-400 transition-all duration-150"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Step 8: Run the Project ───────────────────────────────────────── */}
      <div className="glass-panel p-6 space-y-5 border-l-4 border-teal-500/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Run the Project</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Setup and start commands auto-generated from your tech stack.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {runCommands.map((group) => (
            <div key={group.label} className={`rounded-xl border p-4 space-y-3 ${cmdColorMap[group.color]}`}>
              <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">{group.label}</div>
              <div className="space-y-2">
                {group.steps.map(({ cmd, desc }) => (
                  <div key={cmd} className="space-y-0.5">
                    <div className="flex items-center gap-2 bg-slate-950/80 rounded-lg px-3 py-2 border border-slate-900 group">
                      <span className="text-slate-600 text-xs select-none">$</span>
                      <code className="flex-1 text-xs font-mono text-slate-200 select-all">{cmd}</code>
                      <button
                        onClick={() => handleCopyCmd(cmd)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-slate-500 hover:text-teal-400"
                        title="Copy command"
                      >
                        {copiedCmd === cmd ? (
                          <svg className="w-3.5 h-3.5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-600 px-1">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2.5 bg-slate-950/50 rounded-xl border border-slate-900 p-3.5 text-xs text-slate-500">
          <svg className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Download the project ZIP first, then extract and run these commands from the project root directory.
            For Spring Boot + React, start the backend first, then the frontend.
          </span>
        </div>
      </div>

    </div>
  )
}
