import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '../../lib/utils'
import { Building2, ChevronDown, Plus } from 'lucide-react'

interface Org {
  orgId: string
  role: string
  orgName: string
}

export default function OrgSwitcher({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [orgs, setOrgs] = useState<Org[]>([])
  const [currentOrg, setCurrentOrg] = useState<Org | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/organizations/user-orgs')
      .then(r => r.json())
      .then((data: Org[]) => {
        setOrgs(data)
        if (data.length > 0) setCurrentOrg(data[0])
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function switchOrg(org: Org) {
    document.cookie = `cashaflux_org=${org.orgId}; path=/; max-age=31536000; SameSite=Lax`
    setCurrentOrg(org)
    setOpen(false)
    queryClient.invalidateQueries()
    navigate('/dashboard', { replace: true })
  }

  if (collapsed) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center w-full py-2 px-2 text-white/50 hover:text-white transition-colors"
          title={currentOrg?.orgName ?? 'Organizations'}
        >
          <Building2 className="w-5 h-5" />
        </button>
        {open && (
          <div className="absolute bottom-full left-2 mb-1 w-48 rounded-lg bg-white shadow-xl border border-border/50 overflow-hidden z-50">
            {orgs.map((org) => (
              <button
                key={org.orgId}
                onClick={() => switchOrg(org)}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-left text-sm transition-colors',
                  org.orgId === currentOrg?.orgId
                    ? 'bg-brand-navy text-white'
                    : 'text-brand-navy hover:bg-surface'
                )}
              >
                <span className="w-6 h-6 rounded-md bg-brand-navy/10 flex items-center justify-center text-xs font-bold shrink-0">
                  {org.orgName[0]?.toUpperCase() ?? '?'}
                </span>
                <span className="truncate flex-1">{org.orgName}</span>
                {org.role === 'owner' && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-navy/50">Owner</span>
                )}
              </button>
            ))}
            <div className="border-t border-border/50">
              <button
                onClick={() => { setOpen(false); navigate('/onboarding') }}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-brand-navy hover:bg-surface transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create an organization
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors text-sm"
      >
        <Building2 className="w-4 h-4 shrink-0" />
        <span className="truncate flex-1 text-left">{currentOrg?.orgName ?? 'Select organization'}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg bg-white shadow-xl border border-border/50 overflow-hidden z-50">
          {orgs.map((org) => (
            <button
              key={org.orgId}
              onClick={() => switchOrg(org)}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2.5 text-left text-sm transition-colors',
                org.orgId === currentOrg?.orgId
                  ? 'bg-brand-navy text-white'
                  : 'text-brand-navy hover:bg-surface'
              )}
            >
              <span className="w-6 h-6 rounded-md bg-brand-navy/10 flex items-center justify-center text-xs font-bold shrink-0">
                {org.orgName[0]?.toUpperCase() ?? '?'}
              </span>
              <span className="truncate flex-1">{org.orgName}</span>
              {org.role === 'owner' ? (
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-navy/50">Owner</span>
              ) : (
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-navy/50">{org.role}</span>
              )}
            </button>
          ))}
          <div className="border-t border-border/50">
            <button
              onClick={() => { setOpen(false); navigate('/onboarding') }}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-left text-sm text-brand-navy hover:bg-surface transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create an organization
            </button>
          </div>
        </div>
      )}
    </div>
  )
}