// ── Date helper — no external dep ────────────────────────────────────────────
export function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff/86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month:'short', day:'numeric' })
}

export function joinDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month:'long', year:'numeric' })
}

// ── Avatar ────────────────────────────────────────────────────────────────────
const COLORS = [
  '#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899',
]
function colorFor(name='') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return COLORS[h % COLORS.length]
}

export function Avatar({ user, size = 36 }) {
  const initials = (user?.name || '?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  const s = { width: size, height: size, fontSize: size * 0.38 }

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name}
        style={s}
        className="avatar"
        onError={e => { e.target.style.display='none' }}
      />
    )
  }
  return (
    <div className="avatar" style={{ ...s, background: colorFor(user?.name) }}>
      {initials}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = '#6366f1' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      className="spin" style={{ display:'block' }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity=".25" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display:'flex', gap:12, marginBottom:14 }}>
        <div className="skeleton" style={{ width:40, height:40, borderRadius:'50%', flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div className="skeleton" style={{ height:14, width:'35%', marginBottom:6 }} />
          <div className="skeleton" style={{ height:12, width:'20%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height:14, marginBottom:8 }} />
      <div className="skeleton" style={{ height:14, width:'80%', marginBottom:8 }} />
      <div className="skeleton" style={{ height:14, width:'60%' }} />
    </div>
  )
}
