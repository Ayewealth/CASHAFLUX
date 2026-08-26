import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform, useReducedMotion } from 'motion/react'

interface TiltCardProps {
  children: ReactNode
  className?: string
  tiltDegree?: number
}

export default function TiltCard({ children, className = '', tiltDegree = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const rotateX = useTransform(y, [0, 1], [tiltDegree, -tiltDegree])
  const rotateY = useTransform(x, [0, 1], [-tiltDegree, tiltDegree])

  const glareX = useTransform(x, [0, 1], [0, 100])
  const glareY = useTransform(y, [0, 1], [0, 100])

  function handleMouseMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width)
    y.set((e.clientY - rect.top) / rect.height)
  }

  function handleMouseLeave() {
    if (reduce) return
    x.set(0.5)
    y.set(0.5)
  }

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, perspective: 1200 }}
      className={`relative ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(212,165,116,0.15), transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  )
}