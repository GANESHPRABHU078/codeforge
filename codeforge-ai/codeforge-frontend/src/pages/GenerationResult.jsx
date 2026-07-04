import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectApi } from '../api/projectApi'
import { generationApi } from '../api/generationApi'
import FileTree from '../components/FileTree'
import CodeEditor from '../components/CodeEditor'
import toast from 'react-hot-toast'

export default function GenerationResult() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [files, setFiles] = useState([])
  const [activeFile, setActiveFile] = useState(null)
  const [activeTab, setActiveTab] = useState('explain')
  const [actionOutput, setActionOutput] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

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

  const runAction = async (actionFn, label, tabName) => {
    if (!activeFile) return toast.error('Select a file first')
    setActiveTab(tabName)
    setActionLoading(true)
    setActionOutput('')
    try {
      const { data } = await actionFn({ projectId: id, fileName: activeFile.fileName })
      setActionOutput(typeof data === 'string' ? data : JSON.stringify(data, null, 2))
      toast.success(`${label} analysis complete`)
    } catch (err) {
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
      toast.success('Project zip downloaded!')
    } catch (e) {
      toast.error('ZIP generation failed')
    }
  }

  const handleCopyCode = () => {
    if (!actionOutput) return
    navigator.clipboard.writeText(actionOutput)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-fade-in">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Active Project
            </span>
            <span className="text-slate-500 text-xs">v{project?.version || 1}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{project?.title || 'Loading Code Workspace...'}</h1>
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

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Explorer tree & info */}
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

        {/* Right Column: Code Editor */}
        <div className="lg:col-span-3 glass-panel p-4 flex flex-col h-[550px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-400"></span>
              <span className="text-xs font-mono text-slate-300">{activeFile ? activeFile.filePath + activeFile.fileName : 'No file open'}</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">{activeFile?.language || ''}</span>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden bg-slate-950/60 border border-slate-800/80">
            <CodeEditor file={activeFile} />
          </div>
        </div>

      </div>

      {/* SDLC AI Agent Actions Section */}
      <div className="glass-panel p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">SDLC AI Co-Pilot Agents</h2>
          <p className="text-xs text-slate-400 mt-0.5">Select a code file above, then call any secondary LLM agent for assistance.</p>
        </div>

        {/* Action Tabs Menu */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <button 
            onClick={() => runAction(generationApi.explain, 'Explain Code', 'explain')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'explain' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-900/50 text-slate-400 border border-transparent hover:bg-slate-900'
            }`}
          >
            Explain Code
          </button>
          <button 
            onClick={() => runAction(generationApi.generateTests, 'Unit Tests', 'tests')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'tests' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-900/50 text-slate-400 border border-transparent hover:bg-slate-900'
            }`}
          >
            Generate Unit Tests
          </button>
          <button 
            onClick={() => runAction(generationApi.generateDocs, 'Documentation', 'docs')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'docs' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-900/50 text-slate-400 border border-transparent hover:bg-slate-900'
            }`}
          >
            Auto-Documentation
          </button>
          <button 
            onClick={() => runAction(generationApi.detectErrors, 'Error Detection', 'errors')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'errors' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-900/50 text-slate-400 border border-transparent hover:bg-slate-900'
            }`}
          >
            Detect Bugs/Errors
          </button>
          <button 
            onClick={() => runAction(generationApi.refactor, 'Refactor', 'refactor')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'refactor' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-900/50 text-slate-400 border border-transparent hover:bg-slate-900'
            }`}
          >
            Refactor Module
          </button>
          <button 
            onClick={() => runAction(generationApi.qualitySuggestions, 'Quality Suggestions', 'quality')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'quality' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-900/50 text-slate-400 border border-transparent hover:bg-slate-900'
            }`}
          >
            Quality & Design Patterns
          </button>
          <button 
            onClick={() => runAction(generationApi.deploymentSuggestions, 'Deployment Suggestions', 'deployment')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'deployment' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-slate-900/50 text-slate-400 border border-transparent hover:bg-slate-900'
            }`}
          >
            Docker & Deploy Guide
          </button>
        </div>

        {/* Action Output View */}
        <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden min-h-[160px] relative">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs">
            <span className="font-mono text-slate-400">console_output.txt</span>
            {actionOutput && (
              <button 
                onClick={handleCopyCode} 
                className="text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-150"
              >
                Copy Content
              </button>
            )}
          </div>
          
          <div className="p-4 overflow-x-auto text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
            {actionLoading ? (
              <div className="flex items-center gap-2 py-4 text-slate-400">
                <svg className="animate-spin h-4.5 w-4.5 text-teal-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Secondary AI agent executing analysis on {activeFile?.fileName}...</span>
              </div>
            ) : actionOutput ? (
              actionOutput
            ) : (
              <span className="text-slate-500 italic">No output. Select a file above and trigger one of the agent buttons to begin inspection.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
