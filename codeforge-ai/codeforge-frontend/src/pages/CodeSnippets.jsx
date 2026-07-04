import { useState } from 'react'
import toast from 'react-hot-toast'

const MOCK_SNIPPETS = [
  {
    title: "PatientController.java",
    path: "src/main/java/com/hospital/controller/",
    lang: "java",
    code: `package com.hospital.controller;

import com.hospital.entity.Patient;
import com.hospital.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
public class PatientController {
    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    public ResponseEntity<Patient> create(@RequestBody Patient patient) {
        return ResponseEntity.ok(patientService.save(patient));
    }
}`
  },
  {
    title: "App.jsx",
    path: "src/",
    lang: "javascript",
    code: `import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Sidebar from './components/Sidebar'

export default function App() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}`
  },
  {
    title: "Dockerfile",
    path: "./",
    lang: "dockerfile",
    code: `FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`
  }
]

export default function CodeSnippets() {
  const [snippets] = useState(MOCK_SNIPPETS)
  const [activeSnippet, setActiveSnippet] = useState(MOCK_SNIPPETS[0])
  const [query, setQuery] = useState('')

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code)
    toast.success('Copied to clipboard!')
  }

  const filtered = snippets.filter(s => s.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Code Snippet Explorer
        </h1>
        <p className="text-slate-400 text-sm">Browse, search, and copy specific codebase modules generated across your workspace.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar list */}
        <div className="glass-panel p-4 flex flex-col h-[500px] space-y-4">
          <input
            className="w-full bg-slate-950/60 border border-slate-850 focus:border-indigo-500/50 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none placeholder:text-slate-600 transition"
            placeholder="Search files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin">
            {filtered.map((snip, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSnippet(snip)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                  activeSnippet.title === snip.title
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                    : 'hover:bg-slate-900/40 text-slate-400 border border-transparent'
                }`}
              >
                <div className="font-semibold truncate">{snip.title}</div>
                <div className="text-[10px] text-slate-600 truncate mt-0.5">{snip.path}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Snippet Viewer */}
        <div className="lg:col-span-3 glass-panel p-6 flex flex-col h-[500px] bg-slate-900/30">
          <div className="flex items-center justify-between pb-3 border-b border-slate-850 mb-4">
            <div>
              <h3 className="font-bold text-slate-200 text-sm">{activeSnippet.title}</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{activeSnippet.path}</p>
            </div>
            <button onClick={handleCopy} className="btn-primary py-2 px-4 flex items-center gap-2 text-xs font-bold">
              Copy Snippet
            </button>
          </div>
          
          <pre className="flex-1 overflow-auto bg-slate-950/80 p-4 rounded-xl border border-slate-850 text-xs font-mono text-slate-300 scrollbar-thin leading-relaxed">
            <code>{activeSnippet.code}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
