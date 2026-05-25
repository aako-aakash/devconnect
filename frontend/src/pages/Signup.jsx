import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/helpers'

export default function Signup() {
  const { login }             = useAuth()
  const nav                   = useNavigate()
  const [form, setForm]       = useState({ name:'', email:'', password:'' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = k => e => { setForm(f => ({ ...f, [k]: e.target.value })); setError('') }

  const submit = async e => {
    e.preventDefault()
    if (!form.name.trim() || !form.email || !form.password) { setError('Fill in all fields'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      const { data } = await authAPI.signup(form)
      login(data.access_token, data.user)
      nav('/feed', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Signup failed. Try again.')
    } finally { setLoading(false) }
  }

  const strength = [form.password.length>=6, /[A-Z]/.test(form.password), /\d/.test(form.password)].filter(Boolean).length

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32, justifyContent:'center' }}>
          <div style={{ width:40, height:40, borderRadius:11, background:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 16px rgba(99,102,241,0.4)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <span style={{ fontWeight:800, fontSize:22, color:'#e2e8f0', letterSpacing:'-0.4px' }}>DevConnect</span>
        </div>

        <div className="card" style={{ padding:32 }}>
          <h2 style={{ fontWeight:700, fontSize:22, color:'#f1f5f9', marginBottom:4, letterSpacing:'-0.3px' }}>Create your account</h2>
          <p style={{ color:'#64748b', fontSize:13, marginBottom:24 }}>Free forever. No credit card required.</p>

          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'10px 14px', color:'#fca5a5', fontSize:13, marginBottom:16 }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Full name</label>
              <input type="text" value={form.name} onChange={set('name')}
                placeholder="Jane Developer" className="input" required />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Email</label>
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="jane@college.edu" className="input" required />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={set('password')} placeholder="Min 6 characters"
                  className="input" style={{ paddingRight:42 }} required />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#475569' }}>
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop:8 }}>
                  <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ height:3, flex:1, borderRadius:2, background: i <= strength ? ['#ef4444','#f59e0b','#10b981'][strength-1] : '#334155', transition:'background 0.2s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize:11, color:['#ef4444','#f59e0b','#10b981'][strength-1] || '#475569' }}>
                    {['','Weak','Fair','Strong'][strength]}
                  </span>
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop:4, height:44, fontSize:15 }} disabled={loading}>
              {loading ? <Spinner size={18} color="#fff" /> : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign:'center', color:'#64748b', fontSize:14, marginTop:20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#818cf8', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
