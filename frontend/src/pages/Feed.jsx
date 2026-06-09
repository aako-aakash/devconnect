import { useState, useEffect, useCallback, useRef } from 'react'
import { postsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import { Spinner, SkeletonCard } from '../components/helpers'

function CreatePost({ onCreated }) {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)

  const submit = async e => {
    e.preventDefault()
    if (!text.trim() || loading) return
    setLoading(true); setError('')
    try {
      const { data } = await postsAPI.create({ content: text.trim() })
      setText(''); setFocused(false); onCreated(data)
    } catch (err) { setError(err?.response?.data?.detail || 'Failed to post') }
    finally { setLoading(false) }
  }

  return (
    <div className="card" style={{ padding:20, marginBottom:20 }}>
      <form onSubmit={submit}>
        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{ width:38, height:38, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:15, flexShrink:0, boxShadow:'0 4px 12px rgba(99,102,241,0.35)' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <textarea
              value={text} onChange={e => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="What are you building? Share with the dev community…"
              maxLength={2000} rows={focused || text ? 4 : 2}
              style={{ width:'100%', background:'transparent', border:'none', outline:'none', resize:'none', color:'var(--t1)', fontSize:14, lineHeight:1.7, fontFamily:'inherit', paddingTop:8 }}
            />
            {(focused || text) && (
              <div className="fade-up" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10, paddingTop:12, borderTop:'1px solid rgba(99,102,241,0.1)' }}>
                <span style={{ fontSize:12, color: text.length > 1900 ? 'var(--amber)' : 'var(--t3)' }}>
                  {2000 - text.length} chars left
                </span>
                <button type="submit" className="btn btn-primary" style={{ height:34, padding:'0 18px', fontSize:13 }} disabled={!text.trim() || loading}>
                  {loading ? <Spinner size={14} color="#fff"/> : <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    Post
                  </>}
                </button>
              </div>
            )}
          </div>
        </div>
        {error && <p style={{ color:'var(--red)', fontSize:13, marginTop:8 }}>{error}</p>}
      </form>
    </div>
  )
}

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const { user } = useAuth()
  const loaderRef = useRef(null)

  const loadPosts = useCallback(async (pg = 1, append = false) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true)
    setError('')
    try {
      const { data } = await postsAPI.feed(pg, 15)
      setPosts(prev => append ? [...prev, ...data.posts] : data.posts)
      setHasMore(data.has_more); setTotal(data.total); setPage(pg)
    } catch { setError('Could not load posts. Check your connection.') }
    finally { setLoading(false); setLoadingMore(false) }
  }, [])

  useEffect(() => { loadPosts(1) }, [loadPosts])

  useEffect(() => {
    if (!loaderRef.current || !hasMore || loadingMore) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) loadPosts(page + 1, true)
    }, { threshold: 0.1 })
    obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, page, loadPosts])

  return (
    <div className="page-pad" style={{ maxWidth:900, margin:'0 auto' }}>
      <div className="feed-grid">

        {/* ── Main column ─────────────────────── */}
        <div>
          <CreatePost onCreated={p => { setPosts(prev => [p, ...prev]); setTotal(t => t + 1) }} />

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, paddingLeft:2 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Live Feed</span>
              {total > 0 && <span className="badge">{total}</span>}
            </div>
            <button onClick={() => loadPosts(1)} disabled={loading}
              style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:'var(--t3)', fontSize:12, padding:'4px 8px', borderRadius:8, transition:'color .15s' }}
              onMouseOver={e => e.currentTarget.style.color='var(--accent2)'}
              onMouseOut={e => e.currentTarget.style.color='var(--t3)'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={loading ? 'spin' : ''}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Refresh
            </button>
          </div>

          {/* Skeleton */}
          {loading && [1,2,3].map(i => <div key={i} style={{ marginBottom:16 }}><SkeletonCard/></div>)}

          {/* Error */}
          {error && (
            <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:14, padding:16, color:'var(--red)', fontSize:14, textAlign:'center', marginBottom:16 }}>
              {error}{' '}
              <button onClick={() => loadPosts(1)} style={{ background:'none', border:'none', color:'var(--accent2)', cursor:'pointer', fontSize:14, marginLeft:6 }}>Retry</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && posts.length === 0 && !error && (
            <div className="card" style={{ padding:56, textAlign:'center' }}>
              <div style={{ fontSize:42, marginBottom:12 }}>🚀</div>
              <p style={{ fontWeight:700, color:'var(--t1)', marginBottom:4, fontSize:16 }}>No posts yet</p>
              <p style={{ color:'var(--t3)', fontSize:14 }}>Be the first to share something with the community!</p>
            </div>
          )}

          {/* Posts */}
          {!loading && posts.map((post, i) => (
            <div key={post.id} style={{ marginBottom:16, animationDelay:`${Math.min(i,6)*50}ms` }}>
              <PostCard post={post} onDelete={id => { setPosts(p => p.filter(x => x.id !== id)); setTotal(t => t - 1) }} />
            </div>
          ))}

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={loaderRef} style={{ display:'flex', justifyContent:'center', padding:20 }}>
              {loadingMore && <Spinner/>}
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <p style={{ textAlign:'center', color:'var(--t3)', fontSize:12, padding:'16px 0', letterSpacing:'0.1em', fontFamily:'monospace' }}>── end of feed ──</p>
          )}
        </div>

        {/* ── Sidebar ──────────────────────────── */}
        <div className="feed-sidebar" style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* User card */}
          <div className="card" style={{ padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <div style={{ width:46, height:46, borderRadius:14, background:'linear-gradient(135deg,#6366f1,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:18, boxShadow:'0 4px 14px rgba(99,102,241,0.45)', flexShrink:0 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'var(--t1)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
                <p style={{ fontSize:12, color:'var(--t3)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
              </div>
            </div>
            <div style={{ background:'rgba(99,102,241,0.07)', borderRadius:12, padding:'14px 16px', textAlign:'center', border:'1px solid rgba(99,102,241,0.1)' }}>
              <p style={{ fontSize:28, fontWeight:800, color:'var(--accent2)', margin:0, lineHeight:1, letterSpacing:'-1px' }}>{total}</p>
              <p style={{ fontSize:12, color:'var(--t3)', margin:'4px 0 0' }}>posts in community</p>
            </div>
          </div>

          {/* Trending */}
          <div className="card" style={{ padding:20 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Trending topics</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
              {['#react','#python','#fastapi','#webdev','#ai','#css','#nodejs','#beginners','#portfolio','#openai'].map(t => (
                <span key={t} className="badge" style={{ cursor:'pointer', fontSize:11, padding:'3px 9px', transition:'all .15s' }}
                  onMouseOver={e => { e.currentTarget.style.background='rgba(99,102,241,0.2)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.4)' }}
                  onMouseOut={e => { e.currentTarget.style.background='rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.2)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="card" style={{ padding:20 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Quick tips</p>
            {['Share what you are building','Ask questions freely','Celebrate others wins','Search by topic or name'].map((tip, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:9, marginBottom:11 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--accent)', marginTop:7, flexShrink:0, boxShadow:'0 0 6px rgba(99,102,241,0.6)' }}/>
                <span style={{ fontSize:13, color:'var(--t2)', lineHeight:1.5 }}>{tip}</span>
              </div>
            ))}
          </div>

          {/* Powered by */}
          <div style={{ textAlign:'center', padding:'10px 0' }}>
            <span style={{ fontSize:11, color:'var(--t3)' }}>Powered by </span>
            <span style={{ fontSize:11, fontWeight:700, background:'linear-gradient(90deg,#6366f1,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Skyward</span>
          </div>
        </div>
      </div>
    </div>
  )
}
