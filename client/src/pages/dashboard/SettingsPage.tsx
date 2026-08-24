import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Save, Upload, Eye, EyeOff, X, CheckCircle2, ChevronRight, ArrowUpRight, CreditCard, Clock, Shield, Sparkles, Circle, AlertCircle, FlaskConical } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { ThemeToggle } from '../../components/dashboard/ThemeToggle'
import { useDemoStatus, useToggleDemo } from '../../features/demo/hooks'
import { useSettings, useUpdateSettings } from '../../features/settings/hooks'
import { useSubscriptionStatus, usePlans, useCreateCheckout, useBillingPortal, useInvoiceHistory } from '../../features/subscription/hooks'
import { toast } from '../../components/ui/toast'
import { cn } from '../../lib/utils'
import { authClient } from '../../lib/auth-client'
import SettingsSidebar from '../../components/dashboard/SettingsSidebar'

const TABS = [
  { id: 'business', label: 'Business Profile' },
  { id: 'invoice-defaults', label: 'Invoice Defaults' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'billing', label: 'Subscription & Billing' },
  { id: 'security', label: 'Security' },
  { id: 'data', label: 'Data & Privacy' },
  { id: 'demo', label: 'Demo Mode' },
  { id: 'display', label: 'Display' },
]

type TabId = (typeof TABS)[number]['id']

