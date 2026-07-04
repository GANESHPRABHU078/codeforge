import { useState } from 'react'

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I am your ProjectForge AI Architect. How can I help you design, refactor, or plan your next software project today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    
    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Simulate co-pilot reasoning & reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I can help you build complete solutions. Try using the 'New Project' tab to generate a custom system plan, or let me know what tech stack you would like to analyze!"
      }])
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-fade-in flex flex-col h-[calc(100vh-150px)]">
      <div className="space-y-2 flex-shrink-0">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          AI Architecture Assistant
        </h1>
        <p className="text-slate-400 text-sm">Ask design questions, consult project blueprints, or generate micro-scripts.</p>
      </div>

      <div className="flex-1 glass-panel p-6 flex flex-col overflow-hidden bg-slate-900/20">
        {/* Messages Log */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-950/70 text-slate-300 border border-slate-850/80 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-950/70 text-slate-500 border border-slate-850/80 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce delay-75"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce delay-150"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="flex gap-3 flex-shrink-0 border-t border-slate-850 pt-4">
          <input
            className="flex-1 bg-slate-950/60 border border-slate-850 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none placeholder:text-slate-600 transition"
            placeholder="Type your coding request (e.g., How do I structure a Spring Boot model index?)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-primary py-3 px-6 text-xs font-bold">
            Send Prompt
          </button>
        </form>
      </div>
    </div>
  )
}
