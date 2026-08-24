import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog'
import { DatePicker } from '../../components/ui/date-picker'
import { useCreateBankTransaction } from '../bank-transactions/hooks'
import { toast } from '../../components/ui/toast'

interface AddBankTransactionDialogProps {
  open: boolean
  onClose: () => void
  bankAccountId: string
}

export function AddBankTransactionDialog({ open, onClose, bankAccountId }: AddBankTransactionDialogProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'debit' | 'credit'>('debit')
  const createTransaction = useCreateBankTransaction()

  function resetForm() {
    setDate(new Date())
    setDescription('')
    setAmount('')
    setType('debit')
  }

  async function handleSubmit() {
    if (!description.trim() || !amount) {
      toast.add({ title: 'Description and amount are required', type: 'error' })
      return
    }
    await createTransaction.mutateAsync({
      bankAccountId,
      date: date.toISOString(),
      description: description.trim(),
      amount: parseFloat(amount).toFixed(2),
      type,
      reconciled: false,
    })
    toast.add({ title: 'Transaction added', type: 'success' })
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); resetForm() } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Record a manual transaction</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Date</Label>
            <DatePicker value={date} onChange={(d) => d && setDate(d)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description</Label>
            <Input placeholder="e.g. Office supplies" value={description} onChange={(e) => setDescription(e.target.value)} className="h-10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-10 pl-7" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Type</Label>
              <Select value={type} onValueChange={(v) => v && setType(v as 'debit' | 'credit')}>
                <SelectTrigger className="h-10 w-full">
                  <span className="flex-1 text-left truncate">{type === 'debit' ? 'Debit (out)' : 'Credit (in)'}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Debit (out)</SelectItem>
                  <SelectItem value="credit">Credit (in)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); resetForm() }}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!description.trim() || !amount || createTransaction.isPending}>
            {createTransaction.isPending ? 'Adding...' : 'Add Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}