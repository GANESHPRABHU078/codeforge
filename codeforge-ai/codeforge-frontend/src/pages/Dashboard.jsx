import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { projectApi } from '../api/projectApi'
import { useAuth } from '../hooks/useAuth'

// ─── Animated counter hook ───────────────────────────────
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!target) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start = Math.min(start + step, target)
      setValue(Math.floor(start))
      if (start >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

// ─── Time-ago helper ─────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

// ─── Project card design by category ────────────────────
function getProjectStyle(title = '', idx = 0) {
  const t = title.toLowerCase()
  const styles = [
    { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)',  text: '#818cf8', emoji: '🏗️' },
    { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', text: '#c084fc', emoji: '⚡' },
    { bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.25)', text: '#2dd4bf', emoji: '🌿' },
    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', text: '#60a5fa', emoji: '🔷' },
    { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#fbbf24', emoji: '🌟' },
    { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)', text: '#f472b6', emoji: '💎' },
  ]
  if (t.includes('hospital') || t.includes('health')) return { ...styles[2], emoji: '🏥' }
  if (t.includes('shop') || t.includes('commerce'))   return { ...styles[4], emoji: '🛒' }
  if (t.includes('school') || t.includes('library'))  return { ...styles[3], emoji: '📚' }
  if (t.includes('task') || t.includes('kanban'))     return { ...styles[0], emoji: '📋' }
  if (t.includes('blog') || t.includes('news'))       return { ...styles[5], emoji: '📰' }
  if (t.includes('hotel') || t.includes('booking'))   return { ...styles[1], emoji: '🏨' }
  return styles[idx % styles.length]
}

const QUICK_ACTIONS = [
  { label: 'New Project', desc: 'Generate with AI', icon: '⚡', path: '/generate', color: '#818cf8' },
  { label: 'My Projects', desc: 'Browse history',   icon: '📁', path: '/history',  color: '#2dd4bf' },
  { label: 'AI Assistant', desc: 'Chat with code',  icon: '🤖', path: '/assistant',color: '#c084fc' },
  { label: 'Snippets',    desc: 'Code library',     icon: '📝', path: '/snippets', color: '#60a5fa' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [projects, setProjects]   = useState([])
  const [stats, setStats]         = useState({ projects: 0, files: 0, linesOfCode: 0, hoursSaved: 0 })
  const [promptText, setPromptText] = useState('')
  const [loadingProjects, setLoadingProjects] = useState(true)

  // Animated counters
  const cProjects  = useCountUp(stats.projects,  1000)
  const cFiles     = useCountUp(stats.files,     1200)
  const cLines     = useCountUp(stats.linesOfCode, 1500)
  const cHours     = useCountUp(stats.hoursSaved,  800)

  useEffect(() => {
    // Load recent projects
    projectApi.list(0, 6)
      .then(({ data }) => {
        const items = data.content || data || []
        setProjects(items)
        // Derive stats from real project data
        const total = items.length
        setStats({
          projects:    total,
          files:       total * 8,       // rough avg files per project
          linesOfCode: total * 2200,    // rough avg LOC
          hoursSaved:  total * 3,       // rough avg hours saved
        })
      })
      .catch(() => {})
      .finally(() => setLoadingProjects(false))
  }, [])

  const handleHeroSubmit = (e) => {
    e.preventDefault()
    if (!promptText.trim()) return
    navigate('/generate', { state: { requirement: promptText } })
  }

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-fade-in">

      {/* ── Welcome Row ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 flex-wrap">
            Welcome back,{' '}
            <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user?.fullName?.split(' ')[0] || 'Developer'}!
            </span>{' '}
            👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Ready to build something amazing today?</p>
        </div>
        <Link to="/generate" className="btn-primary text-xs px-5 py-2.5 hidden lg:flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((qa) => (
          <Link
            key={qa.label}
            to={qa.path}
            className="glass-panel glass-panel-hover p-4 flex items-center gap-3 group cursor-pointer"
          >
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
              style={{ background: `${qa.color}22`, border: `1px solid ${qa.color}44` }}>
              {qa.icon}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">{qa.label}</div>
              <div className="text-[10px] text-slate-600 truncate">{qa.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Hero + Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Hero Card */}
        <div className="lg:col-span-2 glass-panel p-8 flex flex-col justify-between relative overflow-hidden"
          style={{ minHeight: '240px' }}>
          {/* Ambient orbs */}
          <div className="orb orb-indigo w-72 h-72" style={{ right: '-4rem', top: '-4rem', opacity: 0.12 }} />
          <div className="orb orb-purple w-48 h-48" style={{ right: '4rem', bottom: '-3rem', opacity: 0.08 }} />

          <div className="relative z-10 space-y-2">
            <div className="badge badge-indigo mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              AI-Powered Platform
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Build Complete{' '}
              <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Projects with AI
              </span>
            </h2>
            <p className="text-slate-500 text-xs leading-relaxed max-w-md">
              Describe your idea in simple words and let our multi-agent AI create full-stack applications.
            </p>
          </div>

          <form onSubmit={handleHeroSubmit} className="relative z-10 mt-6">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl"
              style={{ background: 'rgba(8,12,28,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <span className="pl-2 text-indigo-400 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <input
                type="text"
                className="flex-1 bg-transparent outline-none text-xs text-slate-200 placeholder:text-slate-600 py-2 px-1"
                placeholder="E.g. Build a Hospital Management System with Spring Boot, React, MongoDB and JWT…"
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
              />
              <button type="submit" className="btn-primary text-xs px-4 py-2 flex-shrink-0 flex items-center gap-1.5" style={{ borderRadius: '0.75rem' }}>
                <span>Generate</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Live Stats Panel */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Stats</span>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-status-pulse" />
              <span className="text-[10px] text-emerald-500 font-semibold">Live</span>
            </div>
          </div>

          {[
            { label: 'Projects',       value: cProjects,  unit: '',  icon: '📁', color: '#818cf8' },
            { label: 'Generated Files', value: cFiles,    unit: '',  icon: '📄', color: '#2dd4bf' },
            { label: 'Lines of Code',  value: cLines,     unit: '',  icon: '💻', color: '#c084fc', format: v => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v },
            { label: 'Hours Saved',    value: cHours,     unit: 'h', icon: '⏱️', color: '#fbbf24' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}33` }}>
                {stat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-slate-600">{stat.label}</div>
                <div className="text-sm font-extrabold text-white animate-count">
                  {stat.format ? stat.format(stat.value) : stat.value}{stat.unit}
                </div>
              </div>
              <span className="badge badge-emerald text-[9px]">↑</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Projects + AI Assistant ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Projects</h2>
            <Link to="/history" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              View All →
            </Link>
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="glass-panel p-5 space-y-3">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="glass-panel p-10 text-center space-y-3">
              <div className="text-4xl">🚀</div>
              <p className="text-sm text-slate-400 font-semibold">No projects yet</p>
              <p className="text-xs text-slate-600">Submit a prompt above to generate your first project!</p>
              <Link to="/generate" className="btn-primary text-xs px-4 py-2 inline-flex">Generate Now</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.map((p, idx) => {
                const style = getProjectStyle(p.title, idx)
                return (
                  <div key={p.id}
                    className="glass-panel glass-panel-hover p-4 flex items-start gap-3 group cursor-pointer"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                      {style.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">{p.title}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5 truncate">
                        {(p.techStack || ['Spring Boot', 'React']).slice(0, 3).join(' · ')}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`badge ${p.status === 'COMPLETED' ? 'badge-emerald' : 'badge-amber'}`}>
                          {p.status || 'COMPLETED'}
                        </span>
                        <span className="text-[9px] text-slate-700">{timeAgo(p.createdAt)}</span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* AI Assistant Card */}
        <div className="glass-panel p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Assistant</h3>
          </div>

          <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(8,12,28,0.7)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}>
                <span className="text-sm">🤖</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Hi {user?.fullName?.split(' ')[0] || 'Developer'}! 👋</div>
                <div className="text-[10px] text-slate-600">I can help you with:</div>
              </div>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              {['Generate complete projects', 'Explain code & concepts', 'Fix bugs & errors', 'Optimize your code', 'Add new features'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-teal-400 text-xs">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => navigate('/generate')}
            className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Start New Project
          </button>
        </div>
      </div>

      {/* ── Platform Capabilities ── */}
      <div className="glass-panel p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform Capabilities</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: '⚡', label: 'AI Code Gen',      color: '#818cf8' },
            { icon: '🏗️', label: 'Smart Arch',       color: '#2dd4bf' },
            { icon: '📖', label: 'Auto Docs',         color: '#c084fc' },
            { icon: '🧪', label: 'Unit Tests',        color: '#60a5fa' },
            { icon: '🚀', label: 'Deploy Ready',      color: '#fbbf24' },
          ].map(cap => (
            <div key={cap.label}
              className="p-3 rounded-xl text-center space-y-2 transition-all duration-200 hover:-translate-y-0.5 cursor-default"
              style={{ background: 'rgba(20,25,50,0.5)', border: '1px solid rgba(99,102,241,0.08)' }}>
              <div className="text-xl">{cap.icon}</div>
              <div className="text-[10px] font-bold text-slate-400">{cap.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
