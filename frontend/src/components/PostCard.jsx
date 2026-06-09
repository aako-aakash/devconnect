import { useState } from 'react'
import { Link } from 'react-router-dom'
import { postsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Avatar, timeAgo, Spinner } from './helpers'

export default function PostCard({ post, onDelete }) {
  const { user }                        = useAuth()
  const [liked, setLiked]               = useState(post.liked_by_me)
  const [likeCount, setLikeCount]       = useState(post.like_count)
  const [liking, setLiking]             = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments]         = useState([])
  const [loadingCmt, setLoadingCmt]     = useState(false)
  const [newCmt, setNewCmt]             = useState('')
  const [postingCmt, setPostingCmt]     = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [cmtCount, setCmtCount]         = useState(post.comment_count)

  const handleLike = async () => {
    if (liking) return
    setLiking(true)
    const was = liked
    setLiked(!was); setLikeCount(c => was ? c - 1 : c + 1)
    try {
      const { data } = await postsAPI.like(post.id)
      setLiked(data.liked); setLikeCount(data.like_count)
    } catch { setLiked(was); setLikeCount(c => was ? c + 1 : c - 1) }
    finally { setLiking(false) }
  }

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingCmt(true)
      try { const { data } = await postsAPI.comments(post.id); setComments(data) }
      catch {} finally { setLoadingCmt(false) }
    }
    setShowComments(v => !v)
  }

  const submitCmt = async (e) => {
    e.preventDefault()
    if (!newCmt.trim() || postingCmt) return
    setPostingCmt(true)
    try {
      const { data } = await postsAPI.addComment(post.id, { content: newCmt.trim() })
      setComments(c => [...c, data]); setNewCmt(''); setCmtCount(c => c + 1)
    } catch {} finally { setPostingCmt(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    setDeleting(true)
    try { await postsAPI.remove(post.id); onDelete?.(post.id) }
    catch { setDeleting(false) }
  }

  return (
    <article className="card fade-up" style={{ padding:20, transition:'border-color .2s, box-shadow .2s' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <Link to={`/profile/${post.author.id}`} style={{ display:'flex', alignItems:'center', gap:11, textDecoration:'none' }}>
          <Avatar user={post.author} size={40}/>
          <div>
            <p style={{ fontWeight:700, fontSize:14, color:'var(--text1)', margin:0, letterSpacing:'-0.2px' }}>{post.author.name}</p>
            <p style={{ fontSize:12, color:'var(--text3)', margin:'2px 0 0', fontVariantNumeric:'tabular-nums' }}>{timeAgo(post.created_at)}</p>
          </div>
        </Link>
        {user?.id === post.author.id && (
          <button className="btn btn-danger" style={{ padding:'4px 10px', fontSize:12, opacity: deleting ? 0.6 : 1 }} onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner size={13} color="#f87171"/> : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <p className="post-content" style={{ marginBottom:16 }}>{post.content}</p>

      {/* Actions */}
      <div style={{ display:'flex', gap:4, paddingTop:12, borderTop:'1px solid rgba(99,102,241,0.08)' }}>
        <button className={`action-btn ${liked ? 'liked' : ''}`} onClick={handleLike} style={{ color: liked ? 'var(--red)' : 'var(--text3)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ transition:'transform .2s', transform: liked ? 'scale(1.15)' : 'scale(1)' }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span style={{ fontWeight:600 }}>{likeCount}</span>
        </button>

        <button className="action-btn" onClick={toggleComments} style={{ color: showComments ? 'var(--accent2)' : 'var(--text3)', background: showComments ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span style={{ fontWeight:600 }}>{cmtCount}</span>
        </button>
      </div>

      {/* Comments panel */}
      {showComments && (
        <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid rgba(99,102,241,0.07)' }} className="fade-up">
          {loadingCmt && <div style={{ display:'flex', justifyContent:'center', padding:12 }}><Spinner/></div>}

          {comments.map(c => (
            <div key={c.id} style={{ display:'flex', gap:9, marginBottom:12 }}>
              <Link to={`/profile/${c.author.id}`}><Avatar user={c.author} size={30}/></Link>
              <div className="comment-bubble" style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', gap:8, alignItems:'baseline', marginBottom:3 }}>
                  <Link to={`/profile/${c.author.id}`} style={{ fontWeight:700, fontSize:12, color:'var(--text1)', textDecoration:'none' }}>{c.author.name}</Link>
                  <span style={{ fontSize:11, color:'var(--text3)' }}>{timeAgo(c.created_at)}</span>
                </div>
                <p style={{ fontSize:13, color:'var(--text2)', margin:0, lineHeight:1.55, wordBreak:'break-word' }}>{c.content}</p>
              </div>
            </div>
          ))}

          {!loadingCmt && comments.length === 0 && (
            <p style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:'6px 0 10px' }}>No comments yet — be first!</p>
          )}

          {/* Add comment */}
          <form onSubmit={submitCmt} style={{ display:'flex', gap:9, marginTop:8 }}>
            <Avatar user={user} size={30}/>
            <div style={{ flex:1, position:'relative' }}>
              <input value={newCmt} onChange={e => setNewCmt(e.target.value)}
                placeholder="Add a comment…" maxLength={500} className="input"
                style={{ paddingRight:42, paddingTop:9, paddingBottom:9, fontSize:13 }}/>
              <button type="submit" disabled={!newCmt.trim() || postingCmt} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', transition:'opacity .15s', opacity: newCmt.trim() ? 1 : 0.35 }}>
                {postingCmt
                  ? <Spinner size={14}/>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                }
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  )
}
