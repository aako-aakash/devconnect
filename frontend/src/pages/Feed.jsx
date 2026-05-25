import { useState, useEffect, useCallback, useRef } from 'react'
import { postsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import { Spinner, SkeletonCard } from '../components/helpers'

function CreatePost({ onCreated }) {
  const { user }              = useAuth()
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [focused, setFocused] = useState(false)

  const submit = async e => {
    e.preventDefault()
    if (!text.trim() || loading) return
    setLoading(true); setError('')
    try {
      const { data } = await postsAPI.create({ content: text.trim() })
      setText(''); setFocused(false); onCreated(data)
    } catch(err) {
      setError(err?.response?.data?.detail || 'Failed to post')
    } finally { setLoading(false) }
  }

  return (
    <div className="card" style={{ padding:18, marginBottom:18 }}>
      <form onSubmit={submit}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Share something with the community…"
          maxLength={2000}
          rows={focused || text ? 4 : 2}
          style={{ width:'100%', background:'transparent', border:'none', outline:'none', resize:'none',
            color:'#e2e8f0', fontSize:14, lineHeight:1.6, fontFamily:'inherit' }}
        />
        {(focused || text) && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12, paddingTop:12, borderTop:'1px solid #334155' }}>
            <span style={{ fontSize:12, color: text.length > 1900 ? '#f59e0b' : '#475569' }}>
              {2000 - text.length} chars left
            </span>
            <button type="submit" className="btn btn-primary" style={{ height:34, padding:'0 16px', fontSize:13 }} disabled={!text.trim() || loading}>
              {loading ? <Spinner size={14} color="#fff" /> : 'Post'}
            </button>
          </div>
        )}
        {error && <p style={{ color:'#f87171', fontSize:13, marginTop:8 }}>{error}</p>}
      </form>
    </div>
  )
}

export default function Feed() {
  const [posts, setPosts]         = useState([])
  const [page, setPage]           = useState(1)
  const [hasMore, setHasMore]     = useState(true)
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError]         = useState('')
  const [total, setTotal]         = useState(0)
  const loaderRef                 = useRef(null)

  const loadPosts = useCallback(async (pg = 1, append = false) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true)
    setError('')
    try {
      const { data } = await postsAPI.feed(pg, 15)
      setPosts(prev => append ? [...prev, ...data.posts] : data.posts)
      setHasMore(data.has_more)
      setTotal(data.total)
      setPage(pg)
    } catch {
      setError('Could not load posts. Check your connection.')
    } finally {
      setLoading(false); setLoadingMore(false)
    }
  }, [])

  useEffect(() => { loadPosts(1) }, [loadPosts])

  /* Infinite scroll */
  useEffect(() => {
    if (!loaderRef.current || !hasMore || loadingMore) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) loadPosts(page + 1, true)
    }, { threshold: 0.1 })
    obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, page, loadPosts])

  return (
    <div style={{ maxWidth:780, margin:'0 auto', padding:'28px 20px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:24 }}>
        {/* Main column */}
        <div>
          <CreatePost onCreated={p => { setPosts(prev => [p, ...prev]); setTotal(t => t+1) }} />

          {loading && [1,2,3,4].map(i => <div key={i} style={{ marginBottom:14 }}><SkeletonCard /></div>)}

          {error && (
            <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:16, color:'#fca5a5', fontSize:14, textAlign:'center' }}>
              {error} <button onClick={() => loadPosts(1)} style={{ background:'none', border:'none', color:'#818cf8', cursor:'pointer', fontSize:14 }}>Retry</button>
            </div>
          )}

          {!loading && posts.length === 0 && !error && (
            <div className="card" style={{ padding:48, textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>👋</div>
              <p style={{ color:'#94a3b8', fontSize:15 }}>No posts yet — be the first!</p>
            </div>
          )}

          {!loading && posts.map(post => (
            <div key={post.id} style={{ marginBottom:14 }}>
              <PostCard post={post} onDelete={id => { setPosts(p => p.filter(x => x.id !== id)); setTotal(t => t-1) }} />
            </div>
          ))}

          {hasMore && (
            <div ref={loaderRef} style={{ display:'flex', justifyContent:'center', padding:20 }}>
              {loadingMore && <Spinner />}
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <p style={{ textAlign:'center', color:'#334155', fontSize:13, padding:'16px 0', fontFamily:'monospace' }}>
              — end of feed —
            </p>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="card" style={{ padding:18 }}>
            <p style={{ fontSize:12, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>Community</p>
            <div style={{ textAlign:'center', padding:'12px 0', background:'#0f172a', borderRadius:10 }}>
              <p style={{ fontSize:28, fontWeight:700, color:'#818cf8' }}>{total}</p>
              <p style={{ fontSize:12, color:'#475569', marginTop:2 }}>posts shared</p>
            </div>
          </div>
          <div className="card" style={{ padding:18 }}>
            <p style={{ fontSize:12, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>Trending topics</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {['#react','#python','#fastapi','#webdev','#beginners','#css','#nodejs','#openai'].map(t => (
                <span key={t} className="badge" style={{ cursor:'pointer' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
