export default function Avatar({ user, size = 'md', className = '' }) {
  const sizes = {
    xs:  'h-6 w-6 text-xs',
    sm:  'h-8 w-8 text-sm',
    md:  'h-10 w-10 text-base',
    lg:  'h-12 w-12 text-lg',
    xl:  'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl',
  }
  const sz = sizes[size] || sizes.md
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name}
        className={`avatar ${sz} ${className}`}
      />
    )
  }

  // Deterministic color based on name
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
  ]
  const colorIdx = user?.name
    ? user.name.charCodeAt(0) % colors.length
    : 0

  return (
    <div className={`avatar-placeholder bg-gradient-to-br ${colors[colorIdx]} ${sz} ${className}`}>
      {initials}
    </div>
  )
}
