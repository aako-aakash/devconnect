import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('dc_token')
    const stored = localStorage.getItem('dc_user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('dc_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback((token, userData) => {
    localStorage.setItem('dc_token', token)
    localStorage.setItem('dc_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('dc_token')
    localStorage.removeItem('dc_user')
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedData) => {
    const merged = { ...user, ...updatedData }
    localStorage.setItem('dc_user', JSON.stringify(merged))
    setUser(merged)
  }, [user])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.me()
      updateUser(data)
    } catch {
      logout()
    }
  }, [updateUser, logout])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
