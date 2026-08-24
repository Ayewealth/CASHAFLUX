import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Save, Upload, Eye, EyeOff, X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { ThemeToggle } from '../../components/dashboard/ThemeToggle'
import { useSettings, useUpdateSettings } from '../../features/settings/hooks'
import { toast } from '../../components/ui/toast'
import { cn } from '../../lib/utils'
import { authClient } from '../../lib/auth-client'

const TABS = [
  { id: 'business', label: 'Business Profile' },
  { id: 'invoice-defaults', label: 'Invoice Defaults' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'billing', label: 'Subscription & Billing' },
  { id: 'security', label: 'Security' },
  { id: 'data', label: 'Data & Privacy' },
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
  const [activeTab, setActiveTab] = useState<TabId>('business')
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()
  const session = authClient.useSession()

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

      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px', activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-text')}>
            {tab.label}
          </button>
        ))}
      </div>

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
            <Card>
              <CardHeader><CardTitle className="text-sm font-semibold text-text">Subscription & Billing</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface">
                  <div><p className="text-sm font-medium text-text">Current Plan</p><p className="text-xs text-muted-foreground mt-0.5">You are on the <strong className="capitalize">{((session.data?.user as any)?.plan) ?? 'Free'}</strong> plan</p></div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/pricing')}>View Plans</Button>
                </div>
                <div className="p-4 rounded-xl border border-border bg-surface">
                  <p className="text-sm text-muted-foreground">Manage your subscription, payment method, and invoices in the Stripe Customer Portal.</p>
                </div>
              </CardContent>
            </Card>
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
  )
}