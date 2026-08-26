export interface PlanDef {
  id: 'free' | 'pro' | 'business'
  name: string
  monthly: number
  annual: number | null
  features: string[]
  popular: boolean
  cta: string
}

export interface FeatureRow {
  name: string
  free: boolean | string
  pro: boolean | string
  business: boolean | string
}

export interface CompetitorRow {
  feature: string
  values: { label: string; included: boolean | string }[]
}

export const PLANS: PlanDef[] = [
  {
    id: 'free', name: 'Free', monthly: 0, annual: null,
    features: ['Up to 5 clients', 'Core invoicing', 'Expense tracking', 'Basic reports', 'Mileage tracking', 'Bank account management'],
    popular: false,
    cta: 'Start Free',
  },
  {
    id: 'pro', name: 'Pro', monthly: 19, annual: 180,
    features: ['Unlimited clients', 'Bank sync & reconciliation', 'Recurring invoices', 'Advanced reports', 'Tax-ready exports', 'Priority email support', 'Custom invoice templates', 'CSV import/export'],
    popular: true,
    cta: 'Choose Pro',
  },
  {
    id: 'business', name: 'Business', monthly: 39, annual: 360,
    features: ['Everything in Pro', 'Team members (up to 5)', 'Payroll-ready exports', 'Dedicated account manager', 'Priority phone support', 'Activity audit log', 'Custom reporting'],
    popular: false,
    cta: 'Choose Business',
  },
]

export const ALL_FEATURES: FeatureRow[] = [
  { name: 'Clients', free: 'Up to 5', pro: 'Unlimited', business: 'Unlimited' },
  { name: 'Invoicing', free: true, pro: true, business: true },
  { name: 'Recurring invoices', free: false, pro: true, business: true },
  { name: 'Expense tracking', free: true, pro: true, business: true },
  { name: 'Receipt upload (R2)', free: true, pro: true, business: true },
  { name: 'Bank accounts', free: true, pro: true, business: true },
  { name: 'Bank reconciliation', free: false, pro: true, business: true },
  { name: 'CSV import', free: true, pro: true, business: true },
  { name: 'Mileage tracking', free: true, pro: true, business: true },
  { name: 'Financial reports', free: 'Basic', pro: 'Advanced', business: 'Advanced' },
  { name: 'Tax centre', free: true, pro: true, business: true },
  { name: 'Tax-ready export', free: false, pro: true, business: true },
  { name: 'Payroll export', free: false, pro: false, business: true },
  { name: 'Team members', free: false, pro: false, business: 'Up to 5' },
  { name: 'Activity audit log', free: false, pro: false, business: true },
  { name: 'Priority support', free: false, pro: 'Email', business: 'Phone & Email' },
]

export const COMPETITOR_COMPARISON: Record<string, CompetitorRow[]> = {
  quickbooks: [
    { feature: 'Client management', values: [{ label: 'QuickBooks', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Invoicing', values: [{ label: 'QuickBooks', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Expense tracking', values: [{ label: 'QuickBooks', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Receipt upload', values: [{ label: 'QuickBooks', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Bank reconciliation', values: [{ label: 'QuickBooks', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Mileage with IRS rate', values: [{ label: 'QuickBooks', included: false }, { label: 'Cashaflux', included: true }] },
    { feature: 'IRS Schedule C categories', values: [{ label: 'QuickBooks', included: false }, { label: 'Cashaflux', included: true }] },
    { feature: 'Tax-ready export', values: [{ label: 'QuickBooks', included: 'Add-on' }, { label: 'Cashaflux', included: true }] },
    { feature: 'Free plan', values: [{ label: 'QuickBooks', included: false }, { label: 'Cashaflux', included: true }] },
    { feature: 'Setup time', values: [{ label: 'QuickBooks', included: 'Hours' }, { label: 'Cashaflux', included: 'Minutes' }] },
    { feature: 'Pricing (Pro equivalent)', values: [{ label: 'QuickBooks', included: '$30+/mo' }, { label: 'Cashaflux', included: '$19/mo' }] },
  ],
  xero: [
    { feature: 'Client management', values: [{ label: 'Xero', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Invoicing', values: [{ label: 'Xero', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Expense tracking', values: [{ label: 'Xero', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Receipt upload', values: [{ label: 'Xero', included: false }, { label: 'Cashaflux', included: true }] },
    { feature: 'Bank reconciliation', values: [{ label: 'Xero', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Mileage with IRS rate', values: [{ label: 'Xero', included: false }, { label: 'Cashaflux', included: true }] },
    { feature: 'IRS Schedule C categories', values: [{ label: 'Xero', included: false }, { label: 'Cashaflux', included: true }] },
    { feature: 'Tax-ready export', values: [{ label: 'Xero', included: false }, { label: 'Cashaflux', included: true }] },
    { feature: 'Free plan', values: [{ label: 'Xero', included: false }, { label: 'Cashaflux', included: true }] },
    { feature: 'Setup time', values: [{ label: 'Xero', included: 'Hours' }, { label: 'Cashaflux', included: 'Minutes' }] },
    { feature: 'Pricing (Pro equivalent)', values: [{ label: 'Xero', included: '$13+/mo' }, { label: 'Cashaflux', included: '$19/mo' }] },
  ],
  freshbooks: [
    { feature: 'Client management', values: [{ label: 'FreshBooks', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Invoicing', values: [{ label: 'FreshBooks', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Expense tracking', values: [{ label: 'FreshBooks', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Receipt upload', values: [{ label: 'FreshBooks', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Bank reconciliation', values: [{ label: 'FreshBooks', included: true }, { label: 'Cashaflux', included: true }] },
    { feature: 'Mileage with IRS rate', values: [{ label: 'FreshBooks', included: false }, { label: 'Cashaflux', included: true }] },
    { feature: 'IRS Schedule C categories', values: [{ label: 'FreshBooks', included: false }, { label: 'Cashaflux', included: true }] },
    { feature: 'Tax-ready export', values: [{ label: 'FreshBooks', included: false }, { label: 'Cashaflux', included: true }] },
    { feature: 'Free plan', values: [{ label: 'FreshBooks', included: false }, { label: 'Cashaflux', included: true }] },
    { feature: 'Setup time', values: [{ label: 'FreshBooks', included: 'Hours' }, { label: 'Cashaflux', included: 'Minutes' }] },
    { feature: 'Pricing (Pro equivalent)', values: [{ label: 'FreshBooks', included: '$17+/mo' }, { label: 'Cashaflux', included: '$19/mo' }] },
  ],
}

export const COMPETITOR_META: Record<string, { name: string; description: string; website: string }> = {
  quickbooks: { name: 'QuickBooks', description: 'The most popular accounting software for small businesses, but known for complexity and cost.', website: 'https://quickbooks.intuit.com' },
  xero: { name: 'Xero', description: 'A cloud-based accounting platform popular with startups and growing businesses.', website: 'https://xero.com' },
  freshbooks: { name: 'FreshBooks', description: 'An invoicing-first accounting platform designed for service-based businesses.', website: 'https://freshbooks.com' },
}