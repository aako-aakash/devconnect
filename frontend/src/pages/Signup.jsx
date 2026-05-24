import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Code2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { authAPI } from '../api'
import { useAuth } from '../context/AuthContext'

const rules = [
  { test: v => v.length >= 6, label: 'At least 6 characters' },
  { test: v => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { test: v => /\d/.test(v), label: 'One number' },
]

export default function Signup() {
  const { login }             = useAuth()
  const navigate              = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email || !form.password) {
      setError('Please fill in all fields'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters'); return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await authAPI.signup(form)
      login(data.access_token, data.user)
      navigate('/feed', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const pwStrength = rules.filter(r => r.test(form.password)).length
  const strengthColors = ['', 'bg-red-500', 'bg-amber-400', 'bg-emerald-400']
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong']

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark-800 items-center justify-center p-12">
        <div className="absolute inset-0"
          style={{ backgroundImage: `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(61,109,247,0.18), transparent)` }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-brand-600 flex items-center justify-center glow">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-extrabold text-gradient">DevConnect</span>
          </div>
          <h2 className="text-4xl font-bold text-slate-100 leading-tight mb-6">
            Join thousands of student devs.
          </h2>
          <div className="card p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">What you'll get</p>
            {[
              'A personal dev profile & feed',
              'Like and comment on projects',
              'Get notified when people engage',
              'Search the whole community',
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md slide-up">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">DevConnect</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-100 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm mb-8">Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm fade-in">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Full name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Developer"
                autoComplete="name"
                className="input-field"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jane@college.edu"
                autoComplete="email"
                className="input-field"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className="input-field pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <div className="space-y-1.5 fade-in">
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength ? strengthColors[pwStrength] : 'bg-dark-500'}`} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{strengthLabels[pwStrength]}</span>
                    <div className="flex gap-3">
                      {rules.map(r => (
                        <span key={r.label}
                          className={`text-[11px] transition-colors ${r.test(form.password) ? 'text-emerald-400' : 'text-slate-600'}`}>
                          ✓ {r.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full h-11 text-base mt-2">
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
                : 'Create account'
              }
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 font-semibold hover:text-brand-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
