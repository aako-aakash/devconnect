import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/helpers'

export default function Signup() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => { setForm(f=>({...f,[k]:e.target.value})); setError('') }

  const submit = async e => {
    e.preventDefault()
    if(!form.name.trim()||!form.email||!form.password){setError('Please fill in all fields');return}
    if(form.password.length<6){setError('Password must be at least 6 characters');return}
    setLoading(true); setError('')
    try{
      const{data}=await authAPI.signup(form)
      login(data.access_token,data.user); nav('/feed',{replace:true})
    }catch(err){setError(err?.response?.data?.detail||'Signup failed. Please try again.')}
    finally{setLoading(false)}
  }

  const strength=[form.password.length>=6,/[A-Z]/.test(form.password),/\d/.test(form.password)].filter(Boolean).length
  const sColor=['','#ef4444','#f59e0b','#34d399'][strength]
  const sLabel=['','Weak','Fair','Strong'][strength]

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px 16px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'fixed',top:'8%',left:'3%',width:420,height:420,borderRadius:'50%',background:'rgba(99,102,241,0.06)',filter:'blur(90px)',pointerEvents:'none'}}/>
      <div style={{position:'fixed',bottom:'8%',right:'3%',width:320,height:320,borderRadius:'50%',background:'rgba(139,92,246,0.06)',filter:'blur(70px)',pointerEvents:'none'}}/>

      <div style={{width:'100%',maxWidth:440,position:'relative',zIndex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:28,justifyContent:'center'}}>
          <div style={{width:42,height:42,borderRadius:13,background:'linear-gradient(135deg,#6366f1,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 20px rgba(99,102,241,0.48)'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </div>
          <span className="text-grad" style={{fontWeight:800,fontSize:22,letterSpacing:'-0.4px'}}>DevConnect</span>
        </div>

        <div className="card" style={{padding:'34px 30px'}}>
          <h2 style={{fontWeight:800,fontSize:24,color:'var(--t1)',marginBottom:4,letterSpacing:'-0.4px',textAlign:'center'}}>Create your account</h2>
          <p style={{color:'var(--t3)',fontSize:13,marginBottom:26,textAlign:'center'}}>Free forever. No credit card required.</p>

          {error&&(
            <div style={{background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.2)',borderRadius:12,padding:'11px 15px',color:'#fca5a5',fontSize:13,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:15}}>
            <div>
              <label className="form-label">Full name</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Jane Developer" className="input" required autoComplete="name"/>
            </div>
            <div>
              <label className="form-label">Email address</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="jane@college.edu" className="input" required autoComplete="email"/>
            </div>
            <div>
              <label className="form-label">Password</label>
              <div style={{position:'relative'}}>
                <input type={showPw?'text':'password'} value={form.password} onChange={set('password')} placeholder="Min. 6 characters" className="input" style={{paddingRight:44}} required autoComplete="new-password"/>
                <button type="button" onClick={()=>setShowPw(v=>!v)} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--t3)',display:'flex',alignItems:'center'}}>
                  {showPw
                    ?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    :<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {form.password&&(
                <div style={{marginTop:10}}>
                  <div style={{display:'flex',gap:5,marginBottom:5}}>
                    {[1,2,3].map(i=>(
                      <div key={i} style={{height:3,flex:1,borderRadius:3,background:i<=strength?sColor:'rgba(99,102,241,0.1)',transition:'background 0.3s',boxShadow:i<=strength?`0 0 6px ${sColor}50`:undefined}}/>
                    ))}
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:11,color:sColor||'var(--t3)',fontWeight:600}}>{sLabel}</span>
                    <div style={{display:'flex',gap:10}}>
                      {[['6+ chars',form.password.length>=6],['Uppercase',/[A-Z]/.test(form.password)],['Number',/\d/.test(form.password)]].map(([lbl,ok])=>(
                        <span key={lbl} style={{fontSize:10,color:ok?'var(--green)':'var(--t3)',fontWeight:500}}>{ok?'✓':'○'} {lbl}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{height:46,fontSize:15,marginTop:4}} disabled={loading}>
              {loading?<><Spinner size={18} color="#fff"/> Creating account…</>:'Create account →'}
            </button>
          </form>
          <p style={{textAlign:'center',color:'var(--t3)',fontSize:13,marginTop:22}}>
            Already have an account?{' '}<Link to="/login" style={{color:'var(--accent2)',fontWeight:600,textDecoration:'none'}}>Sign in</Link>
          </p>
        </div>

        <div style={{display:'flex',justifyContent:'center',gap:8,flexWrap:'wrap',marginTop:18}}>
          {['🔒 Secure auth','⚡ Real-time feed','🔔 Notifications','🔍 Search'].map(f=>(
            <span key={f} style={{fontSize:11,color:'var(--t3)',background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.1)',borderRadius:20,padding:'4px 10px'}}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
