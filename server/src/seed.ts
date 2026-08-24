import { db } from './db/client'
import { industries, expenseCategories } from '@shared/schema'

const SEED_INDUSTRIES = [
  'Accounting', 'Advertising', 'Agriculture', 'Architecture', 'Automotive',
  'Biotechnology', 'Construction', 'Consulting', 'Education', 'Energy',
  'Engineering', 'Entertainment', 'Finance', 'Food & Beverage', 'Government',
  'Healthcare', 'Hospitality', 'Information Technology', 'Insurance', 'Legal',
  'Manufacturing', 'Marketing', 'Media', 'Nonprofit', 'Real Estate',
  'Retail', 'Science', 'Telecommunications', 'Transportation', 'Utilities',
  'Wholesale',
]

export const IRS_CATEGORIES = [
  'Advertising', 'Car & Truck', 'Commissions', 'Insurance', 'Legal & Professional',
  'Office Expenses', 'Rent', 'Repairs', 'Supplies', 'Travel', 'Meals',
  'Utilities', 'Wages', 'Other',
]

export async function seedIndustries(): Promise<void> {
  try {
    const existing = await db.query.industries.findFirst()
    if (existing) {
      console.log('[seed] Industries already seeded, skipping')
      return
    }

    const values = SEED_INDUSTRIES.map((name) => ({
      id: crypto.randomUUID(),
      name,
    }))

    await db.insert(industries).values(values)
    console.log(`[seed] Seeded ${values.length} industries`)
  } catch (error) {
    console.error('[seed] Failed to seed industries:', error)
  }
}

export async function seedDefaultExpenseCategories(orgId: string): Promise<void> {
  try {
    const existing = await db.query.expenseCategories.findFirst({
      where: (c, { eq }) => eq(c.orgId, orgId),
    })
    if (existing) return

    const values = IRS_CATEGORIES.map((name) => ({
      id: crypto.randomUUID(),
      orgId,
      name,
      irsDefault: true,
    }))

    await db.insert(expenseCategories).values(values)
    console.log(`[seed] Seeded ${values.length} expense categories for org ${orgId}`)
  } catch (error) {
    console.error('[seed] Failed to seed expense categories:', error)
  }
}