import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { generationApi } from '../api/generationApi'
import { useJobPoller } from '../hooks/useJobPoller'
import toast from 'react-hot-toast'

const TECH_OPTIONS = [
  { name: 'Java',        icon: '☕', color: 'amber' },
  { name: 'Spring Boot', icon: '🍃', color: 'emerald' },
  { name: 'React',       icon: '⚛️', color: 'blue' },
  { name: 'MongoDB',     icon: '🍃', color: 'green' },
  { name: 'Python',      icon: '🐍', color: 'indigo' },
  { name: 'Node.js',     icon: '⬢',  color: 'teal' },
  { name: 'PostgreSQL',  icon: '🐘', color: 'blue' },
  { name: 'Docker',      icon: '🐳', color: 'sky' },
  { name: 'JWT',         icon: '🔐', color: 'purple' },
  { name: 'TailwindCSS', icon: '💨', color: 'cyan' },
  { name: 'TypeScript',  icon: '📘', color: 'blue' },
  { name: 'Redis',       icon: '🔴', color: 'red' },
]

const EXAMPLE_PROMPTS = [
  {
    title: '🏥 Hospital Management',
    tag: 'Healthcare',
    desc: 'Build a Hospital Management System using Spring Boot, React, MongoDB, JWT, and Docker with doctor schedules, patient records, and appointment booking.',
  },
  {
    title: '🛒 E-Commerce Platform',
    tag: 'Commerce',
    desc: 'Create an E-Commerce platform with product search, cart operations, JWT security, payment gateway integration, and order tracking.',
  },
  {
    title: '📚 Library Portal',
    tag: 'Education',
    desc: 'Build a Library Management System with book catalog, member loans, fine tracking, and admin dashboard using Spring Boot and React.',
  },
  {
    title: '📋 Task Manager',
    tag: 'Productivity',
    desc: 'Develop a Kanban-style Task Manager with real-time updates, user roles, drag-and-drop boards, and deadline reminders.',
  },
]

const GENERATION_STAGES = [
  { id: 'analyze',   label: 'Analyzing Prompt',        sub: 'Understanding requirements & project scope…',     color: 'indigo', pct: 15 },
  { id: 'blueprint', label: 'Planning Architecture',   sub: 'Designing system structure & data models…',       color: 'purple', pct: 30 },
  { id: 'structure', label: 'Creating File Structure', sub: 'Generating directory layout & file manifest…',    color: 'teal',   pct: 45 },
  { id: 'backend',   label: 'Writing Backend Code',    sub: 'Controllers, services, repositories, models…',   color: 'blue',   pct: 70 },
  { id: 'frontend',  label: 'Writing Frontend Code',   sub: 'React components, pages, API hooks…',             color: 'emerald',pct: 88 },
  { id: 'finalize',  label: 'Finalizing & Saving',     sub: 'Persisting to database, indexing for search…',   color: 'amber',  pct: 100 },
]

const colorMap = {
  indigo:  { ring: 'border-indigo-500',  bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  bar: 'from-indigo-500 to-indigo-400' },
  purple:  { ring: 'border-purple-500',  bg: 'bg-purple-500/10',  text: 'text-purple-400',  bar: 'from-purple-500 to-purple-400' },
  teal:    { ring: 'border-teal-500',    bg: 'bg-teal-500/10',    text: 'text-teal-400',    bar: 'from-teal-500 to-teal-400'     },
  blue:    { ring: 'border-blue-500',    bg: 'bg-blue-500/10',    text: 'text-blue-400',    bar: 'from-blue-500 to-blue-400'     },
  emerald: { ring: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'from-emerald-500 to-emerald-400'},
  amber:   { ring: 'border-amber-500',   bg: 'bg-amber-500/10',   text: 'text-amber-400',   bar: 'from-amber-500 to-amber-400'   },
}

