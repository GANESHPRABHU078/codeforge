import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { generationApi } from '../api/generationApi'
import toast from 'react-hot-toast'

const TECH_OPTIONS = ['Java', 'Spring Boot', 'React', 'MongoDB', 'Python', 'Node.js', 'PostgreSQL', 'Docker', 'JWT', 'TailwindCSS']

const EXAMPLE_PROMPTS = [
  {
    title: "Hospital Management",
    desc: "Build a Hospital Management System using Spring Boot, React, MongoDB, JWT, and Docker with doctor schedules, patient records, and appointment booking.",
  },
  {
    title: "E-Commerce Platform",
    desc: "Create an E-Commerce platform with product search, cart operations, JWT security, payment gateway integration, and order tracking.",
  },
  {
    title: "Library Portal",
    desc: "Build a Library Management System with book catalog, member loans, fine tracking, and admin dashboard using Spring Boot and React.",
  },
  {
    title: "Task Manager App",
    desc: "Develop a Kanban-style Task Manager with real-time updates, user roles, drag-and-drop boards, and deadline reminders.",
  }
]

const GENERATION_STAGES = [
  {
    id: 'analyze',
    label: 'Analyzing Prompt',
    sub: 'Understanding your requirements and project scope...',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    color: 'indigo',
    duration: 2500,
  },
  {
    id: 'blueprint',
    label: 'Planning Architecture',
    sub: 'Designing system structure, modules, and data models...',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: 'purple',
    duration: 4000,
  },
  {
    id: 'structure',
    label: 'Creating Folder Structure',
    sub: 'Generating directory layout and file manifest...',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    color: 'teal',
    duration: 5000,
  },
  {
    id: 'backend',
    label: 'Writing Backend Code',
    sub: 'Generating controllers, services, models, repositories...',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    color: 'blue',
    duration: 8000,
  },
  {
    id: 'frontend',
    label: 'Writing Frontend Code',
    sub: 'Building React components, pages, and API hooks...',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'emerald',
    duration: 6000,
  },
  {
    id: 'finalize',
    label: 'Finalizing & Saving',
    sub: 'Persisting to database, indexing for AI search...',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'amber',
    duration: 3000,
  },
]

