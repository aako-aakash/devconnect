// ── Date helpers ──────────────────────────────────────────────────────────────
export function timeAgo(dateStr) {
  const s = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (s < 60)    return 'just now'
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  if (s < 604800) return `${Math.floor(s/86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month:'short', day:'numeric' })
}

export function joinDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month:'long', year:'numeric' })
}

// ── Avatar ────────────────────────────────────────────────────────────────────
const PALETTES = [
  ['#6366f1','#4f46e5'], ['#8b5cf6','#7c3aed'], ['#06b6d4','#0891b2'],
  ['#10b981','#059669'], ['#f59e0b','#d97706'], ['#ef4444','#dc2626'],
  ['#ec4899','#db2777'],
]
function palette(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return PALETTES[h % PALETTES.length]
}

export function Avatar({ user, size = 38 }) {
  const initials = (user?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const [c1, c2] = palette(user?.name)
  const s = { width: size, height: size, fontSize: size * 0.36, borderRadius: '50%', flexShrink: 0 }

  if (user?.avatar_url) {
    return (
      <img src={user.avatar_url} alt={user.name}
        style={{ ...s, objectFit:'cover', border:'2px solid rgba(99,102,241,0.2)' }}
        onError={e => { e.target.style.display = 'none' }}
        className="avatar"
      />
    )
  }
  return (
    <div className="avatar" style={{
      ...s,
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontWeight:700, color:'#fff',
      boxShadow:`0 2px 8px ${c1}50`,
    }}>
      {initials}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = '#6366f1' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      className="spin" style={{ display:'block', flexShrink:0 }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity=".15" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card" style={{ padding:20 }}>
      <div style={{ display:'flex', gap:12, marginBottom:14 }}>
        <div className="skeleton" style={{ width:42, height:42, borderRadius:'50%', flexShrink:0 }}/>
        <div style={{ flex:1 }}>
          <div className="skeleton" style={{ height:13, width:'38%', marginBottom:8 }}/>
          <div className="skeleton" style={{ height:11, width:'22%' }}/>
        </div>
      </div>
      <div className="skeleton" style={{ height:13, marginBottom:8 }}/>
      <div className="skeleton" style={{ height:13, width:'85%', marginBottom:8 }}/>
      <div className="skeleton" style={{ height:13, width:'60%', marginBottom:14 }}/>
      <div style={{ display:'flex', gap:8, paddingTop:12, borderTop:'1px solid rgba(99,102,241,0.08)' }}>
        <div className="skeleton" style={{ height:28, width:68, borderRadius:9 }}/>
        <div className="skeleton" style={{ height:28, width:80, borderRadius:9 }}/>
      </div>
    </div>
  )
}
