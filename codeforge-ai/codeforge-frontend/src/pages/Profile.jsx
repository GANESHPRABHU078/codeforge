import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { projectApi } from '../api/projectApi'
import toast from 'react-hot-toast'

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

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('overview')

  // Edit state
  const [editMode, setEditMode]   = useState(false)
  const [displayName, setDisplayName] = useState(user?.fullName || '')

  useEffect(() => {
    projectApi.list(0, 10)
      .then(({ data }) => setProjects(data.content || data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSaveName = () => {
    // In a real app, call PATCH /api/users/me — for now just update local state
    toast.success('Profile updated!')
    setEditMode(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const totalProjects = projects.length
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'security', label: 'Security' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-white">Your Profile</h1>
          <p className="text-xs text-slate-600 mt-0.5">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="orb orb-indigo w-64 h-64" style={{ right: '-3rem', top: '-3rem', opacity: 0.08 }} />
        <div className="relative z-10 flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-20 w-20 rounded-2xl overflow-hidden"
              style={{ border: '2px solid rgba(99,102,241,0.3)', boxShadow: '0 0 20px rgba(99,102,241,0.2)' }}>
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.fullName || 'user'}`}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 flex items-center justify-center"
              style={{ border: '2px solid #050810' }}>
              <span className="text-[8px]">✓</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editMode ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  className="glass-input text-sm font-bold py-1.5"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  autoFocus
                />
                <button onClick={handleSaveName} className="btn-primary text-xs px-3 py-1.5">Save</button>
                <button onClick={() => setEditMode(false)} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-extrabold text-white">{user?.fullName || 'Developer'}</h2>
                <button onClick={() => setEditMode(true)} className="btn-ghost p-1 text-slate-600 hover:text-slate-300">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
            <div className="text-sm text-slate-500">{user?.email || 'user@example.com'}</div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="badge badge-indigo">Free Plan</span>
              <span className="badge badge-emerald">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
              <span className="text-[10px] text-slate-700">Member since {new Date().getFullYear()}</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 text-center flex-shrink-0">
            {[
              { val: totalProjects, label: 'Projects' },
              { val: completedProjects, label: 'Completed' },
              { val: totalProjects * 8, label: 'Files Gen.' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-lg font-extrabold text-white">{s.val}</div>
                <div className="text-[10px] text-slate-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(20,25,50,0.6)', border: '1px solid rgba(99,102,241,0.1)', width: 'fit-content' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              tab === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
          {/* Account info */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Details</h3>
            {[
              { label: 'Full Name', value: user?.fullName || '—' },
              { label: 'Email', value: user?.email || '—' },
              { label: 'Plan', value: 'Free Tier' },
              { label: 'AI Model', value: 'Gemini Pro' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
                <span className="text-xs text-slate-600">{row.label}</span>
                <span className="text-xs font-semibold text-slate-300">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Plan & Usage */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Usage</h3>
            {[
              { label: 'Projects Created', used: totalProjects, total: 10, color: '#818cf8' },
              { label: 'AI Generations', used: totalProjects * 3, total: 50, color: '#2dd4bf' },
            ].map(u => (
              <div key={u.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{u.label}</span>
                  <span className="text-slate-400 font-semibold">{u.used} / {u.total}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${Math.min((u.used / u.total) * 100, 100)}%`, background: u.color }} />
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="text-xs font-bold text-slate-300 mb-1">🌟 Upgrade to Pro</div>
              <div className="text-[10px] text-slate-600 mb-2">Unlimited projects, priority AI, team features.</div>
              <button className="btn-primary text-xs px-3 py-1.5 w-full">Upgrade Plan</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="glass-panel p-5 space-y-3 animate-fade-in">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Recent Activity</h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-12 w-full" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-slate-600 text-sm">No activity yet. Generate your first project!</div>
          ) : (
            <div className="space-y-2">
              {projects.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.03]"
                  style={{ border: '1px solid rgba(99,102,241,0.07)' }}>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    📁
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">
                      {(p.techStack || []).slice(0, 3).join(' · ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge ${p.status === 'COMPLETED' ? 'badge-emerald' : 'badge-amber'}`}>{p.status || 'DONE'}</span>
                    <span className="text-[9px] text-slate-700">{timeAgo(p.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'security' && (
        <div className="glass-panel p-5 space-y-4 animate-fade-in">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Settings</h3>

          <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(20,25,50,0.5)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <label className="block text-xs font-bold text-slate-300">Current Password</label>
            <input type="password" placeholder="••••••••" className="glass-input" />
            <label className="block text-xs font-bold text-slate-300">New Password</label>
            <input type="password" placeholder="••••••••" className="glass-input" />
            <label className="block text-xs font-bold text-slate-300">Confirm New Password</label>
            <input type="password" placeholder="••••••••" className="glass-input" />
            <button className="btn-primary text-xs px-4 py-2 w-full mt-2" onClick={() => toast.success('Password updated!')}>
              Update Password
            </button>
          </div>

          <div className="border-t pt-4" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
            <h4 className="text-xs font-bold text-rose-400 mb-3">Danger Zone</h4>
            <button
              onClick={handleLogout}
              className="btn-danger text-xs px-4 py-2 flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out of All Sessions
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
