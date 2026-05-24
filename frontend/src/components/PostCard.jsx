import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Trash2, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { postsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

export default function PostCard({ post, onDelete, onUpdate }) {
  const { user }                   = useAuth()
  const [liked, setLiked]          = useState(post.liked_by_me)
  const [likeCount, setLikeCount]  = useState(post.like_count)
  const [liking, setLiking]        = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments]    = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]    = useState(false)
  const isOwner = user?.id === post.author.id

  const handleLike = async () => {
    if (liking) return
    setLiking(true)
    // Optimistic update
    setLiked(prev => !prev)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
    try {
      const { data } = await postsAPI.toggleLike(post.id)
      setLiked(data.liked)
      setLikeCount(data.like_count)
    } catch {
      setLiked(prev => !prev)
      setLikeCount(prev => liked ? prev + 1 : prev - 1)
    } finally {
      setLiking(false)
    }
  }

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true)
      try {
        const { data } = await postsAPI.getComments(post.id)
        setComments(data)
      } catch {}
      finally { setLoadingComments(false) }
    }
    setShowComments(v => !v)
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      const { data } = await postsAPI.addComment(post.id, { content: commentText.trim() })
      setComments(prev => [...prev, data])
      setCommentText('')
      if (onUpdate) onUpdate(post.id, { comment_count: post.comment_count + 1 })
    } catch {}
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    setDeleting(true)
    try {
      await postsAPI.delete(post.id)
      if (onDelete) onDelete(post.id)
    } catch {}
    finally { setDeleting(false) }
  }

  return (
    <article className="card p-5 hover:border-dark-400/60 transition-all duration-200 fade-in group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link to={`/profile/${post.author.id}`} className="flex items-center gap-3 min-w-0 group/author">
          <Avatar user={post.author} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-100 text-sm group-hover/author:text-brand-300 transition-colors truncate">
              {post.author.name}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </Link>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger opacity-0 group-hover:opacity-100 p-1.5 transition-all"
            title="Delete post">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words mb-4">
        {post.content}
      </p>

      {/* Action bar */}
      <div className="flex items-center gap-1 pt-3 border-t border-dark-500/40">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
            ${liked
              ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
              : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
            }`}>
          <Heart className={`h-4 w-4 transition-transform ${liked ? 'fill-current scale-110' : ''}`} />
          <span>{likeCount}</span>
        </button>

        {/* Comments */}
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-brand-400 hover:bg-brand-950/30 transition-all">
          <MessageCircle className="h-4 w-4" />
          <span>{post.comment_count + (comments.length > post.comment_count ? comments.length - post.comment_count : 0)}</span>
          {showComments
            ? <ChevronUp className="h-3.5 w-3.5 ml-0.5" />
            : <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
          }
        </button>
      </div>

      {/* Comments panel */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-dark-500/40 space-y-3 fade-in">
          {loadingComments && (
            <div className="space-y-2">
              {[1,2].map(i => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="skeleton h-7 w-7 rounded-full flex-shrink-0" />
                  <div className="skeleton h-10 flex-1 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {!loadingComments && comments.map(c => (
            <div key={c.id} className="flex items-start gap-2.5 group/comment">
              <Link to={`/profile/${c.author.id}`}>
                <Avatar user={c.author} size="xs" />
              </Link>
              <div className="flex-1 min-w-0 bg-dark-700/60 rounded-xl px-3 py-2">
                <div className="flex items-baseline gap-2">
                  <Link to={`/profile/${c.author.id}`}
                    className="text-xs font-semibold text-slate-300 hover:text-brand-300 transition-colors">
                    {c.author.name}
                  </Link>
                  <span className="text-[11px] text-slate-600 font-mono">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5 break-words">{c.content}</p>
              </div>
            </div>
          ))}

          {!loadingComments && comments.length === 0 && (
            <p className="text-sm text-slate-600 text-center py-2">No comments yet. Be the first!</p>
          )}

          {/* Add comment */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-2">
            <Avatar user={user} size="xs" />
            <div className="flex-1 relative">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment…"
                maxLength={500}
                className="input-field pr-10 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submitting}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-300 disabled:text-slate-600 transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  )
}
