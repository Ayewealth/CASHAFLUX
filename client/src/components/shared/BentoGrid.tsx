import { type ReactNode } from 'react'
import SmoothScrollReveal from './SmoothScrollReveal'

interface BentoCell {
  id: string
  content: ReactNode
  className?: string
}

interface BentoGridProps {
  cells: BentoCell[]
  className?: string
}

export default function BentoGrid({ cells, className = '' }: BentoGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 ${className}`}>
      {cells.map((cell, i) => (
        <SmoothScrollReveal key={cell.id} delay={0.06 * i}>
          <div className={cell.className}>{cell.content}</div>
        </SmoothScrollReveal>
      ))}
    </div>
  )
}