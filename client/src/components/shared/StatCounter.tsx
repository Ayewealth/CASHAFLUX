import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from 'motion/react'

gsap.registerPlugin(ScrollTrigger)

interface StatCounterProps {
  value: number
  suffix?: string
  prefix?: string
  label: string
  className?: string
}

export default function StatCounter({ value, suffix = '', prefix = '', label, className = '' }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || !ref.current) return
    const el = ref.current
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { textContent: 0 }, {
        textContent: value,
        duration: 2,
        ease: 'power2.out',
        scrollTrigger: { trigger: el.parentElement, start: 'top 85%' },
        snap: { textContent: 1 },
      })
    }, el)
    return () => ctx.revert()
  }, [value, reduce])

  return (
    <div className={`text-center ${className}`}>
      <div className="text-3xl sm:text-4xl font-bold text-brand-navy tracking-tight">
        <span ref={ref} className="tabular-nums">0</span>
        <span>{suffix}</span>
      </div>
      <p className="text-sm text-text-muted mt-1.5">{label}</p>
    </div>
  )
}