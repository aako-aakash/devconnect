import { createContext, useContext, useState, useEffect } from 'react'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [ready, setReady]     = useState(false)   // replaces "loading"

  useEffect(() => {
    try {
      const t = localStorage.getItem('dc_token')
      const u = localStorage.getItem('dc_user')
      if (t && u) setUser(JSON.parse(u))
    } catch {
      localStorage.clear()
    } finally {
      setReady(true)
    }
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('dc_token', token)
    localStorage.setItem('dc_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('dc_token')
    localStorage.removeItem('dc_user')
    setUser(null)
  }

  const patchUser = (data) => {
    const next = { ...user, ...data }
    localStorage.setItem('dc_user', JSON.stringify(next))
    setUser(next)
  }

  return (
    <Ctx.Provider value={{ user, ready, login, logout, patchUser }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
