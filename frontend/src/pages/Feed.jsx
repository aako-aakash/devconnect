import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, RefreshCw, TrendingUp, Users } from 'lucide-react'
import { postsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import CreatePost from '../components/CreatePost'
import PostCard from '../components/PostCard'

function SkeletonPost() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3.5 w-32 rounded" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3.5 w-full rounded" />
        <div className="skeleton h-3.5 w-4/5 rounded" />
        <div className="skeleton h-3.5 w-2/3 rounded" />
      </div>
      <div className="flex gap-3 pt-2 border-t border-dark-500/30">
        <div className="skeleton h-7 w-16 rounded-lg" />
        <div className="skeleton h-7 w-20 rounded-lg" />
      </div>
    </div>
  )
}

export default function Feed() {
  const { user }                    = useAuth()
  const [posts, setPosts]           = useState([])
  const [page, setPage]             = useState(1)
  const [hasMore, setHasMore]       = useState(true)
  const [loading, setLoading]       = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError]           = useState('')
  const [total, setTotal]           = useState(0)
  const loaderRef                   = useRef(null)

  const loadPosts = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)
    setError('')
    try {
      const { data } = await postsAPI.getFeed(pageNum, 15)
      setPosts(prev => append ? [...prev, ...data.posts] : data.posts)
      setHasMore(data.has_more)
      setTotal(data.total)
      setPage(pageNum)
    } catch {
      setError('Failed to load posts. Please refresh.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    loadPosts(1)
  }, [loadPosts])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current || !hasMore || loadingMore) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadPosts(page + 1, true)
      },
      { threshold: 0.1 }
    )
    obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, page, loadPosts])

  const handleCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev])
    setTotal(prev => prev + 1)
  }

  const handleDelete = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
    setTotal(prev => prev - 1)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main feed column */}
        <div className="lg:col-span-2 space-y-4">
          <CreatePost onCreated={handleCreated} />

          {/* Feed header */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-400" />
              Global Feed
              {total > 0 && <span className="tag-pill ml-1">{total}</span>}
            </h2>
            <button
              onClick={() => loadPosts(1)}
              disabled={loading}
              className="btn-ghost py-1 px-2 text-xs gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="card p-4 text-center text-red-400 text-sm">
              {error}
              <button onClick={() => loadPosts(1)} className="ml-2 underline">Retry</button>
            </div>
          )}

          {/* Skeleton loading */}
          {loading && (
            <div className="space-y-4">
              {[1,2,3,4].map(i => <SkeletonPost key={i} />)}
            </div>
          )}

          {/* Posts */}
          {!loading && (
            <>
              {posts.length === 0 ? (
                <div className="card p-12 text-center">
                  <p className="text-4xl mb-3">👋</p>
                  <p className="font-semibold text-slate-300 mb-1">Nothing here yet</p>
                  <p className="text-sm text-slate-500">Be the first to post something!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post, i) => (
                    <div key={post.id} style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                      <PostCard
                        post={post}
                        onDelete={handleDelete}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Infinite scroll trigger */}
              {hasMore && (
                <div ref={loaderRef} className="py-4 flex justify-center">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading more…
                    </div>
                  )}
                </div>
              )}

              {!hasMore && posts.length > 0 && (
                <p className="text-center text-xs text-slate-600 py-4 font-mono">— You've seen everything —</p>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-4">
          {/* User card */}
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg glow">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-100">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate max-w-[140px]">{user?.email}</p>
              </div>
            </div>
            <div className="text-center py-3 bg-dark-700/50 rounded-xl">
              <p className="text-2xl font-bold text-brand-400">{total}</p>
              <p className="text-xs text-slate-500 mt-0.5">Posts in community</p>
            </div>
          </div>

          {/* Tips */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Quick tips
            </p>
            <ul className="space-y-2.5">
              {[
                'Share what you\'re building',
                'Ask questions or seek feedback',
                'Celebrate others\' wins',
                'Search for topics you care about',
              ].map(tip => (
                <li key={tip} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-brand-400 mt-0.5">›</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Stack tags */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Trending topics</p>
            <div className="flex flex-wrap gap-2">
              {['#react', '#python', '#fastapi', '#webdev', '#openai', '#beginners', '#portfolio', '#css', '#nodejs'].map(tag => (
                <span key={tag} className="tag-pill cursor-pointer hover:bg-brand-900/60 transition-colors text-xs">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
