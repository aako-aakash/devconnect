import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { postsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

const MAX_CHARS = 2000

export default function CreatePost({ onCreated }) {
  const { user }              = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [focused, setFocused] = useState(false)

  const charsLeft = MAX_CHARS - content.length
  const isNearLimit = charsLeft < 100

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const { data } = await postsAPI.create({ content: content.trim() })
      setContent('')
      setFocused(false)
      if (onCreated) onCreated(data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to post. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e)
    }
  }

  return (
    <div className={`card p-4 transition-all duration-200 ${focused ? 'border-brand-600/60 glow' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar user={user} size="md" className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind? Share something with the dev community…"
              maxLength={MAX_CHARS}
              rows={focused || content ? 4 : 2}
              className="w-full bg-transparent border-none outline-none resize-none text-sm text-slate-200 placeholder-slate-500 leading-relaxed transition-all duration-200"
            />

            {(focused || content) && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-500/40 fade-in">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono ${isNearLimit ? 'text-amber-400' : 'text-slate-600'}`}>
                    {charsLeft} chars left
                  </span>
                  <span className="text-xs text-slate-600 hidden sm:block">
                    Ctrl+Enter to post
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!content.trim() || loading || charsLeft < 0}
                  className="btn-primary h-8 px-4 text-xs">
                  {loading
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Posting…</>
                    : <><Send className="h-3.5 w-3.5" /> Post</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-red-400 ml-13">{error}</p>}
      </form>
    </div>
  )
}
