import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { projectApi } from '../api/projectApi'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [promptText, setPromptText] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    projectApi.list(0, 6)
      .then(({ data }) => {
        setProjects(data.content || [])
      })
      .catch(() => {})
  }, [])

  const handleHeroSubmit = (e) => {
    e.preventDefault()
    if (!promptText.trim()) return
    // Navigate to generator page with prefilled prompt state
    navigate('/generate', { state: { requirement: promptText } })
  }

  // Helper to resolve icon and colors based on project titles
  const getProjectDesign = (title, index) => {
    const t = title.toLowerCase()
    if (t.includes('hospital') || t.includes('clinic') || t.includes('medical')) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      }
    }
    if (t.includes('shop') || t.includes('commerce') || t.includes('market') || t.includes('cart')) {
      return {
        bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      }
    }
    if (t.includes('student') || t.includes('school') || t.includes('academy') || t.includes('learn') || t.includes('library')) {
      return {
        bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        )
      }
    }
    if (t.includes('hotel') || t.includes('room') || t.includes('booking') || t.includes('stay')) {
      return {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
      }
    }
    if (t.includes('blog') || t.includes('post') || t.includes('article') || t.includes('news')) {
      return {
        bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      }
    }
    
    // Cycle defaults
    const designs = [
      {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      },
      {
        bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      },
      {
        bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        )
      },
      {
        bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )
      }
    ]
    return designs[index % designs.length]
  }

  // Pre-fill prompt cards
  const prefillPrompts = ['Spring Boot', 'React', 'MongoDB', 'JWT', 'Docker']

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 animate-fade-in">
      
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          Welcome back, <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{user?.fullName?.split(' ')[0] || 'Rahul'}!</span> 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Ready to build something amazing today?</p>
      </div>

      {/* Top Section: Hero & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Hero Card */}
        <div className="lg:col-span-2 glass-panel p-8 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0a0f1d] to-slate-900 border-slate-800/80 shadow-2xl">
          {/* Subtle logo glows in background */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none flex items-center justify-center">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-indigo-500 rounded-full blur-2xl animate-pulse"></div>
              {/* Fake visual floating logo elements representing stack icons */}
              <div className="absolute top-1/4 left-1/4 h-8 w-8 text-teal-400">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm1 15.5h-2v-6h2v6zm0-8h-2v-2h2v2z"/></svg>
              </div>
              <div className="absolute bottom-1/4 right-1/4 h-10 w-10 text-indigo-400">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2.2C6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8 9.8-4.4 9.8-9.8-4.4-9.8-9.8-9.8zm0 18c-4.5 0-8.2-3.7-8.2-8.2s3.7-8.2 8.2-8.2 8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2z"/></svg>
              </div>
            </div>
          </div>

          <div className="space-y-3 z-10 max-w-xl">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Build Complete <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Projects with AI</span>
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Describe your idea in simple words and let AI create full-stack applications for you.
            </p>
          </div>

          {/* Prompt pill input container */}
          <form onSubmit={handleHeroSubmit} className="mt-8 z-10 w-full relative">
            <div className="flex items-center bg-slate-950/80 border border-slate-850 hover:border-slate-800 focus-within:border-indigo-500/50 rounded-full p-1.5 transition-all duration-200 shadow-inner">
              <span className="pl-3.5 text-indigo-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </span>
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:ring-0"
                placeholder="E.g. Build a Hospital Management System with Spring Boot, React, MongoDB and JWT..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
              />
              <button 
                type="submit"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition duration-200 flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95"
              >
                <span>Generate Project</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>

          {/* Underlay tech tags */}
          <div className="flex flex-wrap gap-2 mt-5 z-10">
            {prefillPrompts.map((tech) => (
              <span key={tech} className="px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[10px] font-semibold text-slate-400">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Right Stats Column */}
        <div className="glass-panel p-6 flex flex-col justify-between space-y-4 bg-slate-900/30">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-2 flex justify-between items-center">
            <span>Overview</span>
            <span className="text-[10px] text-teal-400 lowercase font-medium">Live Analytics</span>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {/* Stat Item 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Projects</div>
                  <div className="text-sm font-extrabold text-slate-100">12 Projects</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                <span className="scale-75">▲</span> 20%
              </span>
            </div>

            {/* Stat Item 2 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Generated Files</div>
                  <div className="text-sm font-extrabold text-slate-100">48 Files</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                <span className="scale-75">▲</span> 32%
              </span>
            </div>

            {/* Stat Item 3 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Lines of Code</div>
                  <div className="text-sm font-extrabold text-slate-100">24.5K Lines</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                <span className="scale-75">▲</span> 18%
              </span>
            </div>

            {/* Stat Item 4 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Hours Saved</div>
                  <div className="text-sm font-extrabold text-slate-100">36 Hours</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                <span className="scale-75">▲</span> 25%
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Row: Recent Projects & AI Assistant card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column: Grid of recent project cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Projects</h2>
            <Link to="/history" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition">View All</Link>
          </div>

          {projects.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-400">
              <p>No projects generated yet. Submit a prompt above to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p, idx) => {
                const design = getProjectDesign(p.title, idx)
                return (
                  <div key={p.id} className="glass-panel p-5 flex items-center justify-between glass-panel-hover group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center border font-bold ${design.bg}`}>
                        {design.icon}
                      </div>
                      <div className="min-w-0">
                        <Link to={`/projects/${p.id}`} className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors duration-150 truncate block">
                          {p.title}
                        </Link>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {p.techStack ? p.techStack.join(' · ') : 'Spring Boot · React · MongoDB'}
                        </div>
                        <div className="text-[10px] text-slate-600 mt-2">
                          1 day ago
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between h-full py-1">
                      <button className="p-1 rounded text-slate-600 hover:text-slate-400 hover:bg-slate-900 transition">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 10a2 2 0 11-2 2 2 2 0 012-2zm0-6a2 2 0 11-2 2 2 2 0 012-2zm0 12a2 2 0 11-2 2 2 2 0 012-2z" />
                        </svg>
                      </button>
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 mt-4 uppercase">
                        {p.status || 'COMPLETED'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: AI Assistant welcome card */}
        <div className="glass-panel p-6 flex flex-col justify-between space-y-6 bg-slate-900/30">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Assistant</h3>
            <span className="text-[10px] text-indigo-400 font-semibold cursor-pointer">View All</span>
          </div>

          <div className="bg-[#0b0f19] p-5 rounded-2xl border border-slate-850 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-200">Hi {user?.fullName?.split(' ')[0] || 'Rahul'}! 👋</div>
                <div className="text-[10px] text-slate-400">I can help you with:</div>
              </div>
            </div>

            <ul className="space-y-2 text-[11px] text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-teal-400">✓</span> Generate complete projects
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal-400">✓</span> Explain code and concepts
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal-400">✓</span> Fix bugs and errors
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal-400">✓</span> Optimize your code
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal-400">✓</span> Add new features
              </li>
            </ul>
          </div>

          <button 
            onClick={() => navigate('/generate')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 transition duration-200 active:scale-[0.98]"
          >
            <svg className="w-4 h-4 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Start New Chat</span>
          </button>
        </div>

      </div>

      {/* Bottom Row: Capabilities & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column: Footer Capabilities bar */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-850">
            Platform Capabilities
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
              <div className="text-indigo-400 flex justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div className="text-[10px] font-bold text-slate-200">AI Code Gen</div>
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
              <div className="text-teal-400 flex justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="text-[10px] font-bold text-slate-200">Smart Arch</div>
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
              <div className="text-purple-400 flex justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-[10px] font-bold text-slate-200">Auto Docs</div>
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
              <div className="text-blue-400 flex justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-[10px] font-bold text-slate-200">Unit Tests</div>
            </div>

            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
              <div className="text-amber-400 flex justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="text-[10px] font-bold text-slate-200">One-Click Deploy</div>
            </div>

          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="glass-panel p-6 space-y-4 bg-slate-900/30">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Activity</h3>
            <span className="text-[10px] text-indigo-400 font-semibold cursor-pointer">View All</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="text-teal-400 font-bold">●</span>
                <span>Generated UserController.java</span>
              </div>
              <span className="text-[10px] text-slate-500">2 hours ago</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="text-teal-400 font-bold">●</span>
                <span>Updated database schema</span>
              </div>
              <span className="text-[10px] text-slate-500">3 hours ago</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="text-teal-400 font-bold">●</span>
                <span>Created React components</span>
              </div>
              <span className="text-[10px] text-slate-500">5 hours ago</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2.5">
                <span className="text-teal-400 font-bold">●</span>
                <span>Generated API documentation</span>
              </div>
              <span className="text-[10px] text-slate-500">1 day ago</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
