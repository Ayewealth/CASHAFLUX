import { Link } from 'react-router'
import NewsletterForm from '../shared/NewsletterForm'
import StatCounter from '../shared/StatCounter'
import SmoothScrollReveal from '../shared/SmoothScrollReveal'
import Logo from '../shared/Logo'

const FOOTER_LINKS: Record<string, { label: string; href: string; disabled?: boolean }[]> = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'How it works', href: '/how-it-works' },
    { label: 'Blog', href: '/blog' },
  ],
  Support: [
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '#', disabled: true },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-brand-navy-dark text-white">
      {/* Top tier — brand area + stat + newsletter */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 lg:pt-20 pb-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-12 pb-12 border-b border-white/10">
          <div>
            <Logo />
            <p className="text-sm text-white/50 leading-relaxed max-w-sm mb-6">
              Simple, fast accounting for American small businesses. Invoicing, expenses, and
              tax-ready reports — all in one place.
            </p>
            <SmoothScrollReveal>
              <div className="flex gap-6">
                <StatCounter value={10000} suffix="+" label="Active businesses" />
                <StatCounter value={500} suffix="K+" label="Invoices processed" />
              </div>
            </SmoothScrollReveal>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-3">Get weekly tips</h4>
            <p className="text-xs text-white/40 mb-4 max-w-xs">
              Accounting insights, tax deadline reminders, and product updates.
            </p>
            <NewsletterForm
              placeholder="your@email.com"
              buttonText="Subscribe"
              className="max-w-sm"
            />
          </div>
        </div>
      </div>

      {/* Bottom tier — link columns */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-12 lg:pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white/80 mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.disabled ? (
                      <span className="text-sm text-white/30 cursor-not-allowed">{link.label}</span>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Cashaflux. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-white/40 hover:text-white transition-colors text-sm"
              aria-label="Twitter"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-white/40 hover:text-white transition-colors text-sm"
              aria-label="LinkedIn"
            >
              LinkedIn
            </a>
            <a
              href="#"
              className="text-white/40 hover:text-white transition-colors text-sm"
              aria-label="GitHub"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}