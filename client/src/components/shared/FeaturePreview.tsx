interface FeaturePreviewProps {
  label?: string
  screenshotSrc?: string
  screenshotAlt?: string
}

export default function FeaturePreview({
  label = 'Dashboard',
  screenshotSrc,
  screenshotAlt = 'Product screenshot',
}: FeaturePreviewProps) {
  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-xl shadow-brand-navy/5 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-danger" />
          <div className="w-3 h-3 rounded-full bg-warning" />
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs text-text-muted ml-2 font-mono">{label}</span>
        </div>
        <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border/50">
          {screenshotSrc ? (
            <img
              src={screenshotSrc}
              alt={screenshotAlt}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-navy/5 to-brand-navy/5 flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl font-bold text-brand-navy/20 font-mono block mb-2">C</span>
                <span className="text-xs text-text-muted font-mono">{label}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}