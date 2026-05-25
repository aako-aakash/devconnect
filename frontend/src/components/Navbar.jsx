import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { postsAPI, usersAPI } from '../api'
import { Avatar } from './helpers'

export default function Navbar() {
  const { user, logout }          = useAuth()
  const nav                       = useNavigate()
  const loc                       = useLocation()
  const [q, setQ]                 = useState('')
  const [results, setResults]     = useState(null)
  const [showUser, setShowUser]   = useState(false)
  const [notifs, setNotifs]       = useState([])
  const [showNotif, setShowNotif] = useState(false)
  const [unread, setUnread]       = useState(0)
  const searchRef                 = useRef(null)
  const userRef                   = useRef(null)
  const notifRef                  = useRef(null)
  const timer                     = useRef(null)

  /* load notifications once */
  useEffect(() => {
    if (!user) return
    usersAPI.notifications().then(r => {
      setNotifs(r.data)
      setUnread(r.data.filter(n => !n.is_read).length)
    }).catch(() => {})
  }, [user])

  /* debounced search */
  useEffect(() => {
    clearTimeout(timer.current)
    if (!q.trim()) { setResults(null); return }
    timer.current = setTimeout(async () => {
      const [p, u] = await Promise.allSettled([
        postsAPI.search(q), usersAPI.search(q)
      ])
      setResults({
        posts: p.status === 'fulfilled' ? p.value.data.slice(0,4) : [],
        users: u.status === 'fulfilled' ? u.value.data.slice(0,4) : [],
      })
    }, 350)
  }, [q])

  /* close dropdowns on outside click */
  useEffect(() => {
    const h = e => {
      if (!searchRef.current?.contains(e.target)) setResults(null)
      if (!userRef.current?.contains(e.target))   setShowUser(false)
      if (!notifRef.current?.contains(e.target))  setShowNotif(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const openNotif = () => {
    setShowNotif(v => !v)
    if (!showNotif && unread) {
      usersAPI.markRead().then(() => setUnread(0)).catch(() => {})
    }
  }

  const S = {
    logo: { display:'flex', alignItems:'center', gap:8, textDecoration:'none' },
    logoBox: {
      width:34, height:34, borderRadius:10, background:'#6366f1',
      display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow:'0 0 14px rgba(99,102,241,0.4)',
    },
    logoText: { fontWeight:700, fontSize:18, color:'#e2e8f0', letterSpacing:'-0.3px' },
    searchWrap: { position:'relative', flex:1, maxWidth:380 },
    searchInput: { width:'100%', padding:'8px 14px 8px 36px',
      background:'#1e293b', border:'1px solid #334155', borderRadius:10,
      color:'#e2e8f0', fontFamily:'inherit', fontSize:14, outline:'none' },
    searchIcon: { position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#475569' },
    dropdown: {
      position:'absolute', top:'calc(100% + 8px)', left:0, right:0,
      background:'#1e293b', border:'1px solid #334155', borderRadius:12,
      boxShadow:'0 20px 40px rgba(0,0,0,0.5)', zIndex:100, overflow:'hidden',
    },
    navLink: {
      display:'flex', alignItems:'center', gap:6, padding:'6px 12px',
      borderRadius:9, textDecoration:'none', fontSize:14, fontWeight:500,
      color: '#94a3b8', transition:'all 0.15s',
    },
    iconBtn: {
      background:'transparent', border:'none', cursor:'pointer',
      padding:8, borderRadius:9, color:'#94a3b8', position:'relative',
      display:'flex', alignItems:'center',
    },
    notifDropdown: {
      position:'absolute', top:'calc(100% + 8px)', right:0, width:320,
      background:'#1e293b', border:'1px solid #334155', borderRadius:12,
      boxShadow:'0 20px 40px rgba(0,0,0,0.5)', zIndex:100, overflow:'hidden',
    },
    userDropdown: {
      position:'absolute', top:'calc(100% + 8px)', right:0, width:180,
      background:'#1e293b', border:'1px solid #334155', borderRadius:12,
      boxShadow:'0 20px 40px rgba(0,0,0,0.5)', zIndex:100, overflow:'hidden',
    },
  }

  const isActive = path => loc.pathname === path

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/feed" style={S.logo}>
        <div style={S.logoBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
        </div>
        <span style={S.logoText}>DevConnect</span>
      </Link>

      {/* Search */}
      <div ref={searchRef} style={S.searchWrap}>
        <svg style={S.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          style={S.searchInput}
          placeholder="Search people & posts…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        {results && (
          <div style={S.dropdown}>
            {results.users.length === 0 && results.posts.length === 0
              ? <div style={{ padding:'12px 16px', color:'#475569', fontSize:14 }}>No results</div>
              : <>
                {results.users.map(u => (
                  <button key={u.id}
                    onClick={() => { nav(`/profile/${u.id}`); setQ(''); setResults(null) }}
                    style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 14px',
                      background:'none', border:'none', cursor:'pointer', textAlign:'left' }}
                    onMouseOver={e=>e.currentTarget.style.background='#334155'}
                    onMouseOut={e=>e.currentTarget.style.background='none'}>
                    <Avatar user={u} size={32} />
                    <div>
                      <div style={{ fontSize:14, fontWeight:500, color:'#e2e8f0' }}>{u.name}</div>
                      <div style={{ fontSize:12, color:'#475569' }}>{u.post_count} posts</div>
                    </div>
                  </button>
                ))}
                {results.posts.map(p => (
                  <button key={p.id}
                    onClick={() => { nav('/feed'); setQ(''); setResults(null) }}
                    style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 14px',
                      background:'none', border:'none', cursor:'pointer', textAlign:'left' }}
                    onMouseOver={e=>e.currentTarget.style.background='#334155'}
                    onMouseOut={e=>e.currentTarget.style.background='none'}>
                    <Avatar user={p.author} size={28} />
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:12, color:'#475569' }}>{p.author.name}</div>
                      <div style={{ fontSize:13, color:'#cbd5e1', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:220 }}>{p.content}</div>
                    </div>
                  </button>
                ))}
              </>
            }
          </div>
        )}
      </div>

      {/* Right side */}
      <div style={{ display:'flex', alignItems:'center', gap:4, marginLeft:'auto' }}>
        <Link to="/feed"
          style={{ ...S.navLink, ...(isActive('/feed') ? { color:'#818cf8', background:'rgba(99,102,241,0.1)' } : {}) }}
          onMouseOver={e=>{ if(!isActive('/feed')) e.currentTarget.style.background='#1e293b' }}
          onMouseOut={e=>{ if(!isActive('/feed')) e.currentTarget.style.background='transparent' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Feed
        </Link>

        {/* Notifications */}
        <div ref={notifRef} style={{ position:'relative' }}>
          <button style={S.iconBtn} onClick={openNotif}
            onMouseOver={e=>e.currentTarget.style.background='#1e293b'}
            onMouseOut={e=>e.currentTarget.style.background='transparent'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unread > 0 && <span className="dot-unread" />}
          </button>
          {showNotif && (
            <div style={S.notifDropdown}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid #334155', fontWeight:600, fontSize:14, display:'flex', justifyContent:'space-between' }}>
                Notifications {unread > 0 && <span className="badge">{unread} new</span>}
              </div>
              <div style={{ maxHeight:300, overflowY:'auto' }}>
                {notifs.length === 0
                  ? <div style={{ padding:'20px 16px', color:'#475569', fontSize:14, textAlign:'center' }}>No notifications yet</div>
                  : notifs.map(n => (
                    <div key={n.id} style={{ padding:'10px 16px', borderBottom:'1px solid #0f172a', background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.07)' }}>
                      <div style={{ fontSize:13, color:'#cbd5e1' }}>
                        <span style={{ fontWeight:600, color:'#e2e8f0' }}>{n.actor_name}</span> {n.action}
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
          <button style={{ ...S.iconBtn, gap:8, padding:'5px 10px 5px 5px' }}
            onClick={() => setShowUser(v => !v)}
            onMouseOver={e=>e.currentTarget.style.background='#1e293b'}
            onMouseOut={e=>e.currentTarget.style.background='transparent'}>
            <Avatar user={user} size={30} />
            <span style={{ fontSize:14, fontWeight:500, color:'#e2e8f0', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.name}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {showUser && (
            <div style={S.userDropdown}>
              <Link to={`/profile/${user?.id}`}
                onClick={() => setShowUser(false)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 16px', color:'#cbd5e1', textDecoration:'none', fontSize:14 }}
                onMouseOver={e=>e.currentTarget.style.background='#334155'}
                onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                My Profile
              </Link>
              <div style={{ borderTop:'1px solid #334155' }} />
              <button
                onClick={() => { logout(); nav('/login') }}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 16px', color:'#f87171', background:'none', border:'none', width:'100%', cursor:'pointer', fontSize:14, fontFamily:'inherit' }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(239,68,68,0.08)'}
                onMouseOut={e=>e.currentTarget.style.background='none'}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
