import { useRef, useEffect, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from 'motion/react'

gsap.registerPlugin(ScrollTrigger)

interface StickyStackProps {
  cards: { id: string; content: ReactNode }[]
  className?: string
}

export default function StickyStack({ cards, className = '' }: StickyStackProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || !ref.current) return
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>('.stack-card')
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return
        ScrollTrigger.create({
          trigger: card,
          start: 'top top',
          endTrigger: cardEls[cardEls.length - 1],
          end: 'top top',
          pin: true,
          pinSpacing: false,
        })
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: 'none',
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [reduce])

  if (reduce) {
    return (
      <div className={`space-y-6 ${className}`}>
        {cards.map((c) => <div key={c.id}>{c.content}</div>)}
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      {cards.map((card, i) => (
        <div
          key={card.id}
          className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center"
        >
          {card.content}
        </div>
      ))}
    </div>
  )
}