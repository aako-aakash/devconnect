import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { usersAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import { Avatar, Spinner, SkeletonCard, joinDate } from '../components/helpers'

export default function Profile() {
  const { userId } = useParams()
  const { user: me, patchUser } = useAuth()
  const isOwn = String(me?.id) === String(userId)
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name:'', bio:'', avatar_url:'' })

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [pr, po] = await Promise.all([usersAPI.profile(userId), usersAPI.posts(userId)])
      setProfile(pr.data); setPosts(po.data)
      setForm({ name:pr.data.name, bio:pr.data.bio||'', avatar_url:pr.data.avatar_url||'' })
    } catch (err) { setError(err?.response?.data?.detail||'Could not load profile') }
    finally { setLoading(false) }
  }, [userId])

  useEffect(() => { load() }, [load])

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await usersAPI.update({ name:form.name.trim()||undefined, bio:form.bio, avatar_url:form.avatar_url||null })
      setProfile(p => ({...p,...data})); patchUser(data); setEditing(false)
    } catch (err) { alert(err?.response?.data?.detail||'Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="page-pad" style={{ maxWidth:680, margin:'0 auto' }}>
      <div className="card" style={{ padding:28, marginBottom:20 }}>
        <div style={{ display:'flex', gap:18 }}>
          <div className="skeleton" style={{ width:76, height:76, borderRadius:'50%', flexShrink:0 }}/>
          <div style={{ flex:1, paddingTop:6 }}>
            <div className="skeleton" style={{ height:16, width:'40%', marginBottom:10 }}/>
            <div className="skeleton" style={{ height:13, width:'60%', marginBottom:8 }}/>
            <div className="skeleton" style={{ height:13, width:'30%' }}/>
          </div>
        </div>
      </div>
      {[1,2,3].map(i => <div key={i} style={{ marginBottom:16 }}><SkeletonCard/></div>)}
    </div>
  )

  if (error) return (
    <div className="page-pad" style={{ maxWidth:680, margin:'0 auto', textAlign:'center' }}>
      <div className="card" style={{ padding:48 }}>
        <p style={{ fontSize:36, marginBottom:12 }}>😕</p>
        <p style={{ color:'var(--red)', marginBottom:20 }}>{error}</p>
        <button className="btn btn-primary" onClick={load}>Try again</button>
      </div>
    </div>
  )

  return (
    <div className="page-pad" style={{ maxWidth:680, margin:'0 auto' }}>
      {/* Profile card */}
      <div className="card" style={{ padding:28, marginBottom:20, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)', borderRadius:'16px 16px 0 0' }}/>

        <div style={{ display:'flex', alignItems:'flex-start', gap:20, flexWrap:'wrap' }}>
          <div style={{ position:'relative', flexShrink:0 }}>
            <Avatar user={profile} size={76}/>
            {isOwn && editing && (
              <div style={{ position:'absolute', bottom:-2, right:-2, width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid var(--bg)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
              </div>
            )}
          </div>

          <div style={{ flex:1, minWidth:220 }}>
            {!editing ? (
              <>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap', marginBottom:4 }}>
                  <div>
                    <h1 style={{ fontWeight:800, fontSize:22, color:'var(--t1)', margin:0, letterSpacing:'-0.4px' }}>{profile?.name}</h1>
                    <p style={{ color:'var(--t3)', fontSize:13, margin:'3px 0 0' }}>{profile?.email}</p>
                  </div>
                  {isOwn && (
                    <button className="btn btn-ghost" style={{ padding:'6px 16px', fontSize:13, flexShrink:0 }} onClick={() => setEditing(true)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit profile
                    </button>
                  )}
                </div>

                {profile?.bio
                  ? <p style={{ color:'var(--t2)', fontSize:14, marginTop:10, lineHeight:1.65 }}>{profile.bio}</p>
                  : isOwn && <p style={{ color:'var(--t3)', fontSize:13, marginTop:8, fontStyle:'italic' }}>No bio yet — click Edit to add one</p>
                }

                <div style={{ display:'flex', flexWrap:'wrap', gap:18, marginTop:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span style={{ fontSize:13, color:'var(--t3)' }}>Joined {profile?.created_at ? joinDate(profile.created_at) : '—'}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                    <span style={{ fontSize:13, color:'var(--t2)' }}>
                      <strong style={{ color:'var(--accent2)', fontWeight:700 }}>{posts.length}</strong> posts
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <div>
                  <label className="form-label">Display name</label>
                  <input className="input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} maxLength={100}/>
                </div>
                <div>
                  <label className="form-label">Bio</label>
                  <textarea className="input" value={form.bio} onChange={e => setForm(f=>({...f,bio:e.target.value}))} rows={3} maxLength={300} style={{ resize:'none' }} placeholder="Tell the community about yourself…"/>
                  <p style={{ fontSize:11, color:'var(--t3)', textAlign:'right', marginTop:3 }}>{form.bio.length}/300</p>
                </div>
                <div>
                  <label className="form-label">Avatar URL</label>
                  <input className="input" value={form.avatar_url} onChange={e => setForm(f=>({...f,avatar_url:e.target.value}))} placeholder="https://example.com/photo.jpg" type="url"/>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button className="btn btn-primary" style={{ height:36, padding:'0 18px', fontSize:13 }} onClick={save} disabled={saving}>
                    {saving ? <><Spinner size={14} color="#fff"/> Saving…</> : <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Save changes
                    </>}
                  </button>
                  <button className="btn btn-ghost" style={{ height:36, padding:'0 14px', fontSize:13 }} onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts section */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, paddingLeft:2 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span style={{ fontSize:12, fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'0.07em' }}>
          {isOwn ? 'Your posts' : `Posts by ${profile?.name?.split(' ')[0]}`}
        </span>
        <span className="badge">{posts.length}</span>
      </div>

      {posts.length === 0 ? (
        <div className="card" style={{ padding:52, textAlign:'center' }}>
          <p style={{ fontSize:36, marginBottom:10 }}>📝</p>
          <p style={{ color:'var(--t2)', fontWeight:600, marginBottom:4 }}>
            {isOwn ? "You haven't posted yet" : 'No posts yet'}
          </p>
          {isOwn && <p style={{ color:'var(--t3)', fontSize:13 }}>Share what you're building with the community!</p>}
        </div>
      ) : (
        posts.map(post => (
          <div key={post.id} style={{ marginBottom:16 }}>
            <PostCard post={post} onDelete={isOwn ? id => setPosts(p => p.filter(x => x.id !== id)) : undefined}/>
          </div>
        ))
      )}
    </div>
  )
}
