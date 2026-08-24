import { Router, type Request, type Response } from 'express'
import { stripe, resolvePlanFromPriceId } from '../lib/stripe'
import { env } from '../env'
import { db } from '../db/client'
import { users } from '@shared/schema'
import { eq } from 'drizzle-orm'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const evt = event as any

  switch (evt.type) {
    case 'checkout.session.completed': {
      const session = evt.data.object
      const userId = session.client_reference_id
      if (!userId) return res.json({ received: true })

      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
      if (!subscriptionId) return res.json({ received: true })

      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any
      const priceId = subscription.items.data[0]?.price?.id
      const planInfo = resolvePlanFromPriceId(priceId)

      if (planInfo) {
        await db.update(users)
          .set({
            plan: planInfo.plan,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            planInterval: planInfo.interval,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          })
          .where(eq(users.id, userId))
      }
      break
    }

    case 'customer.subscription.updated': {
      const s = evt.data.object
      const customerId = s.customer as string
      const user = await db.query.users.findFirst({
        where: eq(users.stripeCustomerId, customerId),
      })
      if (!user) return res.json({ received: true })

      const priceId = s.items.data[0]?.price?.id
      const planInfo = resolvePlanFromPriceId(priceId)

      await db.update(users)
        .set({
          stripeSubscriptionId: s.id,
          subscriptionStatus: s.status,
          plan: planInfo?.plan ?? user.plan,
          planInterval: planInfo?.interval ?? user.planInterval,
          currentPeriodEnd: new Date(s.current_period_end * 1000),
        })
        .where(eq(users.id, user.id))
      break
    }

    case 'customer.subscription.deleted': {
      const s = evt.data.object
      const customerId = s.customer as string
      const user = await db.query.users.findFirst({
        where: eq(users.stripeCustomerId, customerId),
      })
      if (!user) return res.json({ received: true })

      await db.update(users)
        .set({
          plan: 'free',
          stripeSubscriptionId: null,
          subscriptionStatus: 'canceled',
          planInterval: null,
          currentPeriodEnd: null,
        })
        .where(eq(users.id, user.id))
      break
    }

    case 'invoice.payment_failed': {
      const invoice = evt.data.object
      const customerId = invoice.customer as string
      const user = await db.query.users.findFirst({
        where: eq(users.stripeCustomerId, customerId),
      })
      if (!user) return res.json({ received: true })

      await db.update(users)
        .set({ subscriptionStatus: 'past_due' })
        .where(eq(users.id, user.id))
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = evt.data.object
      const customerId = invoice.customer as string
      const subscriptionId = invoice.subscription as string
      if (!subscriptionId) return res.json({ received: true })

      const user = await db.query.users.findFirst({
        where: eq(users.stripeCustomerId, customerId),
      })
      if (!user) return res.json({ received: true })

      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any

      await db.update(users)
        .set({
          subscriptionStatus: 'active',
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        })
        .where(eq(users.id, user.id))
      break
    }
  }

  res.json({ received: true })
})

export default router