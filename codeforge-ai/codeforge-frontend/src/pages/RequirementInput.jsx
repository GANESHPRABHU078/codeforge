import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generationApi } from '../api/generationApi'
import toast from 'react-hot-toast'

const TECH_OPTIONS = ['Java', 'Spring Boot', 'React', 'MongoDB', 'Python', 'Node.js', 'PostgreSQL', 'Docker', 'JWT', 'TailwindCSS']

const EXAMPLE_PROMPTS = [
  {
    title: "Hospital Management",
    desc: "Build a Hospital Management System using Spring Boot, React, MongoDB, JWT, and Docker.",
  },
  {
    title: "E-Commerce System",
    desc: "Create an E-Commerce platform with product search, cart operations, JWT security, and order tracking.",
  },
  {
    title: "Library Portal",
    desc: "Build a Library Management System with book catalog, member loans, fine tracking, and admin dashboard.",
  }
]

export default function RequirementInput() {
  const [requirement, setRequirement] = useState('')
  const [techStack, setTechStack] = useState(['Java', 'Spring Boot', 'React', 'MongoDB', 'JWT', 'Docker'])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const toggleTech = (tech) => {
    setTechStack((prev) => prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech])
  }

  const handleGenerate = async () => {
    if (!requirement.trim()) return toast.error('Please describe your requirement first')
    setLoading(true)
    try {
      const { data } = await generationApi.generateCode({ requirement, techStack })
      toast.success('Project architecture and code generated!')
      navigate(`/projects/${data.projectId}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Define Your Project Blueprint
        </h1>
        <p className="text-slate-400 text-sm">Enter your custom functional specifications and select your target technologies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Requirement & Stack */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <label className="block text-sm font-bold text-slate-300">Functional Requirements</label>
            <textarea
              className="w-full h-48 p-4 bg-slate-950/60 border border-slate-800 focus:border-teal-500/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50 resize-none transition-all duration-200"
              placeholder="Describe your project requirement here (e.g. Build a Hospital Management System with Doctor schedules, Patients record, Appointment booking...)"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-300">Target Tech Stack & Integrations</label>
              <div className="flex flex-wrap gap-2">
                {TECH_OPTIONS.map((tech) => {
                  const isSelected = techStack.includes(tech)
                  return (
                    <button
                      key={tech}
                      onClick={() => toggleTech(tech)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                        isSelected
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-sm shadow-teal-500/10'
                          : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {tech}
                    </button>
                  )
                })}
              </div>
            </div>

            <button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Orchestrating AI Agents (takes ~15-30s)...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span>Build Solution Blueprint</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Sidebar: Sample Prompts */}
        <div className="space-y-5">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 pb-2 border-b border-slate-800">
              Need inspiration?
            </h3>
            <p className="text-xs text-slate-400">Click a template below to pre-populate requirements instantly.</p>
            <div className="space-y-3">
              {EXAMPLE_PROMPTS.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setRequirement(ex.desc)}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-950/40 border border-slate-850 hover:border-teal-500/20 hover:bg-slate-900/40 transition-all duration-200 space-y-1 group"
                >
                  <div className="text-xs font-semibold text-slate-300 group-hover:text-teal-400 transition-colors duration-200">
                    {ex.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2">
                    {ex.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