const colorMap = {
  indigo: { ring: 'border-indigo-500', bg: 'bg-indigo-500/10', text: 'text-indigo-400', bar: 'from-indigo-500 to-indigo-400', glow: 'shadow-indigo-500/20' },
  purple: { ring: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400', bar: 'from-purple-500 to-purple-400', glow: 'shadow-purple-500/20' },
  teal:   { ring: 'border-teal-500',   bg: 'bg-teal-500/10',   text: 'text-teal-400',   bar: 'from-teal-500 to-teal-400',   glow: 'shadow-teal-500/20'   },
  blue:   { ring: 'border-blue-500',   bg: 'bg-blue-500/10',   text: 'text-blue-400',   bar: 'from-blue-500 to-blue-400',   glow: 'shadow-blue-500/20'   },
  emerald:{ ring: 'border-emerald-500',bg: 'bg-emerald-500/10',text: 'text-emerald-400',bar: 'from-emerald-500 to-emerald-400',glow: 'shadow-emerald-500/20'},
  amber:  { ring: 'border-amber-500',  bg: 'bg-amber-500/10',  text: 'text-amber-400',  bar: 'from-amber-500 to-amber-400',  glow: 'shadow-amber-500/20'  },
}

export default function RequirementInput() {
  const location = useLocation()
  const [requirement, setRequirement] = useState(location.state?.requirement || '')
  const [techStack, setTechStack] = useState(['Java', 'Spring Boot', 'React', 'MongoDB', 'JWT', 'Docker'])
  const [loading, setLoading] = useState(false)
  const [projectId, setProjectId] = useState(null)

  // Progress tracker state
  const [currentStage, setCurrentStage] = useState(-1)      // -1 = not started
  const [completedStages, setCompletedStages] = useState([]) // array of completed stage ids
  const [stageProgress, setStageProgress] = useState(0)     // 0-100 fill for current bar
  const stageTimerRef = useRef(null)
  const progressTimerRef = useRef(null)

  const navigate = useNavigate()

  const toggleTech = (tech) => {
    setTechStack((prev) => prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech])
  }

  const stopTimers = () => {
    if (stageTimerRef.current)    clearTimeout(stageTimerRef.current)
    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
  }

  // Animate through all stages until API responds
  const startProgressAnimation = () => {
    let stageIndex = 0
    const animateStage = (idx) => {
      if (idx >= GENERATION_STAGES.length) return
      setCurrentStage(idx)
      setStageProgress(0)

      const stage = GENERATION_STAGES[idx]
      const tickInterval = stage.duration / 100
      let progress = 0

      progressTimerRef.current = setInterval(() => {
        progress += 1
        setStageProgress(Math.min(progress, 95)) // cap at 95 — API completion drives to 100
        if (progress >= 95) clearInterval(progressTimerRef.current)
      }, tickInterval)

      stageTimerRef.current = setTimeout(() => {
        setCompletedStages((prev) => [...prev, stage.id])
        animateStage(idx + 1)
      }, stage.duration)
    }
    animateStage(stageIndex)
  }

  const handleGenerate = async () => {
    if (!requirement.trim()) return toast.error('Please describe your requirement first')
    setLoading(true)
    setCompletedStages([])
    setCurrentStage(-1)
    setStageProgress(0)

    startProgressAnimation()

    try {
      const payload = { requirement, techStack }
      if (projectId) payload.projectId = projectId

      const { data } = await generationApi.generateCode(payload)

      // API done — flash final stage to 100% and redirect
      stopTimers()
      setCurrentStage(GENERATION_STAGES.length - 1)
      setStageProgress(100)
      setCompletedStages(GENERATION_STAGES.map((s) => s.id))

      toast.success('Project generated successfully!')
      setTimeout(() => navigate(`/projects/${data.projectId}`), 800)
    } catch (err) {
      stopTimers()
      setLoading(false)
      setCurrentStage(-1)
      toast.error(err.response?.data?.message || 'Generation failed. Please try again.')
    }
  }

  useEffect(() => () => stopTimers(), [])

  const overallPercent = loading
    ? Math.round(((completedStages.length + (stageProgress / 100)) / GENERATION_STAGES.length) * 100)
    : 0

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8 animate-fade-in">

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Define Your Project Blueprint
        </h1>
        <p className="text-slate-400 text-sm">Describe your idea in plain language. Our AI will plan, architect, and write the complete codebase.</p>
      </div>

      {/* ───────────────────────────────────── */}
      {/* LOADING / PROGRESS VIEW               */}
      {/* ───────────────────────────────────── */}
      {loading ? (
        <div className="glass-panel p-8 space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">AI is Building Your Project</h2>
              <p className="text-xs text-slate-400 truncate max-w-lg">{requirement}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {overallPercent}%
              </div>
              <div className="text-[10px] text-slate-500">Overall Progress</div>
            </div>
          </div>

          {/* Overall Bar */}
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${overallPercent}%` }}
            />
          </div>

          {/* Stage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GENERATION_STAGES.map((stage, idx) => {
              const done = completedStages.includes(stage.id)
              const active = currentStage === idx && !done
              const pending = !done && !active
              const c = colorMap[stage.color]

              return (
                <div
                  key={stage.id}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${
                    done    ? 'bg-slate-950/60 border-slate-800/40 opacity-70' :
                    active  ? `bg-slate-950/80 ${c.ring} shadow-lg ${c.glow}` :
                              'bg-slate-950/30 border-slate-900 opacity-40'
                  }`}
                >
                  <div className="flex items-start gap-3 z-10 relative">
                    {/* Icon */}
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      done   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      active ? `${c.bg} ${c.text} ${c.ring}` :
                               'bg-slate-900 text-slate-600 border-slate-800'
                    }`}>
                      {done ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : stage.icon}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className={`text-xs font-bold truncate ${done ? 'text-slate-400' : active ? 'text-white' : 'text-slate-600'}`}>
                        {stage.label}
                      </div>
                      <div className={`text-[10px] mt-0.5 truncate ${active ? 'text-slate-400' : 'text-slate-600'}`}>
                        {done ? 'Complete ✓' : stage.sub}
                      </div>

                      {/* Per-stage progress bar */}
                      {active && (
                        <div className="mt-2 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${c.bar} rounded-full transition-all duration-300 ease-out`}
                            style={{ width: `${stageProgress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Active pulse ring */}
                    {active && (
                      <span className="flex h-2.5 w-2.5 flex-shrink-0 mt-1">
                        <span className={`animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full ${c.bg} opacity-75`} />
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${c.bg}`} />
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tech Stack pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900">
            <span className="text-[10px] text-slate-600 self-center mr-1">Stack:</span>
            {techStack.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-900 text-[10px] font-semibold text-slate-500">{t}</span>
            ))}
          </div>
        </div>

      ) : (
        /* ───────────────────────────────────── */
        /* FORM VIEW (not loading)               */
        /* ───────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-300">Project Description</label>
                <textarea
                  className="w-full h-44 p-4 bg-slate-950/60 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all duration-200"
                  placeholder="Describe your project (e.g. Build a Hospital Management System with Doctor schedules, Patient records, Appointment booking, JWT auth, and Docker deployment...)"
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-300">Tech Stack</label>
                <p className="text-xs text-slate-500">Select the technologies you want in your generated project.</p>
                <div className="flex flex-wrap gap-2">
                  {TECH_OPTIONS.map((tech) => {
                    const isSelected = techStack.includes(tech)
                    return (
                      <button
                        key={tech}
                        onClick={() => toggleTech(tech)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                          isSelected
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                            : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {isSelected && <span className="mr-1">✓</span>}{tech}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2.5 text-sm font-bold mt-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Full Project
              </button>
            </div>

            {/* How it works steps */}
            <div className="glass-panel p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">How It Works</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { num: '01', label: 'Describe', desc: 'Write your project idea in plain English' },
                  { num: '02', label: 'AI Plans', desc: 'AI designs architecture & file structure' },
                  { num: '03', label: 'Code Gen', desc: 'Complete source files are generated' },
                  { num: '04', label: 'Review', desc: 'Browse, edit, export or modify' },
                ].map((s) => (
                  <div key={s.num} className="text-center space-y-1.5">
                    <div className="text-xl font-extrabold text-indigo-500/40">{s.num}</div>
                    <div className="text-xs font-bold text-slate-300">{s.label}</div>
                    <div className="text-[10px] text-slate-500">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sample Prompts */}
          <div className="space-y-5">
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 pb-2 border-b border-slate-800">
                💡 Try a Template
              </h3>
              <p className="text-xs text-slate-400">Click to instantly prefill the description.</p>
              <div className="space-y-2.5">
                {EXAMPLE_PROMPTS.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setRequirement(ex.desc)}
                    className="w-full text-left p-4 rounded-xl bg-slate-950/40 border border-slate-850 hover:border-indigo-500/30 hover:bg-slate-900/40 transition-all duration-200 space-y-1 group"
                  >
                    <div className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors duration-150 flex items-center gap-2">
                      <span className="text-indigo-500/60">→</span> {ex.title}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{ex.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Model badge */}
            <div className="glass-panel p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Powered by Gemini 1.5 Pro</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Multi-agent pipeline · Blueprint → Code loop</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
