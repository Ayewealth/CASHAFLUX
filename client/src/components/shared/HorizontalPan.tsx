import { useRef, useEffect, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from 'motion/react'

gsap.registerPlugin(ScrollTrigger)

interface HorizontalPanProps {
  children: ReactNode
  className?: string
}

export default function HorizontalPan({ children, className = '' }: HorizontalPanProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return
    const ctx = gsap.context(() => {
      const distance = track.current!.scrollWidth - window.innerWidth
      if (distance <= 0) return
      gsap.to(track.current, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap.current,
          start: 'top top',
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    }, wrap)
    return () => ctx.revert()
  }, [reduce])

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <section ref={wrap} className={`relative overflow-hidden ${className}`}>
      <div ref={track} className="flex h-[100dvh] items-center">
        {children}
      </div>
    </section>
  )
}