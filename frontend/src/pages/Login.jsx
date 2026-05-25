import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/helpers'

export default function Login() {
  const { login }             = useAuth()
  const nav                   = useNavigate()
  const [form, setForm]       = useState({ email:'', password:'' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setError('') }

  const submit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Fill in all fields'); return }
    setLoading(true); setError('')
    try {
      const { data } = await authAPI.login(form)
      login(data.access_token, data.user)
      nav('/feed', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed. Check credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex' }}>
      {/* Left panel */}
      <div style={{ flex:1, background:'#1e293b', padding:48, display:'flex', flexDirection:'column', justifyContent:'center' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:48 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(99,102,241,0.4)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <span style={{ fontWeight:800, fontSize:24, color:'#e2e8f0', letterSpacing:'-0.5px' }}>DevConnect</span>
        </div>

        <h1 style={{ fontWeight:800, fontSize:36, color:'#f1f5f9', lineHeight:1.2, marginBottom:16, letterSpacing:'-0.5px' }}>
          Where student<br/>developers connect.
        </h1>
        <p style={{ color:'#94a3b8', fontSize:16, lineHeight:1.6, marginBottom:32 }}>
          Share projects, exchange ideas, and get feedback from a community that codes.
        </p>

        {['Share posts & projects', 'Like and comment on others work', 'Get notified on interactions', 'Search the whole community'].map(item => (
          <div key={item} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#6366f1', flexShrink:0 }} />
            <span style={{ color:'#cbd5e1', fontSize:14 }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Right panel - form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:48 }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          <h2 style={{ fontWeight:700, fontSize:26, color:'#f1f5f9', marginBottom:6, letterSpacing:'-0.3px' }}>Welcome back</h2>
          <p style={{ color:'#64748b', fontSize:14, marginBottom:28 }}>Sign in to your developer account</p>

          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'10px 14px', color:'#fca5a5', fontSize:13, marginBottom:16 }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Email</label>
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="you@example.com" className="input" required />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={set('password')} placeholder="••••••••"
                  className="input" style={{ paddingRight:42 }} required />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#475569' }}>
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop:4, height:44, fontSize:15 }} disabled={loading}>
              {loading ? <Spinner size={18} color="#fff" /> : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign:'center', color:'#64748b', fontSize:14, marginTop:20 }}>
            No account?{' '}
            <Link to="/signup" style={{ color:'#818cf8', fontWeight:600, textDecoration:'none' }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
