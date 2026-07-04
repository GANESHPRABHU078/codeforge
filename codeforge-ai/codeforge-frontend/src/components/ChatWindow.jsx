import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { projectApi } from '../api/projectApi'
import toast from 'react-hot-toast'

export default function ChatWindow({ projectId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    projectApi.chatHistory(projectId)
      .then(({ data }) => setMessages(data))
      .catch(() => {})
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || sending) return

    const userMsg = { role: 'user', text: input, timestamp: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const { data } = await projectApi.chat(projectId, userMsg.text)
      setMessages((prev) => [...prev, data])
    } catch (err) {
      toast.error('AI chat failed to respond. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="glass-panel flex flex-col h-full bg-slate-900/10 overflow-hidden border-slate-850">
      
      {/* Top status bar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-850 bg-slate-950/40 text-xs text-slate-400 flex-shrink-0">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-semibold">ProjectForge Assistant Live</span>
      </div>

      {/* Message body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 py-20">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="text-xs font-bold text-slate-400">No chat history yet</div>
            <p className="text-[10px] text-slate-600 max-w-xs">Ask specific questions about the generated file structures, security models, or API endpoints.</p>
          </div>
        )}
        
        {messages.map((m, idx) => {
          const isUser = m.role === 'user'
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className="flex gap-3 max-w-[85%]">
                
                {/* Assistant avatar */}
                {!isUser && (
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    AI
                  </div>
                )}

                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-950/70 text-slate-300 border border-slate-850/80 rounded-tl-none'
                }`}>
                  <ReactMarkdown className="markdown-body prose prose-invert max-w-none">{m.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          )
        })}

        {sending && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                AI
              </div>
              <div className="bg-slate-950/70 text-slate-500 border border-slate-850/80 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce delay-75"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce delay-150"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Form bar */}
      <form onSubmit={handleSend} className="flex gap-3 px-6 py-4 border-t border-slate-850 bg-slate-950/20 flex-shrink-0">
        <input
          className="flex-1 bg-[#080d17]/60 border border-slate-850 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none placeholder:text-slate-600 transition"
          placeholder="Ask a question about this project's code..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={sending} className="btn-primary py-3 px-5 text-xs font-bold shrink-0">
          Send
        </button>
      </form>

    </div>
  )
}
