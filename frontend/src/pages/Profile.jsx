import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { usersAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import { Avatar, Spinner, SkeletonCard, joinDate } from '../components/helpers'

export default function Profile() {
  const { userId }                    = useParams()
  const { user: me, patchUser }       = useAuth()
  const isOwn                         = String(me?.id) === String(userId)
  const [profile, setProfile]         = useState(null)
  const [posts, setPosts]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [editing, setEditing]         = useState(false)
  const [saving, setSaving]           = useState(false)
  const [form, setForm]               = useState({ name:'', bio:'', avatar_url:'' })

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [pr, po] = await Promise.all([usersAPI.profile(userId), usersAPI.posts(userId)])
      setProfile(pr.data); setPosts(po.data)
      setForm({ name: pr.data.name, bio: pr.data.bio || '', avatar_url: pr.data.avatar_url || '' })
    } catch(err) {
      setError(err?.response?.data?.detail || 'Could not load profile')
    } finally { setLoading(false) }
  }, [userId])

  useEffect(() => { load() }, [load])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await usersAPI.update({
        name: form.name.trim() || undefined,
        bio: form.bio,
        avatar_url: form.avatar_url || null,
      })
      setProfile(p => ({ ...p, ...data }))
      patchUser(data)
      setEditing(false)
    } catch(err) {
      alert(err?.response?.data?.detail || 'Save failed')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:'28px 20px' }}>
      <div className="card" style={{ padding:24, marginBottom:20 }}>
        <div style={{ display:'flex', gap:16 }}>
          <div className="skeleton" style={{ width:72, height:72, borderRadius:'50%', flexShrink:0 }} />
          <div style={{ flex:1, paddingTop:4 }}>
            <div className="skeleton" style={{ height:16, width:'40%', marginBottom:8 }} />
            <div className="skeleton" style={{ height:13, width:'60%' }} />
          </div>
        </div>
      </div>
      {[1,2,3].map(i => <div key={i} style={{ marginBottom:14 }}><SkeletonCard /></div>)}
    </div>
  )

  if (error) return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:'28px 20px', textAlign:'center' }}>
      <p style={{ color:'#f87171', marginBottom:16 }}>{error}</p>
      <button className="btn btn-primary" onClick={load}>Retry</button>
    </div>
  )

  return (
    <div style={{ maxWidth:640, margin:'0 auto', padding:'28px 20px' }}>
      {/* Profile card */}
      <div className="card" style={{ padding:24, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:18 }}>
          <Avatar user={profile} size={72} />
          <div style={{ flex:1, minWidth:0 }}>
            {!editing ? (
              <>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                  <div>
                    <h1 style={{ fontWeight:700, fontSize:20, color:'#f1f5f9', marginBottom:2 }}>{profile?.name}</h1>
                    <p style={{ color:'#475569', fontSize:13 }}>{profile?.email}</p>
                  </div>
                  {isOwn && (
                    <button className="btn btn-ghost" style={{ padding:'5px 12px', fontSize:12, flexShrink:0 }}
                      onClick={() => setEditing(true)}>
                      Edit
                    </button>
                  )}
                </div>
                {profile?.bio
                  ? <p style={{ color:'#94a3b8', fontSize:14, marginTop:10, lineHeight:1.6 }}>{profile.bio}</p>
                  : isOwn && <p style={{ color:'#334155', fontSize:13, marginTop:10, fontStyle:'italic' }}>Add a bio…</p>
                }
                <div style={{ display:'flex', gap:20, marginTop:14 }}>
                  <span style={{ fontSize:13, color:'#475569' }}>
                    <span style={{ fontWeight:600, color:'#818cf8' }}>{posts.length}</span> posts
                  </span>
                  {profile?.created_at && (
                    <span style={{ fontSize:13, color:'#475569' }}>
                      Joined {joinDate(profile.created_at)}
                    </span>
                  )}
                </div>
              </>
            ) : (
              /* Edit form */
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div>
                  <label style={{ fontSize:12, color:'#475569', display:'block', marginBottom:4 }}>Name</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} maxLength={100} />
                </div>
                <div>
                  <label style={{ fontSize:12, color:'#475569', display:'block', marginBottom:4 }}>Bio</label>
                  <textarea className="input" value={form.bio} onChange={e => setForm(f => ({...f, bio:e.target.value}))} rows={3} maxLength={300} style={{ resize:'none' }} />
                </div>
                <div>
                  <label style={{ fontSize:12, color:'#475569', display:'block', marginBottom:4 }}>Avatar URL</label>
                  <input className="input" value={form.avatar_url} onChange={e => setForm(f => ({...f, avatar_url:e.target.value}))} placeholder="https://…" />
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-primary" style={{ height:34, padding:'0 16px', fontSize:13 }} onClick={saveProfile} disabled={saving}>
                    {saving ? <Spinner size={14} color="#fff" /> : 'Save'}
                  </button>
                  <button className="btn btn-ghost" style={{ height:34, padding:'0 14px', fontSize:13 }} onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts */}
      <p style={{ fontSize:12, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:14 }}>
        {isOwn ? 'Your posts' : 'Posts'} · {posts.length}
      </p>
      {posts.length === 0 && (
        <div className="card" style={{ padding:40, textAlign:'center' }}>
          <p style={{ color:'#475569', fontSize:14 }}>No posts yet</p>
        </div>
      )}
      {posts.map(post => (
        <div key={post.id} style={{ marginBottom:14 }}>
          <PostCard post={post} onDelete={isOwn ? id => setPosts(p => p.filter(x => x.id !== id)) : undefined} />
        </div>
      ))}
    </div>
  )
}
