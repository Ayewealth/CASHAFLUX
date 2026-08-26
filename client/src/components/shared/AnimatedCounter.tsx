import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from 'motion/react'

gsap.registerPlugin(ScrollTrigger)

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  label?: string
  className?: string
  triggerOnView?: boolean
}

export default function AnimatedCounter({
  value, suffix = '', prefix = '', label, className = '',
  triggerOnView = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || !ref.current) return
    const el = ref.current
    const ctx = gsap.context(() => {
      const tween = gsap.fromTo(el, { textContent: 0 }, {
        textContent: value,
        duration: 2.5,
        ease: 'power3.out',
        snap: { textContent: 1 },
      })
      if (triggerOnView) {
        ScrollTrigger.create({
          trigger: el.parentElement,
          start: 'top 85%',
          animation: tween,
        })
      }
    }, el)
    return () => ctx.revert()
  }, [value, reduce, triggerOnView])

  return (
    <div className={className}>
      <div className="text-3xl sm:text-4xl font-bold font-heading tracking-tight">
        <span>{prefix}</span>
        <span ref={ref} className="tabular-nums">0</span>
        <span>{suffix}</span>
      </div>
      {label && <p className="text-sm mt-1.5">{label}</p>}
    </div>
  )
}