import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Building2, CalendarDays, Globe, UserPlus, CheckCircle2, ChevronRight, ChevronLeft, X, Mail, Loader2, Upload, Trash2, MapPin, Phone, Globe2, FileText } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '../../components/ui/select'
import { IndustryCombobox } from '../../components/IndustryCombobox'
import Logo from '../../components/shared/Logo'

type Step = 1 | 2 | 3 | 4

interface FormData {
  businessName: string
  businessType: string
  industry: string
  fiscalYearStart: number
  ein: string
  phone: string
  website: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zip: string
  logoR2Key: string | null
  inviteEmails: string[]
  plan: string
  billingInterval: 'monthly' | 'annual'
  orgId: string | null
}

const DEFAULT_FORM: FormData = {
  businessName: '',
  businessType: 'sole_proprietor',
  industry: '',
  fiscalYearStart: 1,
  ein: '',
  phone: '',
  website: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zip: '',
  logoR2Key: null,
  inviteEmails: [],
  plan: 'free',
  billingInterval: 'monthly',
  orgId: null,
}

const STEPS = [
  { step: 1 as Step, title: 'Business profile', subtitle: 'Tell us about your business' },
  { step: 2 as Step, title: 'Currency & locale', subtitle: 'Confirm your region settings' },
  { step: 3 as Step, title: 'Invite team', subtitle: 'Add colleagues (optional)' },
  { step: 4 as Step, title: 'Choose plan', subtitle: 'Pick the plan that fits you' },
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  sole_proprietor: 'Sole Proprietor',
  llc: 'LLC',
  s_corp: 'S-Corp',
  c_corp: 'C-Corp',
  partnership: 'Partnership',
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM',
  'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA',
  'WV', 'WI', 'WY',
]

