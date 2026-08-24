import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog'
import { useCreateBankAccount } from './hooks'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'MXN']

interface AddBankAccountDialogProps {
  open: boolean
  onClose: () => void
}

export function AddBankAccountDialog({ open, onClose }: AddBankAccountDialogProps) {
  const [name, setName] = useState('')
  const [bankName, setBankName] = useState('')
  const [type, setType] = useState('checking')
  const [currency, setCurrency] = useState('USD')
  const [currentBalance, setCurrentBalance] = useState('')
  const createAccount = useCreateBankAccount()

  async function handleSubmit() {
    if (!name.trim()) return
    await createAccount.mutateAsync({
      name: name.trim(),
      bankName: bankName.trim() || null,
      type: type as 'checking' | 'savings' | 'credit_card',
      currency,
      currentBalance: currentBalance || '0',
    })
    setName('')
    setBankName('')
    setType('checking')
    setCurrency('USD')
    setCurrentBalance('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
          <DialogDescription>Add a new bank or credit card account</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Account name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Business Checking" className="h-10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Bank name</Label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Chase" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Account type</Label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger className="h-10 w-full">
                  <span className="flex-1 text-left truncate">{type.replace('_', ' ')}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Currency</Label>
            <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
              <SelectTrigger className="h-10 w-full sm:w-40">
                <span className="flex-1 text-left truncate">{currency}</span>
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Starting balance (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input type="number" min="0" step="0.01" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} placeholder="0.00" className="h-10 pl-7" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || createAccount.isPending}>
            {createAccount.isPending ? 'Adding...' : 'Add Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}