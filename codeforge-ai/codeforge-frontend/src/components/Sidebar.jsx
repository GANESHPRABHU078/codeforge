import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      {
        name: 'Dashboard', path: '/dashboard',
        icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      },
      {
        name: 'New Project', path: '/generate',
        badge: 'AI',
        icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
      },
      {
        name: 'My Projects', path: '/history',
        icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
      },
      {
        name: 'AI Assistant', path: '/assistant',
        icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      },
    ]
  },
  {
    label: 'Library',
    items: [
      {
        name: 'Code Snippets', path: '/snippets',
        icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
      },
      {
        name: 'Favorites', path: '/favorites',
        icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
      },
    ]
  },
  {
    label: 'Account',
    items: [
      {
        name: 'Profile', path: '/profile',
        icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      },
      {
        name: 'Settings', path: '/settings',
        icon: <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      },
    ]
  }
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 text-slate-400 select-none transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? '4.5rem' : '15.5rem',
        background: 'rgba(6, 9, 20, 0.95)',
        borderRight: '1px solid rgba(99,102,241,0.1)',
      }}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo mark */}
          <div className="h-8 w-8 flex-shrink-0 rounded-xl flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #14b8a6 100%)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-xl border border-white/20 animate-ripple" />
          </div>
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <div className="text-sm font-extrabold text-white tracking-tight whitespace-nowrap">
                Code<span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Forge</span>
              </div>
              <div className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider">AI Platform</div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="btn-ghost p-1.5 flex-shrink-0 rounded-lg"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-4 overflow-y-auto space-y-4 scrollbar-thin">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-2.5 mb-1.5 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative group ${
                      active ? 'nav-active text-indigo-300' : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
                    }`}
                    style={collapsed ? { justifyContent: 'center' } : {}}
                  >
                    <span className={`flex-shrink-0 transition-transform duration-150 ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="ml-auto text-[8px] font-black px-1.5 py-0.5 rounded-md badge-indigo badge">
                        {item.badge}
                      </span>
                    )}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                        style={{ background: 'linear-gradient(180deg, #818cf8, #c084fc)' }} />
                    )}

                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="tooltip left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                        {item.name}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Upgrade Area */}
      <div className="px-2.5 pb-4 space-y-2" style={{ borderTop: '1px solid rgba(99,102,241,0.08)', paddingTop: '0.75rem' }}>
        {/* Upgrade CTA */}
        {!collapsed && (
          <div className="relative overflow-hidden rounded-xl p-3 animate-fade-in"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              <span className="text-[10px] font-bold text-amber-400">Upgrade to Pro</span>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed mb-2">Unlimited projects, priority AI, and team collaboration.</p>
            <button className="w-full py-1.5 rounded-lg text-[10px] font-bold text-white transition-all duration-200 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              Upgrade Now →
            </button>
          </div>
        )}

        {/* User profile row */}
        <div
          className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all duration-150 hover:bg-white/[0.04] group ${collapsed ? 'justify-center' : ''}`}
          onClick={() => navigate('/profile')}
          title={collapsed ? user?.fullName || 'Profile' : undefined}
        >
          <div className="h-8 w-8 flex-shrink-0 rounded-lg overflow-hidden border" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
            <img
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.fullName || 'user'}`}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-300 truncate group-hover:text-white transition-colors">{user?.fullName || 'User'}</div>
              <div className="text-[9px] text-slate-600 truncate">{user?.email || 'user@example.com'}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={(e) => { e.stopPropagation(); logout() }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all duration-150 hover:bg-rose-500/10 text-slate-600 hover:text-rose-400"
              title="Logout"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
