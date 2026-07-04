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
    projectApi.chatHistory(projectId).then(({ data }) => setMessages(data)).catch(() => {})
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input, timestamp: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)
    try {
      const { data } = await projectApi.chat(projectId, userMsg.text)
      setMessages((prev) => [...prev, data])
    } catch (err) {
      toast.error('Chat failed. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="card flex flex-col h-[70vh]">
      <h3 className="font-semibold mb-2">Chat with your code</h3>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.map((m, idx) => (
          <div key={idx} className={`text-sm ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-3 py-2 rounded-lg max-w-[85%] ${
              m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'
            }`}>
              <ReactMarkdown>{m.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-3">
        <input
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Ask about this project's code..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={sending} className="btn-primary">
          {sending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
