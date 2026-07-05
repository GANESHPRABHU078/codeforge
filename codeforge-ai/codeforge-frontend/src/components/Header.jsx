import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { projectApi } from '../api/projectApi'
import axiosClient from '../api/axiosClient'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [backendOnline, setBackendOnline] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const searchRef = useRef(null)
  const userMenuRef = useRef(null)
  const debounceRef = useRef(null)

  /* ── Keyboard shortcut: Ctrl+K / Cmd+K ── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
        setTimeout(() => searchRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  /* ── Close menus on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ── Backend health check ── */
  useEffect(() => {
    const check = () => {
      axiosClient.get('/auth/health').then(() => setBackendOnline(true)).catch(() => setBackendOnline(false))
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  /* ── Debounced project search ── */
  const handleSearch = useCallback((q) => {
    setSearchQuery(q)
    if (!q.trim()) { setSearchResults([]); return }
    clearTimeout(debounceRef.current)
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await projectApi.search(q)
        setSearchResults((data.content || data || []).slice(0, 6))
      } catch { setSearchResults([]) }
      finally { setSearching(false) }
    }, 300)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header
      className="h-16 px-6 flex items-center justify-between sticky top-0 z-40 select-none"
      style={{
        background: 'rgba(6, 9, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
      }}
    >
      {/* Left — page breadcrumb / greeting */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <div className="text-xs font-bold text-slate-300">
            Welcome back, <span className="text-indigo-400">{user?.fullName?.split(' ')[0] || 'Developer'}</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">What are we building today?</div>
        </div>
      </div>

      {/* Center — Global Search */}
      <div className="flex-1 max-w-sm mx-6 relative hidden md:block">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
            {searching
              ? <svg className="w-3.5 h-3.5 animate-spin-fast" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            }
          </div>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search projects..."
            className="glass-input pl-8 pr-12 py-2 text-xs w-full rounded-full"
            style={{ borderRadius: '999px' }}
          />
          <div className="absolute inset-y-0 right-3 flex items-center gap-1 pointer-events-none">
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-600 border border-slate-800">⌘K</kbd>
          </div>
        </div>

        {/* Search dropdown */}
        {searchOpen && searchQuery && (
          <div className="absolute top-full mt-2 left-0 right-0 glass-panel py-2 animate-scale-in z-50"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6)', borderRadius: '1rem' }}>
            {searchResults.length === 0 && !searching && (
              <div className="px-4 py-3 text-xs text-slate-500 text-center">No projects found for "{searchQuery}"</div>
            )}
            {searchResults.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]) }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors"
              >
                <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">{p.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {(p.techStack || []).slice(0, 3).join(' · ')}
                  </div>
                </div>
                <span className={`ml-auto badge ${p.status === 'COMPLETED' ? 'badge-emerald' : 'badge-amber'}`}>
                  {p.status || 'DONE'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {/* Backend status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full mr-1"
          style={{ background: 'rgba(20,25,50,0.6)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <span className={`h-1.5 w-1.5 rounded-full ${
            backendOnline === null ? 'bg-amber-400 animate-pulse' :
            backendOnline ? 'bg-emerald-400 animate-status-pulse' : 'bg-rose-400'
          }`} />
          <span className="text-[9px] font-semibold text-slate-500">
            {backendOnline === null ? 'Connecting' : backendOnline ? 'API Online' : 'API Offline'}
          </span>
        </div>

        {/* New Project CTA */}
        <Link to="/generate" className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 hidden sm:flex">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>New</span>
        </Link>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(v => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-150 hover:bg-white/[0.05]"
            style={{ border: '1px solid rgba(99,102,241,0.1)' }}
          >
            <div className="h-7 w-7 rounded-lg overflow-hidden flex-shrink-0"
              style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.fullName || 'user'}`}
                alt="avatar"
                className="w-full h-full"
              />
            </div>
            <svg className={`w-3 h-3 text-slate-500 transition-transform duration-200 hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-52 glass-panel py-1.5 animate-scale-in"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
              {/* User info */}
              <div className="px-4 py-2.5 border-b" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
                <div className="text-xs font-bold text-slate-200 truncate">{user?.fullName || 'User'}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email || ''}</div>
              </div>

              {[
                { label: 'Profile', icon: '👤', path: '/profile' },
                { label: 'My Projects', icon: '📁', path: '/history' },
                { label: 'Settings', icon: '⚙️', path: '/settings' },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="border-t mt-1 pt-1" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
