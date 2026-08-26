import { Link, useNavigate } from 'react-router'
import { useEffect } from 'react'
import { motion, useReducedMotion, useScroll } from 'motion/react'
import { Menu, X, LayoutDashboard, LogOut, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useSubscriptionStatus } from '@/features/subscription/hooks'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Logo from '@/components/shared/Logo'

const NAV_ITEMS = [
  { label: 'Features', href: '/features' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

function UserMenu({ user, initials, plan, menuOpen, onMenuOpenChange }: {
  user: { name?: string | null; email?: string | null } | undefined
  initials: string
  plan?: string | null
  menuOpen: boolean
  onMenuOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()

  async function handleSignOut() {
    await authClient.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <Popover open={menuOpen} onOpenChange={onMenuOpenChange}>
      <PopoverTrigger className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
          {initials}
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        <div className="px-3 py-2 border-b border-border mb-1">
          <p className="text-sm font-medium text-text">{user?.name}</p>
          <p className="text-xs text-text-muted truncate">{user?.email}</p>
        </div>
        <button
          onClick={() => { navigate('/dashboard'); onMenuOpenChange(false) }}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-text hover:bg-muted transition-colors"
        >
          <LayoutDashboard className="h-4 w-4 text-text-muted" />
          Dashboard
        </button>
        {plan && plan !== 'business' && (
          <button
            onClick={() => { navigate('/pricing'); onMenuOpenChange(false) }}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-text hover:bg-muted transition-colors"
          >
            <Sparkles className="h-4 w-4 text-text-muted" />
            Upgrade plan
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </PopoverContent>
    </Popover>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const { data: session } = authClient.useSession()
  const { data: subscription } = useSubscriptionStatus()

  const user = session?.user
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (v) => setScrolled(v > 20))
    return () => unsubscribe()
  }, [scrollY])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          <Logo />

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium text-text-muted hover:text-brand-navy dark:hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <UserMenu
                user={user}
                initials={initials}
                plan={subscription?.plan}
                menuOpen={menuOpen}
                onMenuOpenChange={setMenuOpen}
              />
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-text-muted hover:text-brand-navy dark:hover:text-white transition-colors px-4 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-white bg-brand-navy hover:bg-brand-navy-light px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-brand-navy/20 active:scale-[0.98]"
                >
                  Start free
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-text-muted hover:text-text"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden border-t border-border/50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl"
        >
          <nav className="px-6 py-4 space-y-1">
            {NAV_ITEMS.map((item, i) => (
              <motion.div
                key={item.href}
                initial={reduce ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.2 }}
              >
                <Link
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-text-muted hover:text-brand-navy dark:hover:text-white hover:bg-surface dark:hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            <div className="pt-3 space-y-2 border-t border-border/50 mt-3">
              {session ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-text-muted hover:text-brand-navy dark:hover:text-white rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  {subscription?.plan && subscription.plan !== 'business' && (
                    <Link
                      to="/pricing"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-text-muted hover:text-brand-navy dark:hover:text-white rounded-xl transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      Upgrade plan
                    </Link>
                  )}
                  <button
                    onClick={async () => { await authClient.signOut(); window.location.href = '/login' }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-danger hover:bg-danger/5 rounded-xl transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-center text-text-muted hover:text-brand-navy dark:hover:text-white rounded-xl transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold text-center text-white bg-brand-navy rounded-xl"
                  >
                    Start free
                  </Link>
                </>
              )}
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  )
}