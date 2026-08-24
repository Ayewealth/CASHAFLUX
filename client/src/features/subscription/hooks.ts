import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface SubscriptionStatus {
  plan: 'free' | 'pro' | 'business'
  status: string
  interval: 'month' | 'year' | null
  currentPeriodEnd: number | null
  customerId: string | null
  priceId?: string
}

export interface PlanConfig {
  id: string
  name: string
  price: number
  monthly?: number
  annual?: number
  interval: string | null
  features: string[]
  popular: boolean
}

export interface StripeInvoice {
  id: string
  number: string | null
  amountPaid: number
  currency: string
  status: string
  created: number
  pdf: string | null
  hostedUrl: string | null
}

export function useSubscriptionStatus() {
  return useQuery<SubscriptionStatus>({
    queryKey: ['subscription', 'status'],
    queryFn: async () => {
      const res = await fetch('/api/subscription/status')
      if (!res.ok) throw new Error('Failed to fetch subscription status')
      return res.json()
    },
    staleTime: 15 * 60 * 1000,
  })
}

export function useCreateCheckout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ plan, interval, successUrl, cancelUrl }: { plan: string; interval?: string; successUrl?: string; cancelUrl?: string }) => {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval: interval || 'month', successUrl, cancelUrl }),
      })
      if (!res.ok) throw new Error('Failed to create checkout session')
      const data = await res.json()
      window.location.href = data.url
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'status'] })
    },
  })
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to create portal session')
      const data = await res.json()
      window.location.href = data.url
    },
  })
}

export function usePlans() {
  return useQuery<PlanConfig[]>({
    queryKey: ['subscription', 'plans'],
    queryFn: async () => {
      const res = await fetch('/api/subscription/plans')
      if (!res.ok) throw new Error('Failed to fetch plans')
      return res.json()
    },
    staleTime: Infinity,
  })
}

export function useInvoiceHistory() {
  return useQuery<StripeInvoice[]>({
    queryKey: ['subscription', 'invoices'],
    queryFn: async () => {
      const res = await fetch('/api/subscription/invoices')
      if (!res.ok) throw new Error('Failed to fetch invoices')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}