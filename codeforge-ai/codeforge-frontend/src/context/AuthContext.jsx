import { createContext, useState, useEffect } from 'react'
import { authApi } from '../api/authApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const email = localStorage.getItem('email')
    const fullName = localStorage.getItem('fullName')
    if (email) setUser({ email, fullName })
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials)
    persistSession(data)
    return data
  }

  const register = async (payload) => {
    const { data } = await authApi.register(payload)
    persistSession(data)
    return data
  }

  const persistSession = (data) => {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('email', data.email)
    localStorage.setItem('fullName', data.fullName)
    setUser({ email: data.email, fullName: data.fullName })
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
