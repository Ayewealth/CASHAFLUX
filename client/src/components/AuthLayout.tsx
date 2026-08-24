import { type ReactNode, type FC } from 'react'
import { Link } from 'react-router'
import Logo from '../components/shared/Logo'

interface BrandContent {
  headline: string
  body: string
  badges: string[]
}

interface AuthLayoutProps {
  heading: string
  subheading: string
  brandContent: BrandContent
  backLink?: {
    to: string
    label: string
  }
  children: ReactNode
}

export const AuthLayout: FC<AuthLayoutProps> = ({
  heading,
  subheading,
  brandContent,
  backLink,
  children,
}) => {
  return (
    <div className="min-h-[100dvh] flex bg-bg text-text">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-primary overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-between p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Logo showWordmark={false} light iconBg />
            <span className="text-white font-semibold text-lg tracking-tight">Cashaflux</span>
          </div>

          {/* Value proposition */}
          <div className="max-w-md">
            <h2 className="text-3xl xl:text-4xl font-semibold text-white leading-[1.15] tracking-tight mb-5">
              {brandContent.headline}
            </h2>
            <p className="text-base text-white/60 leading-relaxed max-w-[52ch]">
              {brandContent.body}
            </p>
          </div>

          {/* Trust signals */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-white/50">
              {brandContent.badges.map((badge, i) => (
                <span key={badge} className="flex items-center gap-3">
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-white/30" />}
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 pointer-events-none" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          {/* Desktop back link */}
          {backLink && (
            <Link
              to={backLink.to}
              className="hidden lg:inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mb-6"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 rotate-180">
                <path d="M9 18l6-6-6-6" />
              </svg>
              {backLink.label}
            </Link>
          )}

          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">{heading}</h1>
            <p className="text-text-muted text-sm">{subheading}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}