const PLANS = [
  {
    name: 'Free',
    id: 'free',
    price: 0,
    features: ['5 clients', 'Invoicing', 'Expense tracking'],
    popular: false,
    cta: 'Start Free',
  },
  {
    name: 'Pro',
    id: 'pro',
    monthly: 19,
    annual: 180,
    savings: 'Save $48/yr',
    savingsPercent: 'Save 21%',
    features: ['Unlimited clients', 'Bank sync', 'Recurring invoices', 'Advanced reports'],
    popular: true,
    cta: 'Upgrade to Pro',
  },
  {
    name: 'Business',
    id: 'business',
    monthly: 39,
    annual: 360,
    savings: 'Save $108/yr',
    savingsPercent: 'Save 23%',
    features: ['Everything in Pro', 'Team members (up to 5)', 'Payroll-ready exports', 'Priority support'],
    popular: false,
    cta: 'Upgrade to Business',
  },
] as const

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(DEFAULT_FORM)
  const [error, setError] = useState('')
  const [emails, setEmails] = useState<string[]>([''])
  const [initialized, setInitialized] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [checkoutPending, setCheckoutPending] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: savedProgress, isLoading: progressLoading } = useQuery<{ currentStep: number; formData: FormData } | null>({
    queryKey: ['onboarding', 'progress'],
    queryFn: async () => {
      const res = await fetch('/api/onboarding/progress')
      if (!res.ok) return null
      return res.json()
    },
    staleTime: 0,
  })

  const saveMutation = useMutation({
    mutationFn: async (data: { currentStep: number; formData: FormData }) => {
      await fetch('/api/onboarding/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    },
  })

  useEffect(() => {
    if (savedProgress !== undefined) {
      if (savedProgress) {
        setCurrentStep(Math.min(Math.max(savedProgress.currentStep, 1), 4) as Step)
        const fd = savedProgress.formData
        setForm(fd)
        if (fd.inviteEmails && fd.inviteEmails.length > 0) setEmails(fd.inviteEmails)
      }
      setInitialized(true)
    }
  }, [savedProgress])

  const persist = useCallback((step: Step, data: FormData) => {
    saveMutation.mutate({ currentStep: step, formData: data })
  }, [saveMutation])

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      persist(currentStep, next)
      return next
    })
  }

  function goTo(s: Step) {
    setError('')
    setCurrentStep(s)
    persist(s, form)
  }

  function goBack() {
    if (currentStep > 1) goTo((currentStep - 1) as Step)
  }

  async function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    setError('')
    try {
      const orgId = form.orgId || 'temp'
      const formData = new FormData()
      formData.append('file', file)
      formData.append('orgId', orgId)
      const res = await fetch('/api/uploads/logo', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Failed to upload logo')
      const { key } = await res.json()
      updateField('logoR2Key', key)
      const reader = new FileReader()
      reader.onload = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to upload logo')
    } finally {
      setLogoUploading(false)
    }
  }

  function handleLogoRemove() {
    updateField('logoR2Key', null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.businessName.trim()) {
      setError('Business name is required.')
      return
    }
    setSubmitting(true)
    try {
      const body = {
        businessName: form.businessName.trim(),
        businessType: form.businessType,
        industry: form.industry,
        fiscalYearStart: form.fiscalYearStart,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        zip: form.zip,
        phone: form.phone,
        website: form.website,
        ein: form.ein,
        logoR2Key: form.logoR2Key,
      }

      if (form.orgId) {
        const res = await fetch(`/api/onboarding/${form.orgId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('Failed to update organization')
      } else {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error('Failed to create organization')
        const json = await res.json()
        updateField('orgId', json.orgId)
      }
      goTo(2)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleStep2Confirm() { goTo(3) }

  async function handleStep3Continue() {
    const valid = emails.map(e => e.trim()).filter(Boolean)
    updateField('inviteEmails', valid)
    if (valid.length > 0 && form.orgId) {
      try {
        await fetch('/api/team/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgId: form.orgId, emails: valid }),
        })
      } catch {}
    }
    goTo(4)
  }

  function handleStep3Skip() {
    updateField('inviteEmails', [])
    goTo(4)
  }

  async function handleStep4Submit() {
    setError('')
    setSubmitting(true)
    try {
      if (form.plan !== 'free') {
        const res = await fetch('/api/subscription/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: form.plan,
            interval: form.billingInterval,
            successUrl: `${window.location.origin}/dashboard`,
            cancelUrl: `${window.location.origin}/onboarding`,
          }),
        })
        if (!res.ok) throw new Error('Failed to start checkout')
        const data = await res.json()
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        await fetch('/api/onboarding/progress', { method: 'DELETE' })
        navigate('/dashboard', { replace: true })
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setSubmitting(false)
    }
  }

  function handleStep4Skip() {
    updateField('plan', 'free')
    fetch('/api/onboarding/progress', { method: 'DELETE' }).then(() => {
      navigate('/dashboard', { replace: true })
    })
  }

  if (progressLoading || !initialized) {
    return (
      <div className="min-h-[100dvh] bg-bg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-[100dvh] bg-bg text-text">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
          <Logo />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-text-muted">Step {currentStep} of {STEPS.length}</p>
          <span className="text-xs text-text-muted">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mb-6">
        <h1 className="text-xl font-semibold tracking-tight">{STEPS[currentStep - 1].title}</h1>
        <p className="text-sm text-text-muted mt-1">{STEPS[currentStep - 1].subtitle}</p>
      </div>

      <main className="max-w-3xl mx-auto px-6 pb-16">
        {/* Step 1: Business Profile */}
        {currentStep === 1 && (
          <form onSubmit={handleStep1Submit} className="max-w-2xl mx-auto space-y-8">
            {/* Business Information */}
            <div>
              <p className="text-xs text-text-muted mb-4">Fields marked with <span className="text-danger">*</span> are required. All others are optional.</p>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Business Information</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="businessName" className="text-sm font-medium">Business name <span className="text-danger">*</span></Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <Input
                      id="businessName" type="text" required
                      value={form.businessName}
                      onChange={(e) => setForm(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="e.g. Acme Design Studio" className="pl-10 h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="businessType" className="text-sm font-medium">Business type</Label>
                    <Select value={form.businessType} onValueChange={(v) => v && setForm(prev => ({ ...prev, businessType: v }))}>
                      <SelectTrigger className="h-10 w-full">
                        <span className="flex-1 text-left truncate">
                          {BUSINESS_TYPE_LABELS[form.businessType] || form.businessType}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                        <SelectItem value="llc">LLC</SelectItem>
                        <SelectItem value="s_corp">S-Corp</SelectItem>
                        <SelectItem value="c_corp">C-Corp</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <IndustryCombobox
                    value={form.industry}
                    onChange={(v) => setForm(prev => ({ ...prev, industry: v }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ein" className="text-sm font-medium">Tax ID (EIN) <span className="text-text-muted font-normal">(optional)</span></Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                      <Input
                        id="ein" type="text"
                        value={form.ein}
                        onChange={(e) => setForm(prev => ({ ...prev, ein: e.target.value }))}
                        placeholder="XX-XXXXXXX" className="pl-10 h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone <span className="text-text-muted font-normal">(optional)</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                      <Input
                        id="phone" type="tel"
                        value={form.phone}
                        onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 000-0000" className="pl-10 h-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="website" className="text-sm font-medium">Website <span className="text-text-muted font-normal">(optional)</span></Label>
                  <div className="relative">
                    <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <Input
                      id="website" type="url"
                      value={form.website}
                      onChange={(e) => setForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://acme.com" className="pl-10 h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fiscalYearStart" className="text-sm font-medium">Tax year starts in</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <Select value={String(form.fiscalYearStart)} onValueChange={(v) => v && setForm(prev => ({ ...prev, fiscalYearStart: parseInt(v) }))}>
                      <SelectTrigger className="h-10 w-full pl-10">
                        <span className="flex-1 text-left truncate">
                          {MONTH_NAMES[form.fiscalYearStart - 1] || String(form.fiscalYearStart)}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                          <SelectItem key={m} value={String(m)}>
                            {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Business Address */}
            <div>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Business Address <span className="font-normal normal-case">(optional)</span></h3>
              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <Input
                    id="addressLine1" type="text"
                    value={form.addressLine1}
                    onChange={(e) => setForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                    placeholder="Address line 1" className="pl-10 h-10"
                  />
                </div>

                <Input
                  id="addressLine2" type="text"
                  value={form.addressLine2}
                  onChange={(e) => setForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                  placeholder="Address line 2 (optional)" className="h-10"
                />

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="city" className="text-sm font-medium">City</Label>
                    <Input
                      id="city" type="text"
                      value={form.city}
                      onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City" className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-sm font-medium">State</Label>
                    <Select value={form.state} onValueChange={(v) => v && setForm(prev => ({ ...prev, state: v }))}>
                      <SelectTrigger className="h-10 w-full">
                        <span className="flex-1 text-left truncate">{form.state || 'State'}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="zip" className="text-sm font-medium">ZIP code</Label>
                    <Input
                      id="zip" type="text"
                      value={form.zip}
                      onChange={(e) => setForm(prev => ({ ...prev, zip: e.target.value }))}
                      placeholder="ZIP code" className="h-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Logo */}
            <div>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Logo <span className="font-normal normal-case">(optional)</span></h3>
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors bg-surface">
                  {logoPreview || form.logoR2Key ? (
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                      <img src={logoPreview || '/api/logo-placeholder'} alt="Logo preview" className="max-h-24 max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-text-muted">
                      {logoUploading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6" />
                          <span className="text-sm">Upload logo</span>
                          <span className="text-xs text-text-muted/60">PNG, JPG or WebP</span>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleLogoSelect}
                    disabled={logoUploading}
                  />
                </label>
                {(logoPreview || form.logoR2Key) && (
                  <button
                    type="button"
                    onClick={handleLogoRemove}
                    className="flex items-center gap-1.5 text-xs text-danger hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove logo
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="text-sm text-danger flex items-center gap-1.5" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {form.orgId ? (
                <Button variant="outline" size="lg" onClick={() => goTo(2)} className="gap-1.5">
                  Skip this step
                </Button>
              ) : <div />}
              <Button size="lg" type="submit" disabled={submitting || logoUploading} className="gap-1.5">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {submitting ? 'Saving...' : form.orgId ? 'Save & Continue' : 'Continue'}
                {!submitting && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Currency & Locale */}
        {currentStep === 2 && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Currency</h3>
                  <p className="text-sm text-text-muted">What currency do you use for your business?</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Default</span>
                  <p className="text-2xl font-bold text-primary">USD</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-blue-light/40 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand-navy">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Locale & formatting</h3>
                  <p className="text-sm text-text-muted">How are dates and numbers formatted?</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Region</span>
                  <p className="text-2xl font-bold text-primary">United States</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm text-text-muted">These settings can be changed anytime in Settings later.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="lg" onClick={goBack} className="gap-1.5">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <Button size="lg" onClick={handleStep2Confirm} className="gap-1.5">
                Confirm <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Invite Team */}
        {currentStep === 3 && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Invite your team</h3>
                <p className="text-sm text-text-muted">Add colleagues to help manage your books. You can skip and invite later.</p>
              </div>
            </div>

            <div className="space-y-3">
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2 group">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <Input
                      type="email" placeholder="Colleague's email"
                      value={email}
                      onChange={(e) => { const next = [...emails]; next[index] = e.target.value; setEmails(next) }}
                      className="pl-10 h-10" autoComplete="email"
                    />
                  </div>
                  {emails.length > 1 && (
                    <button type="button" onClick={() => { const next = emails.filter((_, i) => i !== index); setEmails(next) }}
                      aria-label={`Remove email ${index + 1}`}
                      className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button type="button" onClick={() => setEmails([...emails, ''])}
              className="flex items-center gap-1.5 text-sm text-accent hover:underline font-medium"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M5 12h14" /><path d="M12 5v14" />
              </svg>
              Add another
            </button>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="lg" onClick={goBack} className="gap-1.5">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <Button variant="outline" size="lg" onClick={handleStep3Skip} className="gap-1.5">
                Skip this step
              </Button>
              <Button size="lg" onClick={handleStep3Continue} className="gap-1.5">
                Send invites <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-text-muted text-center">Invitations will be sent by email after you finish setup.</p>
          </div>
        )}

        {/* Step 4: Choose Plan */}
        {currentStep === 4 && (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Billing interval toggle */}
            <div className="flex justify-center">
              <div className="flex gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/50">
                <button
                  type="button"
                  onClick={() => updateField('billingInterval', 'monthly')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    form.billingInterval === 'monthly' ? 'bg-accent text-white shadow-sm' : 'text-muted-foreground hover:text-text'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => updateField('billingInterval', 'annual')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    form.billingInterval === 'annual' ? 'bg-accent text-white shadow-sm' : 'text-muted-foreground hover:text-text'
                  }`}
                >
                  Annual <span className="text-[10px] opacity-80 ml-0.5">Save 20%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const isSelected = form.plan === plan.id
                const displayPrice = 'monthly' in plan
                  ? (form.billingInterval === 'annual' ? `$${plan.annual}` : `$${plan.monthly}`)
                  : '$0'
                const intervalLabel = 'monthly' in plan
                  ? (form.billingInterval === 'annual' ? '/yr' : '/mo')
                  : ''
                return (
                  <button key={plan.id} type="button" onClick={() => updateField('plan', plan.id)}
                    className={`relative flex flex-col rounded-xl border-2 p-6 text-left transition-all ${
                      isSelected ? 'border-accent bg-accent/5 shadow-sm' : 'border-border bg-surface hover:border-accent/40'
                    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-4 inline-flex px-2.5 py-0.5 text-xs font-semibold text-white bg-accent rounded-full">Most popular</span>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className={`w-5 h-5 ${isSelected ? 'text-accent' : 'text-transparent'}`} />
                      <h3 className="text-base font-bold text-text">{plan.name}</h3>
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-text tracking-tight">{displayPrice}</span>
                      <span className="text-sm text-text-muted">{intervalLabel}</span>
                      {'monthly' in plan && form.billingInterval === 'annual' && (
                        <p className="text-[11px] text-success font-medium mt-1">${plan.monthly}/mo if paid monthly</p>
                      )}
                    </div>
                    {'savings' in plan && form.billingInterval === 'annual' && (
                      <span className="inline-block text-[11px] font-medium text-success px-2 py-0.5 rounded-full bg-success/10 mb-4 w-fit">{plan.savings}</span>
                    )}
                    <ul className="w-full space-y-2 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="text-sm text-text-muted flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>

            {error && (
              <div className="text-sm text-danger flex items-center gap-1.5 justify-center" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-border bg-surface -mx-6 -mb-8 px-6 py-4 rounded-b-xl">
              <Button variant="outline" size="lg" onClick={goBack} className="gap-1.5">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={handleStep4Skip} className="gap-1.5">
                  Skip & stay free
                </Button>
                <Button size="lg" onClick={handleStep4Submit} disabled={submitting} className="gap-1.5">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? 'Setting up...' : `Continue with ${PLANS.find(p => p.id === form.plan)?.name || 'Free'}`}
                  {!submitting && <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}