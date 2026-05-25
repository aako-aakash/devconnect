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

  const handleLike = async () => {
    if (liking) return
    setLiking(true)
    const wasLiked = liked
    setLiked(!wasLiked); setLikeCount(c => wasLiked ? c - 1 : c + 1)
    try {
      const { data } = await postsAPI.like(post.id)
      setLiked(data.liked); setLikeCount(data.like_count)
    } catch {
      setLiked(wasLiked); setLikeCount(c => wasLiked ? c + 1 : c - 1)
    } finally { setLiking(false) }
  }

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingCmt(true)
      try { const { data } = await postsAPI.comments(post.id); setComments(data) }
      catch {}
      finally { setLoadingCmt(false) }
    }
    setShowComments(v => !v)
  }

  const submitComment = async e => {
    e.preventDefault()
    if (!newCmt.trim() || postingCmt) return
    setPostingCmt(true)
    try {
      const { data } = await postsAPI.addComment(post.id, { content: newCmt.trim() })
      setComments(c => [...c, data]); setNewCmt('')
    } catch {}
    finally { setPostingCmt(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    setDeleting(true)
    try { await postsAPI.remove(post.id); onDelete?.(post.id) }
    catch { setDeleting(false) }
  }

  return (
    <div className="card fade-up" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
        <Link to={`/profile/${post.author.id}`} style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <Avatar user={post.author} size={38} />
          <div>
            <div style={{ fontWeight:600, fontSize:14, color:'#e2e8f0' }}>{post.author.name}</div>
            <div style={{ fontSize:12, color:'#475569', marginTop:1 }}>{timeAgo(post.created_at)}</div>
          </div>
        </Link>
        {user?.id === post.author.id && (
          <button className="btn btn-danger" style={{ padding:'4px 8px', fontSize:12 }}
            onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner size={14}/> : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <p style={{ fontSize:14, color:'#cbd5e1', lineHeight:1.6, whiteSpace:'pre-wrap', wordBreak:'break-word', marginBottom:14 }}>
        {post.content}
      </p>

      {/* Actions */}
      <div style={{ display:'flex', gap:4, paddingTop:12, borderTop:'1px solid #334155' }}>
        <button
          onClick={handleLike}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8,
            background: liked ? 'rgba(239,68,68,0.1)' : 'transparent',
            border:'none', cursor:'pointer', color: liked ? '#f87171' : '#64748b',
            fontSize:13, fontWeight:500, fontFamily:'inherit', transition:'all 0.15s' }}>
          <svg width="15" height="15" viewBox="0 0 24 24"
            fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {likeCount}
        </button>
        <button
          onClick={toggleComments}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8,
            background: showComments ? 'rgba(99,102,241,0.1)' : 'transparent',
            border:'none', cursor:'pointer', color: showComments ? '#818cf8' : '#64748b',
            fontSize:13, fontWeight:500, fontFamily:'inherit', transition:'all 0.15s' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {post.comment_count + (comments.length > post.comment_count ? comments.length - post.comment_count : 0)}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid #0f172a' }}>
          {loadingCmt && <div style={{ display:'flex', justifyContent:'center', padding:12 }}><Spinner /></div>}
          {comments.map(c => (
            <div key={c.id} style={{ display:'flex', gap:8, marginBottom:10 }}>
              <Link to={`/profile/${c.author.id}`}><Avatar user={c.author} size={28} /></Link>
              <div style={{ background:'#0f172a', borderRadius:10, padding:'8px 12px', flex:1 }}>
                <div style={{ display:'flex', gap:8, alignItems:'baseline', marginBottom:2 }}>
                  <Link to={`/profile/${c.author.id}`} style={{ fontWeight:600, fontSize:13, color:'#e2e8f0', textDecoration:'none' }}>{c.author.name}</Link>
                  <span style={{ fontSize:11, color:'#475569' }}>{timeAgo(c.created_at)}</span>
                </div>
                <p style={{ fontSize:13, color:'#94a3b8', margin:0 }}>{c.content}</p>
              </div>
            </div>
          ))}
          {!loadingCmt && comments.length === 0 && (
            <p style={{ fontSize:13, color:'#475569', textAlign:'center', padding:'8px 0' }}>No comments yet</p>
          )}
          <form onSubmit={submitComment} style={{ display:'flex', gap:8, marginTop:8 }}>
            <Avatar user={user} size={28} />
            <div style={{ flex:1, position:'relative' }}>
              <input
                value={newCmt} onChange={e => setNewCmt(e.target.value)}
                placeholder="Write a comment…" maxLength={500}
                className="input" style={{ paddingRight:42, fontSize:13 }}
              />
              <button type="submit" disabled={!newCmt.trim() || postingCmt}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color: newCmt.trim() ? '#6366f1' : '#334155',
                  display:'flex', alignItems:'center' }}>
                {postingCmt ? <Spinner size={14}/> : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
