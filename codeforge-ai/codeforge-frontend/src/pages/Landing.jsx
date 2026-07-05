import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const FEATURES = [
  { icon: '⚡', title: 'Instant Code Generation', desc: 'From a plain text prompt to a full-stack project in under 60 seconds. No boilerplate, no setup — just ideas.' },
  { icon: '🏗️', title: 'Smart Architecture', desc: 'AI designs the optimal folder structure, dependency graph, and data models before writing a single line.' },
  { icon: '🔐', title: 'JWT Auth Built-in', desc: 'Every project ships with secure JWT authentication, role-based access, and refresh token flow out of the box.' },
  { icon: '📖', title: 'Auto Documentation', desc: 'Javadoc, OpenAPI specs, and README files are generated alongside your code — always in sync.' },
  { icon: '🧪', title: 'Unit Tests Included', desc: 'JUnit / Jest tests for every service and component. Ship with confidence from day one.' },
  { icon: '🚀', title: 'Deploy-Ready', desc: 'Docker Compose, Dockerfiles, and Render/Vercel configs are generated so you can deploy immediately.' },
]

const TECH_STACK = [
  { name: 'Spring Boot', logo: '🍃', color: '#6db33f' },
  { name: 'React',       logo: '⚛️',  color: '#61dafb' },
  { name: 'MongoDB',     logo: '🍃', color: '#47a248' },
  { name: 'JWT',         logo: '🔐', color: '#818cf8' },
  { name: 'Docker',      logo: '🐳', color: '#2496ed' },
  { name: 'Python',      logo: '🐍', color: '#f7cc42' },
  { name: 'Node.js',     logo: '⬢',  color: '#68a063' },
  { name: 'PostgreSQL',  logo: '🐘', color: '#336791' },
]

const EXAMPLE_PROMPTS = [
  'Build a Hospital Management System with doctor schedules, patient records, JWT auth, and Docker deployment using Spring Boot + React + MongoDB',
  'Create an E-Commerce platform with product catalog, cart, payment integration, admin dashboard using Spring Boot, React, and PostgreSQL',
  'Develop a Library Management System with book catalog, member management, fine tracking using Spring Boot, MongoDB, and JWT security',
]

function TypingEffect({ prompts }) {
  const [idx, setIdx]   = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const full = prompts[idx]
    let timeout
    if (!deleting && text.length < full.length) {
      timeout = setTimeout(() => setText(full.slice(0, text.length + 1)), 28)
    } else if (!deleting && text.length === full.length) {
      timeout = setTimeout(() => setDeleting(true), 2500)
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(text.slice(0, -1)), 12)
    } else if (deleting && text.length === 0) {
      setDeleting(false)
      setIdx((idx + 1) % prompts.length)
    }
    return () => clearTimeout(timeout)
  }, [text, deleting, idx, prompts])

  return (
    <span className="text-slate-300">
      {text}
      <span className="animate-blink text-indigo-400">|</span>
    </span>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const handleTry = (e) => {
    e.preventDefault()
    navigate('/register')
  }

  return (
    <div className="min-h-screen" style={{ background: '#050810' }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7,#14b8a6)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="font-extrabold text-sm text-white">
            Code<span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Forge</span>
            <span className="ml-1 text-slate-600 font-normal">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-xs text-slate-400 hover:text-white font-semibold transition-colors px-3 py-2">Sign in</Link>
          <Link to="/register" className="btn-primary text-xs px-4 py-2">Get Started Free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 py-20 md:py-32 text-center">
        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb orb-indigo w-96 h-96" style={{ left: '-5rem', top: '-5rem', opacity: 0.15, filter: 'blur(80px)' }} />
          <div className="orb orb-purple w-80 h-80" style={{ right: '-4rem', top: '5rem', opacity: 0.12, filter: 'blur(80px)' }} />
          <div className="orb orb-teal w-64 h-64" style={{ left: '30%', bottom: '-3rem', opacity: 0.08, filter: 'blur(80px)' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 badge badge-indigo text-xs px-4 py-1.5 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Powered by Gemini Pro · Multi-Agent Pipeline
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight animate-fade-up">
            Generate Complete{' '}
            <span style={{ background: 'linear-gradient(135deg,#818cf8 0%,#c084fc 40%,#38bdf8 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Full-Stack Apps
            </span>
            {' '}with AI
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-up delay-150">
            Describe your idea in plain English. CodeForge AI architects, designs, and writes a production-ready codebase — backend, frontend, tests, and deployment configs included.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up delay-300">
            <Link to="/register" className="btn-primary text-sm px-8 py-3.5 font-bold flex items-center gap-2 w-full sm:w-auto justify-center">
              <span>🚀</span> Start Building Free
            </Link>
            <Link to="/login" className="btn-secondary text-sm px-8 py-3.5 font-bold w-full sm:w-auto text-center">
              Sign In →
            </Link>
          </div>

          {/* Typing demo */}
          <div className="animate-fade-up delay-400">
            <div className="max-w-2xl mx-auto mt-4 p-4 rounded-2xl text-left text-xs"
              style={{ background: 'rgba(8,12,28,0.8)', border: '1px solid rgba(99,102,241,0.2)', fontFamily: 'JetBrains Mono, monospace' }}>
              <div className="text-slate-600 mb-2 text-[10px]">// Try it now →</div>
              <TypingEffect prompts={EXAMPLE_PROMPTS} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="px-6 py-12 border-t border-b" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
        <p className="text-center text-xs text-slate-600 uppercase tracking-widest font-bold mb-6">Generates projects with your favourite stack</p>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {TECH_STACK.map(t => (
            <div key={t.name} className="chip flex items-center gap-2 px-4 py-2 text-xs">
              <span className="text-sm">{t.logo}</span>
              {t.name}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <div className="badge badge-purple mx-auto">Everything Included</div>
          <h2 className="text-3xl font-extrabold text-white">One Prompt. Everything Generated.</h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">Stop spending hours on boilerplate. CodeForge AI handles the entire project structure so you can focus on what matters.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="glass-panel glass-panel-hover p-6 space-y-3 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
              <div className="text-3xl">{f.icon}</div>
              <h3 className="text-sm font-bold text-white">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center rounded-3xl p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="orb orb-indigo w-60 h-60" style={{ left: '-3rem', top: '-3rem', opacity: 0.15 }} />
          <div className="orb orb-purple w-48 h-48" style={{ right: '-2rem', bottom: '-2rem', opacity: 0.1 }} />
          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl font-black text-white">Ready to Build 10x Faster?</h2>
            <p className="text-slate-400 text-sm">Join developers already generating full-stack applications in minutes.</p>
            <Link to="/register" className="btn-primary text-sm px-8 py-3.5 font-bold inline-flex items-center gap-2">
              <span>⚡</span> Get Started Free — No Credit Card
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-8 border-t text-center" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-sm">💻</span>
          <span className="text-xs text-slate-600">Built with CodeForge AI · React + Spring Boot + MongoDB</span>
        </div>
        <p className="text-[10px] text-slate-700">© 2026 CodeForge AI. All rights reserved.</p>
      </footer>
    </div>
  )
}
