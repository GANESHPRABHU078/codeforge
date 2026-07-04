import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 shadow-lg shadow-slate-950/20">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center font-bold text-slate-900 shadow-md shadow-teal-500/25">
          F
        </div>
        <Link to="/" className="font-extrabold text-xl bg-gradient-to-r from-teal-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent hover:opacity-90 transition duration-200">
          ProjectForge AI
        </Link>
      </div>
      
      <div className="flex items-center gap-6 text-sm">
        {user ? (
          <>
            <Link to="/dashboard" className="text-slate-300 hover:text-teal-400 font-medium transition duration-200">Dashboard</Link>
            <Link to="/history" className="text-slate-300 hover:text-teal-400 font-medium transition duration-200">History</Link>
            <div className="h-4 w-px bg-slate-800"></div>
            <span className="text-slate-400 font-medium">{user.fullName}</span>
            <button onClick={handleLogout} className="btn-secondary py-1.5 px-4 text-xs font-semibold">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate-300 hover:text-teal-400 font-medium transition duration-200">Login</Link>
            <Link to="/register" className="btn-primary py-1.5 px-4 text-xs font-semibold">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
