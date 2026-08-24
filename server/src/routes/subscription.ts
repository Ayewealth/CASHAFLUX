import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { stripe, resolvePriceId } from '../lib/stripe'
import { env } from '../env'
import { db } from '../db/client'
import { users } from '@shared/schema'
import { eq } from 'drizzle-orm'

const router = Router()
router.use(requireAuth)

// Create Stripe Checkout Session
router.post('/checkout', async (req, res) => {
  try {
    const { plan, interval, successUrl, cancelUrl } = req.body
    const priceId = resolvePriceId(plan, interval || 'month')
    if (!priceId) return res.status(400).json({ error: 'Invalid plan or interval' })

    const userId = req.user!.id
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
    if (!user) return res.status(404).json({ error: 'User not found' })

    let customer = user.stripeCustomerId
    if (!customer) {
      const cust = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      })
      customer = cust.id
      await db.update(users).set({ stripeCustomerId: customer }).where(eq(users.id, userId))
    }

    const session = await stripe.checkout.sessions.create({
      customer,
      client_reference_id: userId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${env.BETTER_AUTH_URL}/dashboard/settings?tab=billing`,

      cancel_url: cancelUrl || `${env.BETTER_AUTH_URL}/dashboard/settings?tab=billing`,
      metadata: { userId },
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

// Create Stripe Customer Portal session
router.post('/portal', async (req, res) => {
  try {
    const userId = req.user!.id
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ error: 'No active subscription' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.BETTER_AUTH_URL}/dashboard/settings?tab=billing`,
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Portal error:', err)
    res.status(500).json({ error: 'Failed to create portal session' })
  }
})

// Get subscription status (on-demand refresh from Stripe)
router.get('/status', async (req, res) => {
  try {
    const userId = req.user!.id
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })
    if (!user) return res.status(404).json({ error: 'User not found' })

    // If has a subscription, refresh from Stripe
    if (user.stripeSubscriptionId && user.plan !== 'free') {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId) as any
        const priceId = subscription.items.data[0]?.price?.id
        const planInfo = priceId ? { plan: 'pro' as const, interval: 'month' as const } : null

        await db.update(users)
          .set({
            subscriptionStatus: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          })
          .where(eq(users.id, userId))

        return res.json({
          plan: user.plan,
          status: subscription.status,
          interval: user.planInterval,
          currentPeriodEnd: subscription.current_period_end,
          customerId: user.stripeCustomerId,
          priceId,
        })
      } catch {
        // Strip API failed — serve cached data
      }
    }

    res.json({
      plan: user.plan,
      status: user.plan === 'free' ? 'active' : user.subscriptionStatus,
      interval: user.planInterval,
      currentPeriodEnd: user.currentPeriodEnd ? Math.floor(user.currentPeriodEnd.getTime() / 1000) : null,
      customerId: user.stripeCustomerId,
    })
  } catch (err) {
    console.error('Status error:', err)
    res.status(500).json({ error: 'Failed to get subscription status' })
  }
})

// Get plan configs (for the billing page)
router.get('/plans', async (_req, res) => {
  res.json([
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: null,
      features: ['Up to 5 clients', 'Core invoicing', 'Expense tracking', 'Basic reports', 'Mileage tracking'],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      monthly: 19,
      annual: 180,
      features: ['Unlimited clients', 'Bank sync & reconciliation', 'Recurring invoices', 'Advanced reports', 'Priority email support'],
      popular: true,
    },
    {
      id: 'business',
      name: 'Business',
      monthly: 39,
      annual: 360,
      features: ['Everything in Pro', 'Team members (up to 5)', 'Payroll-ready exports', 'Dedicated account manager', 'Priority phone support'],
      popular: false,
    },
  ])
})

// Get invoice history from Stripe
router.get('/invoices', async (req, res) => {
  try {
    const userId = req.user!.id
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
    if (!user || !user.stripeCustomerId) return res.json([])

    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 20,
    }) as any

    res.json(invoices.data.map((inv: any) => ({
      id: inv.id,
      number: inv.number,
      amountPaid: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      created: inv.created,
      pdf: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
    })))
  } catch (err) {
    console.error('Invoice history error:', err)
    res.status(500).json({ error: 'Failed to fetch invoice history' })
  }
})

export default router