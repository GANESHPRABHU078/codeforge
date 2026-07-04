import { useState } from 'react'
import { Link } from 'react-router-dom'

const MOCK_FAVORITES = [
  {
    id: "hospital-mgmt",
    title: "Hospital Management System",
    desc: "A Spring Boot + React + MongoDB medical clinic portal supporting doctor timetables, appointment slots, patient logs, and prescriptions.",
    tech: ["Spring Boot", "React", "MongoDB", "Docker"],
    stars: 5
  },
  {
    id: "e-com",
    title: "High-Throughput E-Commerce Platform",
    desc: "An enterprise online retail platform featuring secure JWT checkout, sliding-window stock checks, and microservice container deployment.",
    tech: ["Spring Boot", "React", "MongoDB", "JWT", "Docker"],
    stars: 5
  }
]

export default function Favorites() {
  const [favorites] = useState(MOCK_FAVORITES)

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Starred Project Blueprints
        </h1>
        <p className="text-slate-400 text-sm">Access your bookmarked system designs and high-fidelity code bases.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-500">
          No favorite projects bookmarked yet. Mark projects as favorites from the Workspace views.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((fav) => (
            <div key={fav.id} className="glass-panel p-6 flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-200 group">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors duration-200">
                    {fav.title}
                  </h3>
                  <span className="text-amber-400 text-xs font-bold">★ {fav.stars}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{fav.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-850/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {fav.tech.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-950 text-[9px] font-bold text-slate-500 border border-slate-850">
                      {t}
                    </span>
                  ))}
                </div>
                <Link to={`/history`} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition">
                  Open Workspace →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
