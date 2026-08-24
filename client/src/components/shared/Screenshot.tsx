interface ScreenshotProps {
  fallback: string
  src?: string
  alt: string
  className?: string
}

export default function Screenshot({ fallback, src, alt, className = '' }: ScreenshotProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover rounded-2xl ${className}`}
      />
    )
  }

  return (
    <div
      className={`w-full h-full rounded-2xl bg-gradient-to-br from-brand-navy/5 to-brand-navy/5 border border-border/50 flex items-center justify-center ${className}`}
    >
      <div className="text-center p-4">
        <span className="text-3xl font-bold text-brand-navy/20 font-mono block mb-2">C</span>
        <span className="text-xs text-text-muted font-mono block">{fallback}</span>
        <span className="text-[10px] text-text-muted/50 font-mono mt-1 block">
          Add screenshot at /screenshots/
        </span>
      </div>
    </div>
  )
}