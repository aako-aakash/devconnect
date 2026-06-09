import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/helpers'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => { setForm(f => ({...f,[k]:e.target.value})); setError('') }

  const submit = async e => {
    e.preventDefault()
    if (!form.email||!form.password){setError('Please fill in all fields');return}
    setLoading(true); setError('')
    try {
      const{data}=await authAPI.login(form)
      login(data.access_token,data.user); nav('/feed',{replace:true})
    } catch(err){setError(err?.response?.data?.detail||'Invalid email or password')}
    finally{setLoading(false)}
  }

  return (
    <div className="login-wrap">
      {/* Left panel */}
      <div className="login-left">
        <div style={{position:'absolute',top:'12%',left:'18%',width:320,height:320,borderRadius:'50%',background:'rgba(99,102,241,0.07)',filter:'blur(70px)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:'18%',right:'8%',width:220,height:220,borderRadius:'50%',background:'rgba(139,92,246,0.07)',filter:'blur(55px)',pointerEvents:'none'}}/>
        <div style={{position:'relative',maxWidth:420}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:52}}>
            <div style={{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#6366f1,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 24px rgba(99,102,241,0.5)'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
            <span className="text-grad" style={{fontWeight:800,fontSize:26,letterSpacing:'-0.5px'}}>DevConnect</span>
          </div>
          <h1 style={{fontWeight:800,fontSize:38,color:'#f8fafc',lineHeight:1.15,marginBottom:16,letterSpacing:'-1px'}}>Where student<br/>devs connect.</h1>
          <p style={{color:'#64748b',fontSize:16,lineHeight:1.65,marginBottom:36}}>Share projects, get feedback, and grow alongside a community that codes.</p>
          {['JWT authentication & bcrypt security','Infinite-scroll global feed','Real-time notifications','Full-text search across posts & people'].map((item,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{width:28,height:28,borderRadius:8,background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span style={{color:'#94a3b8',fontSize:14}}>{item}</span>
            </div>
          ))}
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:32}}>
            {['FastAPI','React','PostgreSQL','Docker'].map(t=>(
              <span key={t} style={{background:'rgba(99,102,241,0.07)',border:'1px solid rgba(99,102,241,0.14)',borderRadius:20,padding:'4px 12px',fontSize:12,fontWeight:600,color:'#6366f1'}}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="login-right">
        <div style={{width:'100%',maxWidth:400}}>
          {/* Mobile logo */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:32,justifyContent:'center'}} className="login-left" >
            <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#6366f1,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 16px rgba(99,102,241,0.45)'}}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
            <span className="text-grad" style={{fontWeight:800,fontSize:20,letterSpacing:'-0.4px'}}>DevConnect</span>
          </div>

          <h2 style={{fontWeight:800,fontSize:28,color:'var(--t1)',marginBottom:4,letterSpacing:'-0.5px'}}>Welcome back</h2>
          <p style={{color:'var(--t3)',fontSize:14,marginBottom:30}}>Sign in to your developer account</p>

          {error&&(
            <div style={{background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.2)',borderRadius:12,padding:'11px 15px',color:'#fca5a5',fontSize:13,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <label className="form-label">Email address</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className="input" required autoComplete="email"/>
            </div>
            <div>
              <label className="form-label">Password</label>
              <div style={{position:'relative'}}>
                <input type={showPw?'text':'password'} value={form.password} onChange={set('password')} placeholder="••••••••" className="input" style={{paddingRight:44}} required autoComplete="current-password"/>
                <button type="button" onClick={()=>setShowPw(v=>!v)} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--t3)',display:'flex',alignItems:'center'}}>
                  {showPw
                    ?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    :<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{height:46,fontSize:15,marginTop:4}} disabled={loading}>
              {loading?<><Spinner size={18} color="#fff"/> Signing in…</>:'Sign in →'}
            </button>
          </form>
          <p style={{textAlign:'center',color:'var(--t3)',fontSize:14,marginTop:24}}>
            No account?{' '}<Link to="/signup" style={{color:'var(--accent2)',fontWeight:600,textDecoration:'none'}}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
