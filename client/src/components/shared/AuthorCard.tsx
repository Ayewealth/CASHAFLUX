interface AuthorCardProps {
  name: string
  role?: string
  avatar?: string
  className?: string
}

export default function AuthorCard({ name, role = 'Author', avatar, className = '' }: AuthorCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border/50 ${className}`}>
      {avatar ? (
        <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-brand-blue-light text-brand-navy font-bold text-sm flex items-center justify-center shrink-0">
          {initials}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-brand-navy">{name}</p>
        <p className="text-xs text-text-muted">{role}</p>
      </div>
    </div>
  )
}