const INDUSTRIES = [
  'Accounting', 'Advertising', 'Agriculture', 'Architecture', 'Automotive',
  'Biotechnology', 'Construction', 'Consulting', 'Education', 'Energy',
  'Engineering', 'Entertainment', 'Finance', 'Food & Beverage', 'Government',
  'Healthcare', 'Hospitality', 'Information Technology', 'Insurance', 'Legal',
  'Manufacturing', 'Marketing', 'Media', 'Nonprofit', 'Real Estate',
  'Retail', 'Science', 'Telecommunications', 'Transportation', 'Utilities',
  'Wholesale',
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<TabId>((tabParam as TabId) || 'business')
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()
  const session = authClient.useSession()
  const { data: subscription, isLoading: subLoading } = useSubscriptionStatus()
  const { data: plans } = usePlans()
  const { data: invoices, isLoading: invoicesLoading } = useInvoiceHistory()
  const checkoutMutation = useCreateCheckout()
  const portalMutation = useBillingPortal()
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')
  const [checkoutPending, setCheckoutPending] = useState(false)

  // Handle tab from URL
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) setActiveTab(tabParam as TabId)
  }, [tabParam])

  // Business profile
  const [name, setName] = useState('')
  const [type, setType] = useState<string>('')
  const [industry, setIndustry] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [ein, setEin] = useState('')
  const [fiscalYearStart, setFiscalYearStart] = useState('1')
  const [currency, setCurrency] = useState('USD')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)

  // Invoice defaults
  const [paymentTerms, setPaymentTerms] = useState('30')
  const [invoicePrefix, setInvoicePrefix] = useState('INV-')
  const [footerNotes, setFooterNotes] = useState('')

  // Notifications
  const [notifyInvoicePaid, setNotifyInvoicePaid] = useState(true)
  const [notifyInvoiceOverdue, setNotifyInvoiceOverdue] = useState(true)
  const [notifyTeamJoin, setNotifyTeamJoin] = useState(true)
  const [notifyTrialExpiring, setNotifyTrialExpiring] = useState(true)

  // Security
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { data: demoStatus } = useDemoStatus()
  const toggleDemo = useToggleDemo()

  function loadSettings() {
    if (!settings) return
    setName(settings.name ?? '')
    setType((settings.type ?? '') as string)
    setIndustry(settings.industry ?? '')
    setAddressLine1(settings.addressLine1 ?? '')
    setAddressLine2(settings.addressLine2 ?? '')
    setCity(settings.city ?? '')
    setState(settings.state ?? '')
    setZip(settings.zip ?? '')
    setPhone(settings.phone ?? '')
    setWebsite(settings.website ?? '')
    setEin(settings.ein ?? '')
    setFiscalYearStart(String(settings.fiscalYearStart ?? 1))
    setCurrency(settings.currency ?? 'USD')
    if (settings.logoR2Key) setLogoPreview(`/api/uploads/${settings.logoR2Key}`)

    // Restore invoice defaults stored as JSON
    const defaults = settings.invoiceDefaults ? (typeof settings.invoiceDefaults === 'string' ? JSON.parse(settings.invoiceDefaults as string) : settings.invoiceDefaults as Record<string, string>) : {}
    setPaymentTerms(defaults.paymentTerms ?? '30')
    setInvoicePrefix(defaults.invoicePrefix ?? 'INV-')
    setFooterNotes(defaults.footerNotes ?? '')

    // Restore notification preferences stored as JSON
    const prefs = settings.notificationPreferences ? (typeof settings.notificationPreferences === 'string' ? JSON.parse(settings.notificationPreferences as string) : settings.notificationPreferences as Record<string, boolean>) : {}
    setNotifyInvoicePaid(prefs.invoicePaid ?? true)
    setNotifyInvoiceOverdue(prefs.invoiceOverdue ?? true)
    setNotifyTeamJoin(prefs.teamJoin ?? true)
    setNotifyTrialExpiring(prefs.trialExpiring ?? true)
  }

  useEffect(() => {
    if (settings) loadSettings()
  }, [settings])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleRemoveLogo() {
    setLogoFile(null)
    setLogoPreview(settings?.logoR2Key ? `/api/uploads/${settings.logoR2Key}` : null)
  }

  async function uploadLogo(orgId: string): Promise<string | null> {
    if (!logoFile) return settings?.logoR2Key ?? null
    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', logoFile)
      formData.append('orgId', orgId)
      const res = await fetch('/api/uploads/logo', { method: 'POST', body: formData })
      const data = await res.json()
      return data.key ?? null
    } catch { return null }
    finally { setLogoUploading(false) }
  }

  async function handleSaveBusiness() {
    const orgId = settings?.id
    if (!orgId) return
    const logoR2Key = await uploadLogo(orgId)
    await updateSettings.mutateAsync({
      name, type: type || null, industry: industry || null,
      addressLine1: addressLine1 || null, addressLine2: addressLine2 || null,
      city: city || null, state: state || null, zip: zip || null,
      phone: phone || null, website: website || null, ein: ein || null,
      fiscalYearStart: parseInt(fiscalYearStart), currency,
      logoR2Key,
    } as any)
    toast.add({ title: 'Settings saved', type: 'success' })
  }

  async function handleSaveDefaults() {
    await updateSettings.mutateAsync({
      invoiceDefaults: JSON.stringify({ paymentTerms, invoicePrefix, footerNotes }),
    } as any)
    toast.add({ title: 'Defaults saved', type: 'success' })
  }

  async function handleSaveNotifications() {
    await updateSettings.mutateAsync({
      notificationPreferences: JSON.stringify({
        invoicePaid: notifyInvoicePaid,
        invoiceOverdue: notifyInvoiceOverdue,
        teamJoin: notifyTeamJoin,
        trialExpiring: notifyTrialExpiring,
      }),
    } as any)
    toast.add({ title: 'Preferences saved', type: 'success' })
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) { toast.add({ title: 'Both passwords required', type: 'error' }); return }
    try {
      await fetch('/api/settings/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) })
      toast.add({ title: 'Password changed', type: 'success' })
      setCurrentPassword(''); setNewPassword('')
    } catch { toast.add({ title: 'Failed to change password', type: 'error' }) }
  }

  async function handleExport() {
    try {
      const res = await fetch('/api/settings/export')
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'cashaflux-export.json'; a.click()
      URL.revokeObjectURL(url)
      toast.add({ title: 'Data exported', type: 'success' })
    } catch { toast.add({ title: 'Failed to export data', type: 'error' }) }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return
    try {
      await fetch('/api/settings/delete-account', { method: 'POST' })
      toast.add({ title: 'Account deleted', type: 'success' })
      navigate('/')
    } catch { toast.add({ title: 'Failed to delete account', type: 'error' }) }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-text tracking-tight">Settings</h1><p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p></div>

      <div className="flex gap-8">
        <SettingsSidebar activeTab={activeTab} onTabChange={(id) => { setActiveTab(id as TabId); setSearchParams({ tab: id }) }} className="hidden lg:block" />

        {/* Mobile tab pills */}
        <div className="flex lg:hidden gap-1 overflow-x-auto pb-2 w-full">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchParams({ tab: tab.id }) }}
              className={cn('shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors', activeTab === tab.id ? 'bg-brand-navy/5 text-brand-navy' : 'text-muted-foreground hover:text-text')}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">

      {isLoading ? <Skeleton className="h-64 w-full" /> : (
        <>
          {/* Business Profile */}
          {activeTab === 'business' && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold text-text">Business Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {/* Logo */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Business Logo</label>
                  {logoPreview ? (
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
                      <img src={logoPreview} alt="Logo preview" className="h-16 w-16 rounded-lg object-cover border border-border" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">{logoFile?.name ?? 'Current logo'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG or WebP</p>
                      </div>
                      <div className="flex gap-2">
                        <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-accent">
                          <Upload className="h-4 w-4" />
                          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />
                        </label>
                        <button onClick={handleRemoveLogo} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-danger">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors bg-surface">
                      <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-sm text-muted-foreground">Upload logo</span>
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-sm font-medium">Business name</label><Input value={name} onChange={(e) => setName(e.target.value)} className="h-10" /></div>
                  <div className="space-y-1.5"><label className="text-sm font-medium">Business type</label><Select value={type} onValueChange={(v) => v && setType(v)}><SelectTrigger className="h-10"><span>{type.replace(/_/g, ' ') || 'Select...'}</span></SelectTrigger><SelectContent><SelectItem value="sole_proprietor">Sole Proprietor</SelectItem><SelectItem value="llc">LLC</SelectItem><SelectItem value="s_corp">S-Corp</SelectItem><SelectItem value="c_corp">C-Corp</SelectItem><SelectItem value="partnership">Partnership</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-sm font-medium">Industry</label><Select value={industry} onValueChange={(v) => v && setIndustry(v)}><SelectTrigger className="h-10"><span>{industry || 'Select...'}</span></SelectTrigger><SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1.5"><label className="text-sm font-medium">Currency</label><Select value={currency} onValueChange={(v) => v && setCurrency(v)}><SelectTrigger className="h-10"><span>{currency}</span></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="CAD">CAD</SelectItem><SelectItem value="AUD">AUD</SelectItem></SelectContent></Select></div>
                </div>
                <div className="space-y-1.5"><label className="text-sm font-medium">Address</label><Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Street address" className="h-10" /></div>
                <div className="space-y-1.5"><label className="text-sm font-medium">Address line 2</label><Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Apt, suite, unit (optional)" className="h-10" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5"><label className="text-sm font-medium">City</label><Input value={city} onChange={(e) => setCity(e.target.value)} className="h-10" /></div>
                  <div className="space-y-1.5"><label className="text-sm font-medium">State</label><Input value={state} onChange={(e) => setState(e.target.value)} className="h-10" /></div>
                  <div className="space-y-1.5"><label className="text-sm font-medium">ZIP</label><Input value={zip} onChange={(e) => setZip(e.target.value)} className="h-10" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-sm font-medium">Phone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10" /></div>
                  <div className="space-y-1.5"><label className="text-sm font-medium">Website</label><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className="h-10" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-sm font-medium">Tax ID (EIN)</label><Input value={ein} onChange={(e) => setEin(e.target.value)} className="h-10" /></div>
                  <div className="space-y-1.5"><label className="text-sm font-medium">Fiscal year starts</label><Select value={fiscalYearStart} onValueChange={(v) => { if (v) setFiscalYearStart(v) }}><SelectTrigger className="h-10"><span>Month {fiscalYearStart}</span></SelectTrigger><SelectContent>{Array.from({ length: 12 }).map((_, i) => <SelectItem key={i + 1} value={String(i + 1)}>Month {i + 1}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <Button className="gap-1.5" onClick={handleSaveBusiness} disabled={updateSettings.isPending || logoUploading}><Save className="h-4 w-4" /> {logoUploading ? 'Uploading...' : 'Save Changes'}</Button>
              </CardContent>
            </Card>
          )}

          {/* Invoice Defaults */}
          {activeTab === 'invoice-defaults' && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold text-text">Invoice Defaults</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-sm font-medium">Payment terms (days)</label><Select value={paymentTerms} onValueChange={(v) => { if (v) setPaymentTerms(v) }}><SelectTrigger className="h-10"><span>Net {paymentTerms === '0' ? 'Due on Receipt' : `Net ${paymentTerms}`}</span></SelectTrigger><SelectContent><SelectItem value="0">Due on Receipt</SelectItem><SelectItem value="7">Net 7</SelectItem><SelectItem value="15">Net 15</SelectItem><SelectItem value="30">Net 30</SelectItem><SelectItem value="60">Net 60</SelectItem></SelectContent></Select></div>
                  <div className="space-y-1.5"><label className="text-sm font-medium">Invoice number prefix</label><Input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} className="h-10" /></div>
                </div>
                <div className="space-y-1.5"><label className="text-sm font-medium">Default footer / payment notes</label><textarea rows={3} value={footerNotes} onChange={(e) => setFooterNotes(e.target.value)} placeholder="Thank you for your business." className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none" /></div>
                <Button className="gap-1.5" onClick={handleSaveDefaults} disabled={updateSettings.isPending}><Save className="h-4 w-4" /> Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold text-text">Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">Email me when...</p>
                <div className="space-y-4">
                  {[
                    { label: 'An invoice is paid', key: 'invoice-paid', value: notifyInvoicePaid, set: setNotifyInvoicePaid as (v: boolean) => void },
                    { label: 'An invoice is overdue', key: 'invoice-overdue', value: notifyInvoiceOverdue, set: setNotifyInvoiceOverdue as (v: boolean) => void },
                    { label: 'A new team member joins', key: 'team-join', value: notifyTeamJoin, set: setNotifyTeamJoin as (v: boolean) => void },
                    { label: 'My trial is expiring', key: 'trial-expiring', value: notifyTrialExpiring, set: setNotifyTrialExpiring as (v: boolean) => void },
                  ].map((n) => (
                    <div key={n.key} className="flex items-center justify-between py-2">
                      <span className="text-sm text-text">{n.label}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={n.value}
                        onClick={() => n.set(!n.value)}
                        className={cn(
                          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                          n.value ? 'bg-accent' : 'bg-muted'
                        )}
                      >
                        <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition duration-200', n.value ? 'translate-x-4' : 'translate-x-0.5')} />
                      </button>
                    </div>
                  ))}
                </div>
                <Button className="gap-1.5" onClick={handleSaveNotifications} disabled={updateSettings.isPending}><Save className="h-4 w-4" /> Save Preferences</Button>
              </CardContent>
            </Card>
          )}

          {/* Subscription & Billing */}
          {activeTab === 'billing' && (
            <div className="space-y-8">
              {checkoutPending ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
                      <Sparkles className="w-5 h-5 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-base font-medium text-text">Confirming your subscription...</p>
                    <p className="text-sm text-muted-foreground">You&apos;ll be redirected in just a moment.</p>
                  </CardContent>
                </Card>
              ) : subLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-2xl" />
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-40 w-full rounded-2xl" />
                </div>
              ) : subscription ? (
                <>
                  {/* Current Plan Hero Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface to-surface/80 p-6 sm:p-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-navy/[0.03] rounded-full translate-y-1/2 -translate-x-1/2" />
                    <div className="relative">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h2 className="text-lg sm:text-xl font-bold text-text">
                              {subscription.plan === 'free' ? 'Free' : subscription.plan === 'pro' ? 'Pro' : 'Business'}
                            </h2>
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full',
                              subscription.status === 'active' && 'text-success bg-success/10',
                              subscription.status === 'past_due' && 'text-warning bg-warning/10',
                              subscription.status === 'canceled' && 'text-danger bg-danger/10',
                              subscription.plan === 'free' && 'text-muted-foreground bg-muted/50',
                            )}>
                              {subscription.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                              {subscription.status === 'past_due' && <AlertCircle className="w-3 h-3" />}
                              {subscription.status === 'canceled' && <X className="w-3 h-3" />}
                              {subscription.plan === 'free' ? 'Free Plan' : subscription.status}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1.5 mt-2">
                            <span className="text-3xl sm:text-4xl font-bold text-text tracking-tight">
                              {subscription.plan === 'free' ? '$0' : subscription.plan === 'pro' ? (subscription.interval === 'year' ? '$180' : '$19') : (subscription.interval === 'year' ? '$360' : '$39')}
                            </span>
                            {subscription.plan !== 'free' && (
                              <span className="text-sm text-muted-foreground">/{subscription.interval === 'year' ? 'yr' : 'mo'}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {subscription.plan !== 'free' && (
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => portalMutation.mutate()} disabled={portalMutation.isPending}>
                              <CreditCard className="w-3.5 h-3.5" />
                              Manage Billing
                            </Button>
                          )}
                          {(subscription.plan === 'free' || subscription.plan === 'pro') && (
                            <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => {
                              const targetPlan = subscription.plan === 'free' ? 'pro' : 'business'
                              checkoutMutation.mutate({
                                plan: targetPlan,
                                interval: billingInterval,
                                successUrl: `${window.location.origin}/dashboard/settings?tab=billing`,
                              })
                            }}>
                              <Sparkles className="w-3.5 h-3.5" />
                              {subscription.plan === 'free' ? 'Upgrade to Pro' : 'Upgrade to Business'}
                            </Button>
                          )}
                        </div>
                      </div>
                      {subscription.currentPeriodEnd && subscription.plan !== 'free' && (
                        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground bg-muted/30 rounded-xl px-4 py-3 border border-border/50">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>
                            {subscription.status === 'active' ? 'Renews' : 'Expired'}{' '}
                            {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'long', day: 'numeric',
                            })}
                            {' '}({Math.ceil((subscription.currentPeriodEnd * 1000 - Date.now()) / (1000 * 60 * 60 * 24))} days)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* What's Included */}
                  {subscription.plan !== 'free' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold text-text flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          What&apos;s Included in {subscription.plan === 'pro' ? 'Pro' : 'Business'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            'Unlimited clients',
                            'Bank sync & reconciliation',
                            'Recurring invoices',
                            'Advanced financial reports',
                            'Tax-ready exports',
                            'Priority email support',
                            ...(subscription.plan === 'business' ? [
                              'Team members (up to 5)',
                              'Payroll-ready exports',
                              'Dedicated account manager',
                              'Priority phone support',
                            ] : []),
                          ].map((feature) => (
                            <div key={feature} className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/50">
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                              </div>
                              <span className="text-sm text-text">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Plan Comparison */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-text">Compare Plans</CardTitle>
                      <div className="flex gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/50">
                        <button
                          onClick={() => setBillingInterval('monthly')}
                          className={cn('px-3.5 py-1.5 text-xs font-medium rounded-md transition-all', billingInterval === 'monthly' ? 'bg-accent text-white shadow-sm' : 'text-muted-foreground hover:text-text')}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setBillingInterval('annual')}
                          className={cn('px-3.5 py-1.5 text-xs font-medium rounded-md transition-all', billingInterval === 'annual' ? 'bg-accent text-white shadow-sm' : 'text-muted-foreground hover:text-text')}
                        >
                          Annual <span className="text-[10px] opacity-80">Save 20%</span>
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          {
                            id: 'free', name: 'Free', price: 0,
                            features: ['Up to 5 clients', 'Core invoicing', 'Expense tracking', 'Basic reports', 'Mileage tracking'],
                            popular: false,
                          },
                          {
                            id: 'pro', name: 'Pro',
                            monthlyPrice: 19, annualPrice: 180,
                            features: ['Unlimited clients', 'Bank sync & reconciliation', 'Recurring invoices', 'Advanced reports', 'Priority email support'],
                            popular: true,
                          },
                          {
                            id: 'business', name: 'Business',
                            monthlyPrice: 39, annualPrice: 360,
                            features: ['Everything in Pro', 'Team members (up to 5)', 'Payroll-ready exports', 'Dedicated account manager', 'Priority phone support'],
                            popular: false,
                          },
                        ].map((plan) => {
                          const isCurrent = subscription.plan === plan.id
                          const price = 'monthlyPrice' in plan
                            ? (billingInterval === 'annual' ? plan.annualPrice : plan.monthlyPrice)
                            : plan.price
                          return (
                            <div
                              key={plan.id}
                              className={cn(
                                'relative flex flex-col rounded-xl border-2 p-5 transition-all',
                                isCurrent ? 'border-accent bg-accent/[0.03] shadow-sm' : 'border-border bg-surface hover:border-accent/30',
                              )}
                            >
                              {plan.popular && !isCurrent && (
                                <span className="absolute -top-2.5 left-4 inline-flex px-2.5 py-0.5 text-[10px] font-semibold text-white bg-accent rounded-full">Most popular</span>
                              )}
                              {isCurrent && (
                                <span className="absolute -top-2.5 right-4 inline-flex px-2.5 py-0.5 text-[10px] font-semibold text-white bg-success rounded-full">Current</span>
                              )}
                              <div className="mb-3">
                                <h3 className="text-base font-bold text-text">{plan.name}</h3>
                              </div>
                              <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-2xl font-bold text-text tracking-tight">
                                  {'monthlyPrice' in plan
                                    ? (billingInterval === 'annual'
                                      ? `$${plan.annualPrice}`
                                      : `$${plan.monthlyPrice}`)
                                    : '$0'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {'monthlyPrice' in plan ? (billingInterval === 'annual' ? '/yr' : '/mo') : ''}
                                </span>
                              </div>
                              {'monthlyPrice' in plan && billingInterval === 'annual' && (
                                <p className="text-[11px] text-success font-medium mb-3">
                                  ${plan.monthlyPrice}/mo when paid monthly
                                </p>
                              )}
                              <ul className="space-y-2 mb-5 flex-1">
                                {plan.features.map((f) => (
                                  <li key={f} className="text-xs text-muted-foreground flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                              {!isCurrent && plan.id !== 'free' && (
                                <Button
                                  size="sm"
                                  variant={subscription.plan === 'free' ? 'default' : 'outline'}
                                  className={cn('gap-1.5 w-full', subscription.plan === 'free' && 'shadow-sm')}
                                  onClick={() => {
                                    checkoutMutation.mutate({
                                      plan: plan.id,
                                      interval: billingInterval,
                                      successUrl: `${window.location.origin}/dashboard/settings?tab=billing`,
                                    })
                                  }}
                                  disabled={checkoutMutation.isPending}
                                >
                                  {plan.id === 'pro' ? 'Upgrade to Pro' : 'Upgrade to Business'}
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              {isCurrent && (
                                <Button variant="outline" size="sm" className="w-full gap-1.5" disabled>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                                  Current Plan
                                </Button>
                              )}
                              {plan.id === 'free' && !isCurrent && subscription.plan !== 'free' && (
                                <Button variant="outline" size="sm" className="w-full" disabled>
                                  Downgrade in Stripe Portal
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Invoice History */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-text flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        Invoice History
                      </CardTitle>
                      {subscription.customerId && (
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => portalMutation.mutate()} disabled={portalMutation.isPending}>
                          View All in Stripe
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      {invoicesLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                        </div>
                      ) : invoices && invoices.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice</th>
                                <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                                <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Receipt</th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoices.slice(0, 10).map((inv) => (
                                <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                  <td className="py-3 px-2">
                                    <span className="text-text font-medium">{inv.number || '—'}</span>
                                  </td>
                                  <td className="py-3 px-2 text-muted-foreground">
                                    {new Date(inv.created * 1000).toLocaleDateString('en-US', {
                                      year: 'numeric', month: 'short', day: 'numeric',
                                    })}
                                  </td>
                                  <td className="py-3 px-2 text-right text-text font-medium">
                                    ${(inv.amountPaid / 100).toFixed(2)}
                                  </td>
                                  <td className="py-3 px-2 text-right">
                                    <span className={cn(
                                      'inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full',
                                      inv.status === 'paid' && 'text-success bg-success/10',
                                      inv.status === 'open' && 'text-warning bg-warning/10',
                                      inv.status === 'void' && 'text-muted-foreground bg-muted/50',
                                      inv.status === 'uncollectible' && 'text-danger bg-danger/10',
                                    )}>
                                      {inv.status === 'paid' ? 'Paid' : inv.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2 text-right">
                                    {inv.pdf ? (
                                      <a href={inv.pdf} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors font-medium">
                                        PDF
                                        <ArrowUpRight className="w-3 h-3" />
                                      </a>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                            <CreditCard className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">No invoices yet</p>
                          {subscription.plan === 'free' && (
                            <p className="text-xs text-muted-foreground mt-1">Invoices will appear once you upgrade to a paid plan.</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold text-text">Security</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-text">Change Password</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-sm font-medium">Current password</label><div className="relative"><Input type={showPw ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="h-10 pr-10" /><button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                    <div className="space-y-1.5"><label className="text-sm font-medium">New password</label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-10" /></div>
                  </div>
                  <Button size="sm" onClick={handleChangePassword} disabled={!currentPassword || !newPassword}>Change Password</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data & Privacy */}
          {activeTab === 'data' && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold text-text">Data & Privacy</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface">
                  <div><p className="text-sm font-medium text-text">Export all data</p><p className="text-xs text-muted-foreground mt-0.5">Download all your data as JSON (clients, invoices, expenses, bank, mileage, payroll)</p></div>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}><Save className="h-3.5 w-3.5" /> Export</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-danger/20 bg-danger/5">
                  <div><p className="text-sm font-medium text-danger">Delete account</p><p className="text-xs text-muted-foreground mt-0.5">Permanently delete your account and all data. This cannot be undone.</p></div>
                  <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demo Mode */}
          {activeTab === 'demo' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-text flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-text-muted" />
                  Demo Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(toggleDemo.isPending || toggleDemo.isSuccess) && !demoStatus ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 rounded-full border-2 border-brand-navy/30 border-t-brand-navy animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface">
                      <div>
                        <p className="text-sm font-medium text-text">Populate with demo data</p>
                        <p className="text-xs text-text-muted mt-0.5 max-w-md">
                          {demoStatus?.demoMode
                            ? 'Remove demo data and restore your real business data.'
                            : 'Generate 12 months of realistic, profitable sample data — including invoices, expenses, bank transactions, and more.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={demoStatus?.demoMode ?? false}
                        onClick={() => toggleDemo.mutate(!demoStatus?.demoMode)}
                        disabled={toggleDemo.isPending}
                        className={cn(
                          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50',
                          demoStatus?.demoMode ? 'bg-brand-navy' : 'bg-muted'
                        )}
                      >
                        <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition duration-200', demoStatus?.demoMode ? 'translate-x-4' : 'translate-x-0.5')} />
                      </button>
                    </div>

                    {demoStatus?.demoMode && (
                      <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
                        <p className="text-xs text-warning font-medium">Demo data is active</p>
                        <p className="text-xs text-text-muted mt-1">
                          You are currently viewing demo data. Toggle Demo Mode off to restore your real data. Your actual data is preserved and safe.
                        </p>
                      </div>
                    )}

                    {!demoStatus?.demoMode && (
                      <div className="rounded-xl border border-border/50 p-4">
                        <p className="text-xs text-text-muted leading-relaxed">
                          Demo Mode populates your organization with realistic sample data — 12 months of invoices, expenses, bank transactions, mileage logs, and payroll entries. Use it to explore Cashaflux features with pre-filled data. Your actual data remains untouched and will be restored when you toggle Demo Mode off.
                        </p>
                      </div>
                    )}

                    {toggleDemo.isPending && (
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <div className="w-4 h-4 rounded-full border-2 border-brand-navy/30 border-t-brand-navy animate-spin" />
                        {demoStatus?.demoMode ? 'Cleaning up demo data...' : 'Generating demo data...'}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Display */}
          {activeTab === 'display' && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold text-text">Display Preferences</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface">
                  <div><p className="text-sm font-medium text-text">Dark mode</p><p className="text-xs text-muted-foreground mt-0.5">Toggle between light and dark theme</p></div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
      </div>
    </div>
    </div>
  )
}