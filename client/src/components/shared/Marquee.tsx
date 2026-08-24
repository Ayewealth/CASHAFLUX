import { useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface MarqueeProps {
  items: { label: string; icon?: React.ReactNode }[]
  speed?: number
  className?: string
}

export default function Marquee({ items, speed = 30, className = '' }: MarqueeProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return (
      <div className={`flex flex-wrap justify-center gap-8 ${className}`}>
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-text-muted/40 font-bold text-lg tracking-tight">
            {item.icon}
            {item.label}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex gap-8 w-max"
        animate={{ x: [0, -50 * items.length] }}
        transition={{
          x: { repeat: Infinity, duration: speed, ease: 'linear' },
        }}
      >
        {[...items, ...items].map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="flex items-center gap-2 text-text-muted/40 font-bold text-lg tracking-tight shrink-0"
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </motion.div>
    </div>
  )
}