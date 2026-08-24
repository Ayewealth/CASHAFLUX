import { useEffect, useState } from 'react'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TOCProps {
  content: string
  className?: string
}

export default function TOC({ content, className = '' }: TOCProps) {
  const [items, setItems] = useState<TOCItem[]>([])

  useEffect(() => {
    const headings = content.match(/^##\s+(.+)$/gm)
    if (!headings) {
      setItems([])
      return
    }
    setItems(
      headings.map((h) => {
        const text = h.replace(/^##\s+/, '')
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        return { id, text, level: 2 }
      })
    )
  }, [content])

  if (items.length === 0) return null

  return (
    <nav className={className}>
      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 font-mono">On this page</h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-sm text-text-muted hover:text-brand-navy transition-colors block py-1 border-l-2 border-transparent hover:border-brand-navy pl-3"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}