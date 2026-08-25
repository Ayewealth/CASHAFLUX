import { type Request, type Response } from 'express'
import { db } from '../db/client'

interface PlanLimitOpts {
  current: number
  limit: number
  plan: string
  resource: string
}

export function isAtLimit(opts: PlanLimitOpts): boolean {
  return opts.current >= opts.limit && opts.plan === 'free'
}

export function planLimitResponse(res: Response, opts: PlanLimitOpts) {
  return res.status(403).json({ error: `Free plan is limited to ${opts.limit} ${opts.resource}`, code: 'PLAN_LIMIT', limit: opts.limit, plan: 'free' })
}