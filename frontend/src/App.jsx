import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Feed from './pages/Feed'
import Profile from './pages/Profile'

/* ── Route guards ─────────────────────────────────────────────── */

function RequireAuth({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg style={{ animation:'spin 0.8s linear infinite' }} width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#334155" strokeWidth="3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RedirectIfAuth({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return null
  if (user) return <Navigate to="/feed" replace />
  return children
}

/* ── Layout ───────────────────────────────────────────────────── */

function Layout({ children }) {
  return (
    <div style={{ minHeight:'100vh' }}>
      <Navbar />
      {children}
    </div>
  )
}

/* ── App ──────────────────────────────────────────────────────── */

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"  element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
      <Route path="/signup" element={<RedirectIfAuth><Signup /></RedirectIfAuth>} />

      <Route path="/feed" element={
        <RequireAuth><Layout><Feed /></Layout></RequireAuth>
      } />
      <Route path="/profile/:userId" element={
        <RequireAuth><Layout><Profile /></Layout></RequireAuth>
      } />

      <Route path="/"   element={<Navigate to="/feed" replace />} />
      <Route path="*"   element={<Navigate to="/feed" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
