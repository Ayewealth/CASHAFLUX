import Stripe from 'stripe'
import { env } from '../env'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true,
})

export interface PlanInfo {
  plan: 'free' | 'pro' | 'business'
  interval: 'month' | 'year'
}

export function resolvePriceId(plan: string, interval: string): string | null {
  if (plan === 'pro' && interval === 'month') return env.STRIPE_PRICE_PRO_MONTHLY || null
  if (plan === 'pro' && interval === 'year') return env.STRIPE_PRICE_PRO_ANNUAL || null
  if (plan === 'business' && interval === 'month') return env.STRIPE_PRICE_BUSINESS_MONTHLY || null
  if (plan === 'business' && interval === 'year') return env.STRIPE_PRICE_BUSINESS_ANNUAL || null
  return null
}

export function resolvePlanFromPriceId(priceId: string): PlanInfo | null {
  if (priceId === env.STRIPE_PRICE_PRO_MONTHLY) return { plan: 'pro', interval: 'month' }
  if (priceId === env.STRIPE_PRICE_PRO_ANNUAL) return { plan: 'pro', interval: 'year' }
  if (priceId === env.STRIPE_PRICE_BUSINESS_MONTHLY) return { plan: 'business', interval: 'month' }
  if (priceId === env.STRIPE_PRICE_BUSINESS_ANNUAL) return { plan: 'business', interval: 'year' }
  return null
}