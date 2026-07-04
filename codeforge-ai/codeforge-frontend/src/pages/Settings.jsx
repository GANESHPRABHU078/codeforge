import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user } = useAuth()
  const [provider, setProvider] = useState('GEMINI')
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••')
  const [systemPrompt, setSystemPrompt] = useState('You are an expert full-stack engineer...')

  const handleSave = () => {
    toast.success('Configuration saved successfully!')
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Account & Engine Settings
        </h1>
        <p className="text-slate-400 text-sm">Configure your AI model preferences, custom rules, and profile parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-20 w-20 rounded-full bg-slate-800 border-2 border-indigo-500/30 flex items-center justify-center overflow-hidden">
              {user?.fullName ? (
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.fullName}`} alt="avatar" className="w-full h-full" />
              ) : (
                'U'
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{user?.fullName || 'Ganesh Prabhu'}</h3>
              <p className="text-xs text-slate-500">{user?.email || 'ganesh@example.com'}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Student Developer Plan
            </span>
          </div>
          
          <div className="border-t border-slate-800/80 pt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Token quota</span>
              <span className="text-slate-300">782 / 1000 requests</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
              <div className="h-full bg-gradient-to-r from-teal-500 to-indigo-500" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>

        {/* Configurations Card */}
        <div className="md:col-span-2 glass-panel p-6 space-y-6">
          <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3">AI Engine Configuration</h3>
          
          <div className="space-y-4">
            {/* Model Provider */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">LLM Provider</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setProvider('GEMINI')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    provider === 'GEMINI'
                      ? 'bg-indigo-500/10 border-indigo-500 text-slate-100'
                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold">Google Gemini</div>
                  <div className="text-[10px] text-slate-500 mt-1">Free Tier, 1.5-Pro, fast and highly creative code generation.</div>
                </button>
                <button
                  onClick={() => setProvider('GROQ')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    provider === 'GROQ'
                      ? 'bg-indigo-500/10 border-indigo-500 text-slate-100'
                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold">Groq Cloud (Llama 3)</div>
                  <div className="text-[10px] text-slate-500 mt-1">High-speed inference, optimized coding models.</div>
                </button>
              </div>
            </div>

            {/* Custom API Key override */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Custom API Key (Optional)</label>
              <input
                type="password"
                className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter custom API Key to bypass platform limits"
              />
            </div>

            {/* Custom System Prompt instructions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">System Rule Constraints</label>
              <textarea
                className="w-full h-24 bg-slate-950/60 border border-slate-850 focus:border-indigo-500/50 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
              />
            </div>
            
            <button onClick={handleSave} className="btn-primary px-6 py-2.5 text-xs font-bold float-right mt-2">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
