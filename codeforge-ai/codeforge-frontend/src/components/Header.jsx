import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-20 border-b border-slate-900 bg-[#090d16]/30 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left controls */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition duration-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-md mx-8 relative hidden md:block">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500/50 rounded-full pl-10 pr-16 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200"
          placeholder="Search projects..."
        />
        <div className="absolute inset-y-0 right-3.5 flex items-center">
          <kbd className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-850 text-slate-500 border border-slate-800">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-5">
        {/* Notification Bell */}
        <button className="p-2.5 rounded-full bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-white transition-all duration-200 hover:scale-105 relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-teal-400"></span>
        </button>

        {/* CTA Button */}
        <Link 
          to="/generate" 
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 hover:scale-[1.02] transition-all duration-150"
        >
          <span>New Project</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </Link>

        {/* Quick logout */}
        <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-slate-300 font-medium">
          Logout
        </button>
      </div>
    </header>
  )
}
