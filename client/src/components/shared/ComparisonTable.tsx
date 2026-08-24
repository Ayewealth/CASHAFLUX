import { CheckCircle2 } from 'lucide-react'

interface ComparisonRow {
  feature: string
  values: { label: string; included: boolean | string }[]
}

interface ComparisonTableProps {
  rows: ComparisonRow[]
  highlightCol?: number
  className?: string
}

export default function ComparisonTable({ rows, highlightCol = -1, className = '' }: ComparisonTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 pr-4 text-xs font-medium text-text-muted uppercase tracking-wider font-mono">
              Feature
            </th>
            {rows[0]?.values.map((v, i) => (
              <th
                key={v.label}
                className={`text-center py-3 px-4 text-xs font-medium uppercase tracking-wider font-mono ${
                  i === highlightCol ? 'text-brand-navy bg-brand-blue-light/30' : 'text-text-muted'
                }`}
              >
                {v.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.feature}
              className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-surface/50' : ''}`}
            >
              <td className="py-3 pr-4 text-sm text-brand-navy font-medium">{row.feature}</td>
              {row.values.map((v, j) => (
                <td key={v.label} className={`text-center py-3 px-4 ${j === highlightCol ? 'bg-brand-blue-light/20' : ''}`}>
                  {typeof v.included === 'boolean' ? (
                    v.included ? (
                      <CheckCircle2 className="w-4 h-4 text-brand-navy mx-auto" />
                    ) : (
                      <span className="text-text-muted/30">&mdash;</span>
                    )
                  ) : (
                    <span className="text-xs text-text-muted font-medium">{v.included}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}