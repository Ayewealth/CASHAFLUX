import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { DatePicker } from '../../components/ui/date-picker'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { useClients } from '../../features/clients/hooks'
import { useInvoice, useCreateInvoice, useUpdateInvoice, useCreateRecurringInvoice } from '../../features/invoices/hooks'
import { RecurringToggle, type RecurringConfig } from '../../features/invoices/RecurringToggle'
import { toast } from '../../components/ui/toast'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'MXN']

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
}

function createLineItem(): LineItem {
  return { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, taxRate: 0 }
}

export default function InvoiceFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { data: clients } = useClients()
  const { data: existingInvoice } = useInvoice(id ?? '')
  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()
  const createRecurring = useCreateRecurringInvoice()

  const [clientId, setClientId] = useState('')
  const [issueDate, setIssueDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [currency, setCurrency] = useState('USD')
  const [discount, setDiscount] = useState('')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([createLineItem()])
  const [recurringConfig, setRecurringConfig] = useState<RecurringConfig>({ enabled: false, frequency: 'monthly', endDate: undefined })

  useEffect(() => {
    if (existingInvoice) {
      setClientId(existingInvoice.clientId)
      setIssueDate(existingInvoice.issueDate ? new Date(existingInvoice.issueDate) : new Date())
      setDueDate(existingInvoice.dueDate ? new Date(existingInvoice.dueDate) : undefined)
      setCurrency(existingInvoice.currency ?? 'USD')
      setDiscount(existingInvoice.discount ?? '')
      setNotes(existingInvoice.notes ?? '')
      setLineItems(existingInvoice.lineItems.map((li) => ({
        id: crypto.randomUUID(),
        description: li.description,
        quantity: li.quantity,
        unitPrice: parseFloat(li.unitPrice as any),
        taxRate: parseFloat((li as any).taxRate ?? '0'),
      })))
    }
  }, [existingInvoice])

  function addItem() { setLineItems([...lineItems, createLineItem()]) }
  function removeItem(itemId: string) { if (lineItems.length > 1) setLineItems(lineItems.filter((i) => i.id !== itemId)) }
  function updateItem(itemId: string, field: keyof LineItem, value: string | number) {
    setLineItems(lineItems.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxTotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100), 0)
  const discountVal = parseFloat(discount) || 0
  const total = subtotal + taxTotal - discountVal

  function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

  async function handleSave(status: 'draft' | 'sent' = 'draft') {
    if (!clientId) { toast.add({ title: 'Please select a client', type: 'error' }); return }
    if (!dueDate) { toast.add({ title: 'Please select a due date', type: 'error' }); return }

    const payload = {
      clientId,
      invoiceNumber: existingInvoice?.invoiceNumber ?? `INV-${String(Date.now()).slice(-4)}`,
      status,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      currency,
      subtotal: subtotal.toFixed(2),
      taxTotal: taxTotal.toFixed(2),
      discount: discountVal > 0 ? discountVal.toFixed(2) : null,
      total: total.toFixed(2),
      notes: notes || null,
      logoR2Key: null,
      lineItems: lineItems
        .filter((li) => li.description.trim())
        .map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice.toFixed(2),
          taxRate: li.taxRate.toFixed(2),
          total: (li.quantity * li.unitPrice).toFixed(2),
        })),
    }

    try {
      let invoiceId: string | undefined
      if (isEdit) {
        await updateInvoice.mutateAsync({ id, ...payload } as any)
        toast.add({ title: 'Invoice updated', type: 'success' })
      } else {
        const created = await createInvoice.mutateAsync(payload)
        invoiceId = created.id
        toast.add({ title: 'Invoice created', type: 'success' })
      }

      if (invoiceId && recurringConfig.enabled) {
        const days: Record<string, number> = { weekly: 7, fortnightly: 14, monthly: 30, quarterly: 91, annually: 365 }
        const interval = days[recurringConfig.frequency] ?? 30
        const nextDate = new Date(Date.now() + interval * 24 * 60 * 60 * 1000)
        await createRecurring.mutateAsync({
          templateInvoiceId: invoiceId,
          frequency: recurringConfig.frequency,
          nextDate: nextDate.toISOString(),
          endDate: recurringConfig.endDate ? recurringConfig.endDate.toISOString() : null,
        })
      }

      navigate('/dashboard/invoices')
    } catch {
      toast.add({ title: 'Failed to save invoice', type: 'error' })
    }
  }

  const loading = createInvoice.isPending || updateInvoice.isPending || createRecurring.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard/invoices')} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">{isEdit ? 'Edit Invoice' : 'New Invoice'}</h1>
          <p className="text-sm text-muted-foreground mt-1">{isEdit ? `Editing ${existingInvoice?.invoiceNumber ?? ''}` : 'Create a new invoice for your client'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-sm font-semibold text-text">Client Information</h2>
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={(v) => v && setClientId(v)}>
                <SelectTrigger className="h-10 w-full">
                  <span className="flex-1 text-left truncate">{clientId ? (clients?.find((c) => c.id === clientId)?.name ?? 'Select...') : 'Select a client...'}</span>
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Issue Date</Label>
                <DatePicker value={issueDate} onChange={(d) => d && setIssueDate(d)} />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <DatePicker value={dueDate} onChange={setDueDate} placeholder="Select due date" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
                <SelectTrigger className="h-10 w-full sm:w-40">
                  <span className="flex-1 text-left truncate">{currency}</span>
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Line Items</h2>
              <Button variant="outline" size="sm" onClick={addItem} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Item
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%] text-xs uppercase">Description</TableHead>
                    <TableHead className="text-right w-[15%] text-xs uppercase">Qty</TableHead>
                    <TableHead className="text-right w-[17%] text-xs uppercase">Unit Price</TableHead>
                    <TableHead className="text-right w-[12%] text-xs uppercase">Tax %</TableHead>
                    <TableHead className="text-right w-[13%] text-xs uppercase">Total</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="py-2 pr-2">
                        <input type="text" placeholder="Description of item/service" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full bg-transparent text-text placeholder:text-muted-foreground focus:outline-none py-1.5 text-sm" />
                      </TableCell>
                      <TableCell className="py-2 px-1">
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-transparent text-text text-right focus:outline-none py-1.5 text-sm" />
                      </TableCell>
                      <TableCell className="py-2 px-1">
                        <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-text text-right focus:outline-none py-1.5 text-sm" />
                      </TableCell>
                      <TableCell className="py-2 px-1">
                        <input type="number" min="0" max="100" step="0.1" value={item.taxRate} onChange={(e) => updateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-text text-right focus:outline-none py-1.5 text-sm" />
                      </TableCell>
                      <TableCell className="py-2 px-1 text-right font-medium text-text text-sm">{(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                      <TableCell className="py-2 pl-1">
                        <button onClick={() => removeItem(item.id)} className="p-1 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 space-y-2">
            <Label>Notes / Payment Terms</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment due within 30 days. Thank you for your business." />
          </div>
        </div>
<div className="space-y-6">
          {!isEdit && <RecurringToggle value={recurringConfig} onChange={setRecurringConfig} />}

          <div className="rounded-xl border border-border bg-surface p-6 space-y-4 sticky top-20">
            <h2 className="text-sm font-semibold text-text">Summary</h2>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Discount (flat $)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input type="number" min="0" step="0.01" placeholder="0.00" value={discount} onChange={(e) => setDiscount(e.target.value)} className="h-9 pl-7" />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-text">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Total</span>
                <span className="font-medium text-text">{fmt(taxTotal)}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{fmt(discountVal)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold text-text">Total</span>
                <span className="font-bold text-lg text-text">{fmt(total)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button className="w-full gap-1.5" onClick={() => handleSave('draft')} disabled={loading}>
                <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button variant="outline" className="w-full gap-1.5" onClick={() => handleSave('sent')} disabled={loading}>
                <Send className="h-4 w-4" /> Save & Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}