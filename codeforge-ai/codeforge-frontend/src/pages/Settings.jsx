import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const PROVIDERS = [
  { id: 'GEMINI', name: 'Google Gemini Pro', desc: 'Best for complex multi-file codebases', badge: 'Recommended' },
  { id: 'GROQ',   name: 'Groq (Llama 3)',   desc: 'Fastest inference speed', badge: 'Fast' },
]

export default function Settings() {
  const navigate = useNavigate()
  const [provider, setProvider]       = useState(localStorage.getItem('llm_provider') || 'GEMINI')
  const [theme, setTheme]             = useState('dark')
  const [notifications, setNotifications] = useState({ email: true, browser: true, complete: true })
  const [activeSection, setActiveSection] = useState('general')

  const SECTIONS = [
    { id: 'general',       label: 'General',        icon: '⚙️' },
    { id: 'ai',            label: 'AI & Models',    icon: '🤖' },
    { id: 'notifications', label: 'Notifications',  icon: '🔔' },
    { id: 'appearance',    label: 'Appearance',     icon: '🎨' },
  ]

  const saveSettings = () => {
    localStorage.setItem('llm_provider', provider)
    toast.success('Settings saved!')
  }

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
          <h1 className="text-xl font-extrabold text-white">Settings</h1>
          <p className="text-xs text-slate-600 mt-0.5">Configure your CodeForge AI experience</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Sidebar nav */}
        <div className="glass-panel p-3 space-y-1 h-fit">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left ${
                activeSection === s.id
                  ? 'nav-active text-indigo-300'
                  : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
              }`}
            >
              <span className="text-sm">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-4">

          {/* General */}
          {activeSection === 'general' && (
            <div className="glass-panel p-6 space-y-5 animate-fade-in">
              <h2 className="text-sm font-bold text-white border-b pb-2" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                General Settings
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Default Tech Stack</label>
                  <p className="text-[10px] text-slate-600">Pre-selected technologies when starting a new project.</p>
                  <div className="flex flex-wrap gap-2">
                    {['Java', 'Spring Boot', 'React', 'MongoDB', 'JWT', 'Docker'].map(t => (
                      <span key={t} className="chip chip-active text-xs">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Language</label>
                  <select className="glass-input text-xs" defaultValue="en">
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* AI */}
          {activeSection === 'ai' && (
            <div className="glass-panel p-6 space-y-5 animate-fade-in">
              <h2 className="text-sm font-bold text-white border-b pb-2" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                AI Model Selection
              </h2>
              <p className="text-xs text-slate-500">Choose which LLM powers your code generation. This setting overrides the backend default.</p>
              <div className="space-y-3">
                {PROVIDERS.map(p => (
                  <label key={p.id}
                    className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      provider === p.id
                        ? 'border-indigo-500/40 bg-indigo-500/8'
                        : 'border-slate-800/60 hover:border-slate-700'
                    }`}
                    style={{ border: `1px solid ${provider === p.id ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.1)'}` }}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value={p.id}
                      checked={provider === p.id}
                      onChange={() => setProvider(p.id)}
                      className="mt-0.5 accent-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{p.name}</span>
                        <span className="badge badge-indigo">{p.badge}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">{p.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="p-4 rounded-xl space-y-1" style={{ background: 'rgba(20,25,50,0.5)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <div className="text-xs font-bold text-slate-400">💡 Note</div>
                <div className="text-[10px] text-slate-600 leading-relaxed">
                  The active LLM is ultimately controlled by the <code className="text-indigo-400 bg-indigo-500/10 px-1 rounded">LLM_PROVIDER</code> environment variable set on your Render backend. This client-side preference is for reference only.
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="glass-panel p-6 space-y-5 animate-fade-in">
              <h2 className="text-sm font-bold text-white border-b pb-2" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                Notification Preferences
              </h2>
              <div className="space-y-3">
                {[
                  { key: 'complete', label: 'Generation Complete', desc: 'Notify when project generation finishes' },
                  { key: 'email',    label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'browser',  label: 'Browser Notifications', desc: 'Show desktop push notifications' },
                ].map(n => (
                  <div key={n.key} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(20,25,50,0.4)', border: '1px solid rgba(99,102,241,0.08)' }}>
                    <div>
                      <div className="text-xs font-semibold text-slate-300">{n.label}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">{n.desc}</div>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                      className={`relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${
                        notifications[n.key] ? 'bg-indigo-500' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                        notifications[n.key] ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <div className="glass-panel p-6 space-y-5 animate-fade-in">
              <h2 className="text-sm font-bold text-white border-b pb-2" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                Appearance
              </h2>
              <div className="space-y-3">
                {['dark', 'darker', 'midnight'].map(t => (
                  <label key={t}
                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200`}
                    style={{ border: `1px solid ${theme === t ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.1)'}`, background: theme === t ? 'rgba(99,102,241,0.08)' : 'rgba(20,25,50,0.4)' }}>
                    <input type="radio" name="theme" value={t} checked={theme === t} onChange={() => setTheme(t)} className="accent-indigo-500" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200 capitalize">{t}</div>
                      <div className="text-[10px] text-slate-600">
                        {t === 'dark' ? '#050810 base' : t === 'darker' ? '#020409 base — deeper blacks' : '#000000 base — pure midnight'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end gap-3">
            <button onClick={() => navigate(-1)} className="btn-secondary text-xs px-5 py-2">Cancel</button>
            <button onClick={saveSettings} className="btn-primary text-xs px-6 py-2 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
