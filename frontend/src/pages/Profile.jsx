import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  Edit2, Check, X, Calendar, FileText,
  Loader2, Camera, Link as LinkIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { usersAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import PostCard from '../components/PostCard'

function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="skeleton h-20 w-20 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="skeleton h-5 w-48 rounded" />
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-3 w-64 rounded" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="card p-5 space-y-3">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-4/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Profile() {
  const { userId }              = useParams()
  const { user: me, updateUser } = useAuth()
  const isOwn                   = String(me?.id) === String(userId)

  const [profile, setProfile]   = useState(null)
  const [posts, setPosts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [editForm, setEditForm] = useState({ name: '', bio: '', avatar_url: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [profileRes, postsRes] = await Promise.all([
        usersAPI.getProfile(userId),
        usersAPI.getUserPosts(userId),
      ])
      setProfile(profileRes.data)
      setPosts(postsRes.data)
      setEditForm({
        name: profileRes.data.name,
        bio: profileRes.data.bio || '',
        avatar_url: profileRes.data.avatar_url || '',
      })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not load profile.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {}
      if (editForm.name.trim()) payload.name = editForm.name.trim()
      if (editForm.bio !== undefined) payload.bio = editForm.bio
      if (editForm.avatar_url !== undefined) payload.avatar_url = editForm.avatar_url || null

      const { data } = await usersAPI.updateProfile(payload)
      setProfile(prev => ({ ...prev, ...data }))
      updateUser(data)
      setEditing(false)
    } catch (err) {
      alert(err?.response?.data?.detail || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
    setProfile(prev => ({ ...prev, post_count: (prev?.post_count || 1) - 1 }))
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <SkeletonProfile />
    </div>
  )

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="card p-8 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="font-semibold text-slate-300 mb-1">{error}</p>
        <button onClick={load} className="btn-primary mt-4">Retry</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      {/* Profile card */}
      <div className="card p-6 slide-up">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar user={profile} size="2xl" />
            {isOwn && editing && (
              <button
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-brand-600 flex items-center justify-center border-2 border-dark-800 hover:bg-brand-500 transition-colors"
                title="Change avatar URL">
                <Camera className="h-3.5 w-3.5 text-white" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {!editing ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <h1 className="text-xl font-bold text-slate-100 truncate">{profile?.name}</h1>
                  {isOwn && (
                    <button onClick={() => setEditing(true)}
                      className="btn-ghost py-1 px-2.5 text-xs gap-1.5 flex-shrink-0">
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{profile?.email}</p>
                {profile?.bio ? (
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">{profile.bio}</p>
                ) : isOwn ? (
                  <p className="text-sm text-slate-600 mt-2 italic">Add a bio to tell the community about yourself…</p>
                ) : null}

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : '—'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="font-semibold text-brand-400">{posts.length}</span> posts
                  </div>
                </div>
              </>
            ) : (
              /* Edit form */
              <div className="space-y-3 fade-in">
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Name</label>
                  <input
                    value={editForm.name}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    className="input-field mt-1"
                    placeholder="Your name"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                    className="input-field mt-1 resize-none"
                    placeholder="Tell the community about yourself…"
                    rows={3}
                    maxLength={300}
                  />
                  <p className="text-xs text-slate-600 mt-0.5 text-right">{editForm.bio.length}/300</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" /> Avatar URL
                  </label>
                  <input
                    value={editForm.avatar_url}
                    onChange={e => setEditForm(p => ({ ...p, avatar_url: e.target.value }))}
                    className="input-field mt-1"
                    placeholder="https://example.com/avatar.jpg"
                    type="url"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={handleSave} disabled={saving} className="btn-primary h-8 px-4 text-xs">
                    {saving
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                      : <><Check className="h-3.5 w-3.5" /> Save</>
                    }
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-ghost h-8 px-3 text-xs">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1 mb-3 flex items-center gap-2">
          <FileText className="h-3.5 w-3.5" />
          {isOwn ? 'Your posts' : `Posts by ${profile?.name?.split(' ')[0]}`}
          <span className="tag-pill">{posts.length}</span>
        </h2>

        {posts.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-slate-400 text-sm">
              {isOwn ? 'You haven\'t posted anything yet.' : 'No posts yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={isOwn ? handleDeletePost : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
