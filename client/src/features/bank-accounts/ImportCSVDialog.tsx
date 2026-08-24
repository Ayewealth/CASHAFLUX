import { useState, useMemo } from 'react'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog'
import { useBankAccounts } from './hooks'
import { useImportBankTransactions, type ImportColumnMap } from '../bank-transactions/hooks'
import { toast } from '../../components/ui/toast'
import { Upload, FileText, AlertTriangle, CheckCircle2, X } from 'lucide-react'

const FIELDS = ['date', 'description', 'amount', 'type', 'category'] as const

const BANK_PRESETS: Record<string, Partial<ImportColumnMap>> = {
  'Chase': { date: 1, description: 2, amount: 3, type: 4 },
  'Bank of America': { date: 0, description: 1, amount: 2 },
  'Wells Fargo': { date: 0, description: 1, amount: 3 },
}

interface ImportCSVDialogProps {
  open: boolean
  onClose: () => void
}

export function ImportCSVDialog({ open, onClose }: ImportCSVDialogProps) {
  const { data: accounts } = useBankAccounts()
  const importTx = useImportBankTransactions()
  const [bankAccountId, setBankAccountId] = useState('')
  const [csvText, setCsvText] = useState('')
  const [detectedFormat, setDetectedFormat] = useState('')
  const [columnMap, setColumnMap] = useState<ImportColumnMap>({ date: 0, description: 1, amount: 2 })

  const rows = useMemo(() => {
    if (!csvText.trim()) return []
    return csvText.trim().split('\n').map((line) => line.split(',').map((p) => p.trim()))
  }, [csvText])

  const headerRow = rows[0] ?? []

  function detectFormat() {
    if (!headerRow.length) return
    const joined = headerRow.join(' ').toLowerCase()
    for (const [bank, map] of Object.entries(BANK_PRESETS)) {
      if (Object.keys(map).some((key) => joined.includes(key))) {
        setDetectedFormat(bank)
        setColumnMap({ date: 0, description: 1, amount: 2, ...map })
        return
      }
    }
  }

  function updateMap(field: keyof ImportColumnMap, value: number) {
    setColumnMap((prev) => ({ ...prev, [field]: value }))
  }

  function formatAmount(val: string) {
    const cleaned = val.replace(/[$,]/g, '').trim()
    const n = parseFloat(cleaned)
    return isNaN(n) ? '—' : `$${Math.abs(n).toFixed(2)}`
  }

  const previewRows = rows.slice(1, 4)

  async function handleImport() {
    if (!bankAccountId || rows.length < 2) return
    try {
      const result = await importTx.mutateAsync({
        bankAccountId,
        columnMap,
        rows,
        hasHeader: true,
      })
      if (result.duplicates > 0 || result.skipped > 0) {
        toast.add({
          title: `Imported ${result.imported}, skipped ${result.skipped}, ${result.duplicates} duplicates`,
          type: 'info',
        })
      } else {
        toast.add({ title: `Imported ${result.imported} transactions`, type: 'success' })
      }
      setCsvText('')
      setBankAccountId('')
      onClose()
    } catch {
      toast.add({ title: 'Failed to import transactions', type: 'error' })
    }
  }

  const showPreview = rows.length > 1
  const allFieldsMapped = columnMap.date !== undefined && columnMap.description !== undefined && columnMap.amount !== undefined

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
          <DialogDescription>Paste or upload CSV data with column mapping</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Bank account</Label>
            <Select value={bankAccountId} onValueChange={(v) => v && setBankAccountId(v)}>
              <SelectTrigger className="h-10 w-full">
                <span className="flex-1 text-left truncate">{bankAccountId ? (accounts?.find((a) => a.id === bankAccountId)?.name ?? 'Select...') : 'Select account...'}</span>
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">CSV data</Label>
            <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors bg-surface mb-2">
              <Upload className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Upload file or paste below</span>
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => {
                    setCsvText(reader.result as string)
                    setTimeout(detectFormat, 100)
                  }
                  reader.readAsText(file)
                }}
              />
            </label>
            <textarea
              rows={5}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value)
                if (!csvText) setTimeout(detectFormat, 100)
              }}
              placeholder={`date,description,amount\n2026-08-01,Client payment,2400.00\n2026-08-02,Rent,-1200.00`}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none font-mono"
            />
          </div>

          {detectedFormat && (
            <div className="rounded-lg bg-accent/5 border border-accent/20 px-3 py-2 text-xs text-accent flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Detected format: <strong>{detectedFormat}</strong>
            </div>
          )}

          {showPreview && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Column mapping</Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {FIELDS.map((field) => (
                  <div key={field} className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground capitalize">{field}</span>
                    <Select
                      value={String(columnMap[field] ?? '')}
                      onValueChange={(v) => v && updateMap(field, parseInt(v))}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <span className="truncate">{columnMap[field] !== undefined ? `Col ${columnMap[field]}` : 'Ignore'}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {headerRow.map((_, i) => (
                          <SelectItem key={i} value={String(i)}>
                            Col {i}{headerRow[i] ? `: ${headerRow[i].slice(0, 20)}` : ''}
                          </SelectItem>
                        ))}
                        <SelectItem value="">Ignore</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Col</th>
                      <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Date</th>
                      <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Description</th>
                      <th className="px-2 py-1.5 text-right font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-2 py-1 text-muted-foreground">{i + 1}</td>
                        <td className="px-2 py-1">{row[columnMap.date] ?? '—'}</td>
                        <td className="px-2 py-1">{row[columnMap.description] ?? '—'}</td>
                        <td className="px-2 py-1 text-right font-mono">{formatAmount(row[columnMap.amount] ?? '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {showPreview && `${rows.length - 1} rows`}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleImport}
              disabled={!bankAccountId || !showPreview || !allFieldsMapped || importTx.isPending}
            >
              {importTx.isPending ? 'Importing...' : `Import${showPreview ? ` ${rows.length - 1}` : ''}`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}