export default function RequirementInput() {
  const location = useLocation()
  const navigate = useNavigate()

  const [requirement, setRequirement]   = useState(location.state?.requirement || '')
  const [techStack, setTechStack]       = useState(['Java', 'Spring Boot', 'React', 'MongoDB', 'JWT', 'Docker'])
  const [loading, setLoading]           = useState(false)
  const [jobId, setJobId]               = useState(null)

  // Animated stage tracking (visual only — driven by animation timers)
  const [currentStage, setCurrentStage]   = useState(-1)
  const [completedStages, setCompletedStages] = useState([])
  const [stageProgress, setStageProgress] = useState(0)
  const stageTimerRef   = useRef(null)
  const progressTimerRef = useRef(null)

  const stopTimers = useCallback(() => {
    if (stageTimerRef.current)   clearTimeout(stageTimerRef.current)
    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
  }, [])

  // Visual stage animation (keeps UI lively while backend works)
  const startProgressAnimation = useCallback(() => {
    const animateStage = (idx) => {
      if (idx >= GENERATION_STAGES.length) return
      setCurrentStage(idx)
      setStageProgress(0)
      const stage = GENERATION_STAGES[idx]
      const tickInterval = 4000 / 100  // ~4 sec per stage
      let progress = 0
      progressTimerRef.current = setInterval(() => {
        progress += 1
        setStageProgress(Math.min(progress, 90))
        if (progress >= 90) clearInterval(progressTimerRef.current)
      }, tickInterval)
      stageTimerRef.current = setTimeout(() => {
        setCompletedStages(prev => [...prev, stage.id])
        animateStage(idx + 1)
      }, 4000)
    }
    animateStage(0)
  }, [])

  const toggleTech = (tech) =>
    setTechStack(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech])

  /* ═══════════════════════════════════════════
     REAL JOB POLLING — critical bug fix:
     previously only ran timer animations; now
     actually polls the backend for completion.
  ═══════════════════════════════════════════ */
  useJobPoller(
    jobId,
    // onComplete
    ({ projectId }) => {
      stopTimers()
      setCurrentStage(GENERATION_STAGES.length - 1)
      setStageProgress(100)
      setCompletedStages(GENERATION_STAGES.map(s => s.id))
      toast.success('🎉 Project generated successfully!')
      setTimeout(() => navigate(`/projects/${projectId}`), 700)
    },
    // onError
    (errMsg) => {
      stopTimers()
      setLoading(false)
      setJobId(null)
      setCurrentStage(-1)
      toast.error(errMsg || 'Generation failed. Please try again.')
    }
  )

  const handleGenerate = async () => {
    if (!requirement.trim()) return toast.error('Please describe your project first')
    if (techStack.length === 0) return toast.error('Select at least one technology')
    setLoading(true)
    setCompletedStages([])
    setCurrentStage(-1)
    setStageProgress(0)
    startProgressAnimation()
    try {
      const { data } = await generationApi.generateCode({ requirement, techStack })
      setJobId(data.jobId)
      // polling now driven by useJobPoller above ↑
    } catch (err) {
      stopTimers()
      setLoading(false)
      setCurrentStage(-1)
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.')
    }
  }

  useEffect(() => () => stopTimers(), [stopTimers])

  const overallPct = loading
    ? Math.round(((completedStages.length + stageProgress / 100) / GENERATION_STAGES.length) * 100)
    : 0

  /* ════════════════════════════════════════ RENDER ══════════════════════════════════════ */
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in">

      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Define Your{' '}
          <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Project Blueprint
          </span>
        </h1>
        <p className="text-slate-500 text-sm">Describe your idea in plain language. Our AI will architect and write the complete codebase.</p>
      </div>

      {/* ─── LOADING STATE ─── */}
      {loading ? (
        <div className="glass-panel p-8 space-y-7 animate-fade-in">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span className="animate-spin-fast inline-block">⚙️</span> AI is Building Your Project
              </h2>
              <p className="text-xs text-slate-500 max-w-lg truncate">{requirement}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black" style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {overallPct}%
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">Overall Progress</div>
              {jobId && (
                <div className="text-[9px] text-slate-700 mt-1 font-mono">ID: {jobId.slice(0, 8)}…</div>
              )}
            </div>
          </div>

          {/* Master progress bar */}
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(20,25,50,0.8)' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${overallPct}%`,
                background: 'linear-gradient(90deg, #6366f1, #a855f7, #14b8a6)',
                boxShadow: '0 0 12px rgba(99,102,241,0.4)',
              }}
            />
          </div>

          {/* Stage cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GENERATION_STAGES.map((stage, idx) => {
              const done   = completedStages.includes(stage.id)
              const active = currentStage === idx && !done
              const c      = colorMap[stage.color]
              return (
                <div key={stage.id}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${
                    done   ? 'opacity-60 border-slate-800/40' :
                    active ? `${c.ring} shadow-lg` :
                             'border-slate-900/60 opacity-30'
                  }`}
                  style={{ background: done ? 'rgba(15,20,40,0.4)' : active ? 'rgba(15,20,40,0.8)' : 'rgba(10,14,28,0.4)' }}
                >
                  <div className="flex items-start gap-3 relative z-10">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 border text-sm ${
                      done   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      active ? `${c.bg} ${c.text} ${c.ring}` :
                               'bg-slate-900 text-slate-700 border-slate-800'
                    }`}>
                      {done ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className={`text-xs font-bold truncate ${done ? 'text-slate-500' : active ? 'text-white' : 'text-slate-700'}`}>
                        {stage.label}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${active ? 'text-slate-400' : 'text-slate-700'}`}>
                        {done ? 'Complete ✓' : stage.sub}
                      </div>
                      {active && (
                        <div className="mt-2 h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(20,25,50,0.8)' }}>
                          <div className={`h-full bg-gradient-to-r ${c.bar} rounded-full transition-all duration-300`}
                            style={{ width: `${stageProgress}%` }} />
                        </div>
                      )}
                    </div>
                    {active && (
                      <span className="flex h-2.5 w-2.5 flex-shrink-0 mt-1 relative">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.bg} opacity-75`} />
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${c.bg}`} />
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tech stack pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
            <span className="text-[10px] text-slate-600 self-center mr-1">Stack:</span>
            {techStack.map(t => (
              <span key={t} className="chip text-[10px]">{t}</span>
            ))}
          </div>
        </div>

      ) : (
        /* ─── FORM STATE ─── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main Form */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass-panel p-6 space-y-5">
              {/* Description textarea */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-200">Project Description</label>
                <div className="relative">
                  <textarea
                    className="w-full h-44 p-4 text-sm text-slate-200 placeholder:text-slate-600 outline-none resize-none transition-all duration-200 rounded-xl"
                    style={{
                      background: 'rgba(8, 12, 28, 0.8)',
                      border: '1px solid rgba(99,102,241,0.15)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.15)'}
                    placeholder="Describe your project (e.g. Build a Hospital Management System with Doctor schedules, Patient records, Appointment booking, JWT auth, and Docker deployment...)"
                    value={requirement}
                    onChange={e => setRequirement(e.target.value)}
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] text-slate-700 font-mono">
                    {requirement.length} chars
                  </div>
                </div>
              </div>

              {/* Tech stack */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-200">Tech Stack</label>
                <p className="text-xs text-slate-600">Click to select/deselect technologies.</p>
                <div className="flex flex-wrap gap-2">
                  {TECH_OPTIONS.map(({ name }) => {
                    const selected = techStack.includes(name)
                    return (
                      <button
                        key={name}
                        onClick={() => toggleTech(name)}
                        className={`chip transition-all duration-200 ${selected ? 'chip-active' : ''}`}
                      >
                        {selected && <span className="text-indigo-400">✓</span>}
                        {name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !requirement.trim()}
                className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2.5 mt-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Full Project
              </button>
            </div>

            {/* How it works */}
            <div className="glass-panel p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">How It Works</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { num: '01', label: 'Describe', desc: 'Write your project idea in plain English' },
                  { num: '02', label: 'AI Plans', desc: 'Architecture & file structure designed by AI' },
                  { num: '03', label: 'Code Gen', desc: 'Complete source files generated instantly' },
                  { num: '04', label: 'Review', desc: 'Browse, edit, export or iterate' },
                ].map(s => (
                  <div key={s.num} className="text-center space-y-1.5 p-3 rounded-xl" style={{ background: 'rgba(20,25,50,0.4)' }}>
                    <div className="text-xl font-black" style={{ color: 'rgba(99,102,241,0.4)' }}>{s.num}</div>
                    <div className="text-xs font-bold text-slate-300">{s.label}</div>
                    <div className="text-[10px] text-slate-600 leading-relaxed">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Templates */}
          <div className="space-y-4">
            <div className="glass-panel p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                <span className="text-sm">💡</span>
                <h3 className="text-sm font-bold text-slate-200">Try a Template</h3>
              </div>
              <p className="text-xs text-slate-600">Click to instantly prefill.</p>
              <div className="space-y-2">
                {EXAMPLE_PROMPTS.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setRequirement(ex.desc)}
                    className="w-full text-left p-3.5 rounded-xl transition-all duration-200 group space-y-1"
                    style={{
                      background: 'rgba(20,25,50,0.5)',
                      border: '1px solid rgba(99,102,241,0.1)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.1)'}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">{ex.title}</span>
                      <span className="ml-auto badge badge-indigo">{ex.tag}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">{ex.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Model badge */}
            <div className="glass-panel p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 badge-indigo border border-indigo-500/20">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Powered by Gemini Pro</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Multi-agent · Blueprint → Code loop · RAG</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
