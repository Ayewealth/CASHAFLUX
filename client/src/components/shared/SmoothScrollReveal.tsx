import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface SmoothScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

export default function SmoothScrollReveal({ children, className = '', delay = 0, y = 24 }: SmoothScrollRevealProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}