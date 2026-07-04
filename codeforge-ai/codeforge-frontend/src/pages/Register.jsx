import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans p-6 md:p-10 select-none">
      
      {/* Background glow points */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header Brand Logo */}
      <div className="flex items-center gap-3 z-10 w-full max-w-7xl mx-auto mb-6">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-teal-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <span className="font-extrabold text-lg tracking-tight text-white">
          ProjectForge <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
        </span>
      </div>

      {/* Main Split Screen Container */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-auto z-10">
        
        {/* Left Column: Branding, Illustration & Testimonial */}
        <div className="space-y-8 pr-0 lg:pr-8 hidden lg:block">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white">
              Build Anything.<br />
              From Ideas to <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">Real Projects</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              ProjectForge AI helps students and developers generate complete, production-ready projects using the power of AI and modern technologies.
            </p>
          </div>

          {/* Features Column Stack */}
          <div className="space-y-4 max-w-md">
            
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">AI-Powered Generation</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Generate full-stack projects from natural language requirements.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Smart & Secure</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Best practices, clean code, and secure implementation.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Complete Solution</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Code, documentation, tests, and deployment – all in one place.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Save Time</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Focus on building ideas, AI handles the heavy lifting.</p>
              </div>
            </div>

          </div>

          {/* User Review / Testimonial Box */}
          <div className="glass-panel p-5 bg-[#090d16]/50 max-w-md border-slate-850 space-y-4">
            <div className="text-[11px] leading-relaxed text-slate-300 italic">
              "ProjectForge AI transformed the way I build projects. It's like having a senior developer by your side!"
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold overflow-hidden text-white">
                  <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Rahul" alt="avatar" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Rahul Verma</div>
                  <div className="text-[10px] text-slate-500">Computer Science Student</div>
                </div>
              </div>
              <div className="flex text-amber-400 text-xs">
                ★★★★★
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Glassmorphic Auth Form Card */}
        <div className="glass-panel p-8 md:p-10 w-full max-w-lg mx-auto bg-slate-900/40 border-slate-800/80 shadow-2xl relative animate-fade-in">
          
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Create Account</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Register below to begin generating full-stack software.</p>
            </div>
          </div>

          {/* Form Tabs (Login vs SignUp) */}
          <div className="flex border-b border-slate-850 mt-6 text-sm font-semibold select-none">
            <Link 
              to="/login"
              className="flex-1 pb-3 text-center border-b-2 border-transparent text-slate-500 hover:text-slate-300 transition"
            >
              Login
            </Link>
            <Link 
              to="/register"
              className="flex-1 pb-3 text-center border-b-2 border-indigo-500 text-slate-200"
            >
              Sign Up
            </Link>
          </div>

          {/* Forms Body */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  className="w-full bg-[#080d17]/60 border border-slate-850 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  className="w-full bg-[#080d17]/60 border border-slate-850 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-[#080d17]/60 border border-slate-850 focus:border-indigo-500/50 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200"
                  placeholder="Create your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-xs font-bold mt-6"
            >
              <span>{loading ? 'Creating account...' : 'Sign Up'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>

          {/* Social Logins */}
          <div className="space-y-4 mt-6">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-850"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-medium uppercase tracking-wider">or continue with</span>
              <div className="flex-grow border-t border-slate-850"></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-850 hover:border-slate-800 bg-[#080d17]/40 rounded-xl text-[10px] font-semibold text-slate-300 hover:bg-slate-900/60 transition-all duration-150">
                <img src="https://api.iconify.design/logos:google-icon.svg" className="w-3.5 h-3.5" alt="google" />
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-850 hover:border-slate-800 bg-[#080d17]/40 rounded-xl text-[10px] font-semibold text-slate-300 hover:bg-slate-900/60 transition-all duration-150">
                <img src="https://api.iconify.design/logos:github-icon.svg" className="w-3.5 h-3.5 invert" alt="github" />
                <span>GitHub</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-850 hover:border-slate-800 bg-[#080d17]/40 rounded-xl text-[10px] font-semibold text-slate-300 hover:bg-slate-900/60 transition-all duration-150">
                <img src="https://api.iconify.design/logos:microsoft-icon.svg" className="w-3.5 h-3.5" alt="microsoft" />
                <span>Microsoft</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium mt-6">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Your data is secure and encrypted</span>
          </div>

        </div>

      </div>

      {/* Footer bar */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-medium border-t border-slate-900/40 pt-4 mt-6 z-10">
        <span>&copy; 2026 ProjectForge AI. All rights reserved.</span>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
        </div>
      </footer>

    </div>
  )
}
