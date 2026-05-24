import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search, Bell, LogOut, User, Home, X, Menu,
  Code2, ChevronDown
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { postsAPI, usersAPI } from '../api'
import Avatar from './Avatar'
import { useDebounce } from '../hooks'
import { formatDistanceToNow } from 'date-fns'

export default function Navbar() {
  const { user, logout }   = useAuth()
  const navigate            = useNavigate()
  const location            = useLocation()
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState({ posts: [], users: [] })
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showMenu, setShowMenu]   = useState(false)
  const [notifs, setNotifs]       = useState([])
  const [unread, setUnread]       = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const searchRef  = useRef(null)
  const notifsRef  = useRef(null)
  const debouncedQ = useDebounce(query, 350)

  // Fetch notifications
  useEffect(() => {
    if (!user) return
    usersAPI.getNotifications()
      .then(({ data }) => {
        setNotifs(data)
        setUnread(data.filter(n => !n.is_read).length)
      })
      .catch(() => {})
  }, [user])

  // Search when query changes
  useEffect(() => {
    if (!debouncedQ.trim()) { setResults({ posts: [], users: [] }); return }
    setSearching(true)
    Promise.allSettled([
      postsAPI.searchPosts(debouncedQ),
      usersAPI.searchUsers(debouncedQ),
    ]).then(([postRes, userRes]) => {
      setResults({
        posts: postRes.status === 'fulfilled' ? postRes.value.data : [],
        users: userRes.status === 'fulfilled' ? userRes.value.data : [],
      })
    }).finally(() => setSearching(false))
  }, [debouncedQ])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false)
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNotifOpen = () => {
    setShowNotifs(v => !v)
    if (!showNotifs && unread > 0) {
      usersAPI.markNotificationsRead().then(() => setUnread(0)).catch(() => {})
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link to="/feed" className="flex items-center gap-2 flex-shrink-0 mr-2">
          <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center glow">
            <Code2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:block text-gradient">DevConnect</span>
        </Link>

        {/* Search bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setShowSearch(true) }}
              onFocus={() => setShowSearch(true)}
              placeholder="Search posts & people…"
              className="input-field pl-9 pr-4 py-2 text-sm h-9"
            />
            {query && (
              <button onClick={() => { setQuery(''); setShowSearch(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Search dropdown */}
          {showSearch && query.trim() && (
            <div className="absolute top-full mt-2 w-full card shadow-2xl overflow-hidden fade-in">
              {searching && (
                <div className="px-4 py-3 text-sm text-slate-500 animate-pulse">Searching…</div>
              )}
              {!searching && results.users.length === 0 && results.posts.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-500">No results for "{query}"</div>
              )}
              {results.users.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-dark-500/50">
                    People
                  </div>
                  {results.users.slice(0, 4).map(u => (
                    <button key={u.id} onClick={() => { navigate(`/profile/${u.id}`); setShowSearch(false); setQuery('') }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-600/60 transition-colors text-left">
                      <Avatar user={u} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-slate-200">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.post_count} posts</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {results.posts.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-dark-500/50">
                    Posts
                  </div>
                  {results.posts.slice(0, 3).map(p => (
                    <button key={p.id} onClick={() => { navigate('/feed'); setShowSearch(false); setQuery('') }}
                      className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-dark-600/60 transition-colors text-left">
                      <Avatar user={p.author} size="xs" className="mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-400">{p.author.name}</p>
                        <p className="text-sm text-slate-300 truncate">{p.content}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nav items (desktop) */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          <Link to="/feed"
            className={`btn-ghost px-3 py-2 ${isActive('/feed') ? 'text-brand-400 bg-brand-950/50' : ''}`}>
            <Home className="h-4 w-4" />
            <span className="text-sm">Feed</span>
          </Link>

          {/* Notifications */}
          <div ref={notifsRef} className="relative">
            <button onClick={handleNotifOpen}
              className={`btn-ghost relative p-2 ${showNotifs ? 'text-brand-400' : ''}`}>
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="notification-dot flex items-center justify-center text-[9px] font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 card shadow-2xl overflow-hidden fade-in">
                <div className="px-4 py-3 border-b border-dark-500/50 flex items-center justify-between">
                  <span className="font-semibold text-sm">Notifications</span>
                  {unread > 0 && <span className="tag-pill">{unread} new</span>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifs.map(n => (
                      <div key={n.id}
                        className={`px-4 py-3 flex items-start gap-3 border-b border-dark-500/30 transition-colors
                          ${!n.is_read ? 'bg-brand-950/20' : 'hover:bg-dark-700/50'}`}>
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-brand-400' : 'bg-transparent'}`} />
                        <div className="min-w-0">
                          <p className="text-sm text-slate-300">
                            <span className="font-semibold text-slate-100">{n.actor_name}</span>
                            {' '}{n.action}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={null}>
            <button onClick={() => setShowMenu(v => !v)}
              className="btn-ghost flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl">
              <Avatar user={user} size="sm" />
              <span className="text-sm font-medium max-w-[100px] truncate">{user?.name}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 card shadow-2xl overflow-hidden fade-in">
                <Link to={`/profile/${user?.id}`}
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-300 hover:bg-dark-600/60 transition-colors">
                  <User className="h-4 w-4" /> My Profile
                </Link>
                <div className="divider" />
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile burger */}
        <button className="md:hidden btn-ghost p-2 ml-auto" onClick={() => setMobileOpen(v => !v)}>
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dark-500/50 bg-dark-800/95 backdrop-blur-xl px-4 py-3 space-y-1">
          <Link to="/feed" onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isActive('/feed') ? 'bg-brand-950 text-brand-300' : 'text-slate-300'}`}>
            <Home className="h-4 w-4" /> Feed
          </Link>
          <Link to={`/profile/${user?.id}`} onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300">
            <User className="h-4 w-4" /> Profile
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
