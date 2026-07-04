import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import RequirementInput from './pages/RequirementInput'
import GenerationResult from './pages/GenerationResult'
import ProjectHistory from './pages/ProjectHistory'
import ProjectDetail from './pages/ProjectDetail'
import ChatWithCode from './pages/ChatWithCode'
import Settings from './pages/Settings'
import CodeSnippets from './pages/CodeSnippets'
import Favorites from './pages/Favorites'
import AiAssistant from './pages/AiAssistant'

export default function App() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="flex min-h-screen bg-[#07090e] text-slate-100 font-sans">
      {!isAuthPage && <Sidebar />}
      
      <div className="flex-1 flex flex-col min-w-0">
        {!isAuthPage && <Header />}
        
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/generate" element={<ProtectedRoute><RequirementInput /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><GenerationResult /></ProtectedRoute>} />
            <Route path="/projects/:id/detail" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="/projects/:id/chat" element={<ProtectedRoute><ChatWithCode /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><ProjectHistory /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/snippets" element={<ProtectedRoute><CodeSnippets /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute><AiAssistant /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
