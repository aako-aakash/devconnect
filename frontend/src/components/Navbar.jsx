import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { postsAPI, usersAPI } from '../api'
import { Avatar } from './helpers'

export default function Navbar() {
  const { user, logout }           = useAuth()
  const nav                        = useNavigate()
  const loc                        = useLocation()
  const [q, setQ]                  = useState('')
  const [results, setResults]      = useState(null)
  const [showUser, setShowUser]    = useState(false)
  const [showNotif, setShowNotif]  = useState(false)
  const [notifs, setNotifs]        = useState([])
  const [unread, setUnread]        = useState(0)
  const [mobileOpen, setMobileOpen]= useState(false)
  const searchRef = useRef(null)
  const userRef   = useRef(null)
  const notifRef  = useRef(null)
  const timer     = useRef(null)

  useEffect(() => {
    if (!user) return
    usersAPI.notifications().then(r => {
      setNotifs(r.data)
      setUnread(r.data.filter(n => !n.is_read).length)
    }).catch(() => {})
  }, [user])

  useEffect(() => {
    clearTimeout(timer.current)
    if (!q.trim()) { setResults(null); return }
    timer.current = setTimeout(async () => {
      const [p, u] = await Promise.allSettled([postsAPI.search(q), usersAPI.search(q)])
      setResults({
        posts: p.status === 'fulfilled' ? p.value.data.slice(0,3) : [],
        users: u.status === 'fulfilled' ? u.value.data.slice(0,4) : [],
      })
    }, 350)
  }, [q])

  useEffect(() => {
    const h = e => {
      if (!searchRef.current?.contains(e.target)) { setResults(null); setQ('') }
      if (!userRef.current?.contains(e.target))   setShowUser(false)
      if (!notifRef.current?.contains(e.target))  setShowNotif(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const openNotif = () => {
    setShowNotif(v => !v)
    if (!showNotif && unread) usersAPI.markRead().then(() => setUnread(0)).catch(() => {})
  }

  const isActive = p => loc.pathname === p

  // Clicking Feed or logo when already on /feed → scroll to top + reload
  const handleFeedClick = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (loc.pathname === '/feed') {
      window.location.reload()
    } else {
      nav('/feed')
    }
    setMobileOpen(false)
  }

  const dropSx = {
    position:'absolute', top:'calc(100% + 10px)', right:0,
    background:'rgba(8,12,20,0.97)',
    border:'1px solid rgba(99,102,241,0.18)',
    borderRadius:14, boxShadow:'0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)',
    zIndex:100, overflow:'hidden',
    backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
  }

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <a href="/feed" onClick={handleFeedClick} style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none', flexShrink:0, cursor:'pointer' }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 14px rgba(99,102,241,0.45)' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <span style={{ fontWeight:800, fontSize:17, letterSpacing:'-0.4px', display:'none' }} className="text-grad" id="nav-logo-text">DevConnect</span>
        </a>

        {/* Search */}
        <div ref={searchRef} style={{ position:'relative', flex:1, maxWidth:360 }}>
          <div style={{ position:'relative' }}>
            <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search people & posts…"
              style={{ width:'100%', padding:'9px 14px 9px 36px', background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.12)', borderRadius:12, color:'var(--text1)', fontFamily:'inherit', fontSize:13, outline:'none', transition:'all .2s' }}
              onFocus={e => { e.target.style.borderColor='rgba(99,102,241,0.35)'; e.target.style.background='rgba(99,102,241,0.09)' }}
              onBlur={e => { e.target.style.borderColor='rgba(99,102,241,0.12)'; e.target.style.background='rgba(99,102,241,0.06)' }}
            />
          </div>

          {results && (
            <div style={{ ...dropSx, width:'100%', top:'calc(100% + 8px)', right:'auto', left:0, maxHeight:360, overflowY:'auto' }}>
              {results.users.length === 0 && results.posts.length === 0
                ? <div style={{ padding:'14px 16px', color:'var(--text3)', fontSize:13 }}>No results for "{q}"</div>
                : <>
                  {results.users.length > 0 && <>
                    <div style={{ padding:'8px 14px', fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.07em', borderBottom:'1px solid rgba(99,102,241,0.08)' }}>People</div>
                    {results.users.map(u => (
                      <button key={u.id} onClick={() => { nav(`/profile/${u.id}`); setQ(''); setResults(null) }}
                        style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', transition:'background .15s' }}
                        onMouseOver={e=>e.currentTarget.style.background='rgba(99,102,241,0.08)'}
                        onMouseOut={e=>e.currentTarget.style.background='none'}>
                        <Avatar user={u} size={32}/>
                        <div><div style={{ fontSize:13, fontWeight:600, color:'var(--text1)' }}>{u.name}</div><div style={{ fontSize:11, color:'var(--text3)' }}>{u.post_count} posts</div></div>
                      </button>
                    ))}
                  </>}
                  {results.posts.length > 0 && <>
                    <div style={{ padding:'8px 14px', fontSize:11, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.07em', borderBottom:'1px solid rgba(99,102,241,0.08)', borderTop:results.users.length?'1px solid rgba(99,102,241,0.08)':undefined }}>Posts</div>
                    {results.posts.map(p => (
                      <button key={p.id} onClick={() => { nav('/feed'); setQ(''); setResults(null) }}
                        style={{ display:'flex', alignItems:'flex-start', gap:10, width:'100%', padding:'10px 14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', transition:'background .15s' }}
                        onMouseOver={e=>e.currentTarget.style.background='rgba(99,102,241,0.08)'}
                        onMouseOut={e=>e.currentTarget.style.background='none'}>
                        <Avatar user={p.author} size={28}/>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:11, color:'var(--text3)' }}>{p.author.name}</div>
                          <div style={{ fontSize:13, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:240 }}>{p.content}</div>
                        </div>
                      </button>
                    ))}
                  </>}
                </>
              }
            </div>
          )}
        </div>

        {/* Desktop right */}
        <div style={{ display:'flex', alignItems:'center', gap:4, marginLeft:'auto' }} id="nav-desktop">
          {/* Feed link */}
          <a href="/feed" onClick={handleFeedClick}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 13px', borderRadius:10, textDecoration:'none', fontSize:13, fontWeight:500, transition:'all .15s', cursor:'pointer', color: isActive('/feed') ? 'var(--accent2)' : 'var(--t2)', background: isActive('/feed') ? 'rgba(99,102,241,0.1)' : 'transparent' }}
            onMouseOver={e => { if(!isActive('/feed')) { e.currentTarget.style.color='var(--t1)'; e.currentTarget.style.background='rgba(99,102,241,0.07)' }}}
            onMouseOut={e => { if(!isActive('/feed')) { e.currentTarget.style.color='var(--t2)'; e.currentTarget.style.background='transparent' }}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Feed
          </a>

          {/* Notifications */}
          <div ref={notifRef} style={{ position:'relative' }}>
            <button onClick={openNotif} style={{ background:'none', border:'none', cursor:'pointer', padding:9, borderRadius:10, color:'var(--text2)', position:'relative', display:'flex', alignItems:'center', transition:'all .15s' }}
              onMouseOver={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.07)'; e.currentTarget.style.color='var(--text1)' }}
              onMouseOut={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text2)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {unread > 0 && <span className="dot-unread" style={{ width:8, height:8 }}/>}
            </button>
            {showNotif && (
              <div style={{ ...dropSx, width:310 }}>
                <div style={{ padding:'13px 16px', borderBottom:'1px solid rgba(99,102,241,0.1)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontWeight:700, fontSize:14, color:'var(--text1)' }}>Notifications</span>
                  {unread > 0 && <span className="badge" style={{ fontSize:11 }}>{unread} new</span>}
                </div>
                <div style={{ maxHeight:300, overflowY:'auto' }}>
                  {notifs.length === 0
                    ? <div style={{ padding:'24px 16px', textAlign:'center', color:'var(--text3)', fontSize:13 }}>No notifications yet</div>
                    : notifs.map(n => (
                      <div key={n.id} style={{ padding:'11px 16px', borderBottom:'1px solid rgba(99,102,241,0.06)', background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.05)', display:'flex', gap:10, alignItems:'flex-start' }}>
                        {!n.is_read && <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', marginTop:5, flexShrink:0, boxShadow:'0 0 6px rgba(99,102,241,0.6)' }}/>}
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:13, color:'var(--text2)', margin:0, lineHeight:1.5 }}>
                            <span style={{ fontWeight:600, color:'var(--text1)' }}>{n.actor_name}</span> {n.action}
                          </p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div ref={userRef} style={{ position:'relative' }}>
            <button onClick={() => setShowUser(v => !v)} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 10px 5px 5px', background: showUser ? 'rgba(99,102,241,0.1)' : 'transparent', border:'1px solid', borderColor: showUser ? 'rgba(99,102,241,0.25)' : 'transparent', borderRadius:12, cursor:'pointer', transition:'all .15s' }}
              onMouseOver={e=>{ if(!showUser){ e.currentTarget.style.background='rgba(99,102,241,0.07)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.12)' }}}
              onMouseOut={e=>{ if(!showUser){ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent' }}}>
              <Avatar user={user} size={30}/>
              <span style={{ fontSize:13, fontWeight:600, color:'var(--text1)', maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name?.split(' ')[0]}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5" style={{ transition:'transform .2s', transform: showUser ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showUser && (
              <div style={{ ...dropSx, width:190 }}>
                <Link to={`/profile/${user?.id}`} onClick={() => setShowUser(false)}
                  style={{ display:'flex', alignItems:'center', gap:9, padding:'12px 16px', color:'var(--text2)', textDecoration:'none', fontSize:13, transition:'all .15s' }}
                  onMouseOver={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.08)'; e.currentTarget.style.color='var(--text1)' }}
                  onMouseOut={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text2)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                  My Profile
                </Link>
                <div style={{ borderTop:'1px solid rgba(99,102,241,0.1)' }}/>
                <button onClick={() => { logout(); nav('/login') }}
                  style={{ display:'flex', alignItems:'center', gap:9, width:'100%', padding:'12px 16px', color:'var(--red)', background:'none', border:'none', cursor:'pointer', fontSize:13, fontFamily:'inherit', transition:'background .15s' }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(248,113,113,0.08)'}
                  onMouseOut={e=>e.currentTarget.style.background='none'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile burger */}
        <button onClick={() => setMobileOpen(v => !v)} style={{ background:'none', border:'none', cursor:'pointer', padding:8, color:'var(--text2)', marginLeft:'auto', display:'none', alignItems:'center' }} id="nav-burger">
          {mobileOpen
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          }
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background:'rgba(8,12,20,0.98)', borderBottom:'1px solid rgba(99,102,241,0.12)', padding:'12px 16px', backdropFilter:'blur(20px)' }}>
          <a href="/feed" onClick={handleFeedClick}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12, textDecoration:'none', fontSize:14, fontWeight:500, cursor:'pointer', color: isActive('/feed') ? 'var(--accent2)' : 'var(--t2)', background: isActive('/feed') ? 'rgba(99,102,241,0.1)' : 'transparent', marginBottom:4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> Feed
          </a>
          <Link to={`/profile/${user?.id}`} onClick={() => setMobileOpen(false)}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12, textDecoration:'none', fontSize:14, fontWeight:500, color:'var(--text2)', marginBottom:4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg> Profile
          </Link>
          <div style={{ borderTop:'1px solid rgba(99,102,241,0.08)', margin:'8px 0' }}/>
          <button onClick={() => { logout(); nav('/login') }}
            style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 14px', borderRadius:12, background:'none', border:'none', color:'var(--red)', fontSize:14, fontWeight:500, fontFamily:'inherit', cursor:'pointer' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Sign out
          </button>
        </div>
      )}

      {/* Responsive navbar JS */}
      <style>{`
        @media (max-width: 768px) {
          #nav-desktop { display: none !important; }
          #nav-burger   { display: flex !important; }
          #nav-logo-text { display: block !important; }
        }
      `}</style>
    </>
  )
}
