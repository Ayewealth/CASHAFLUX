import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog'
import { useCreateClient } from './hooks'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'MXN']

interface AddClientDialogProps {
  open: boolean
  onClose: () => void
}

export function AddClientDialog({ open, onClose }: AddClientDialogProps) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [currency, setCurrency] = useState('USD')
  const createClient = useCreateClient()

  async function handleSubmit() {
    if (!name.trim()) return
    await createClient.mutateAsync({
      name: name.trim(),
      company: company.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      addressLine1: addressLine1.trim() || null,
      city: city.trim() || null,
      state: state.trim() || null,
      zip: zip.trim() || null,
      currency,
      archived: false,
    })
    setName(''); setCompany(''); setEmail(''); setPhone('')
    setAddressLine1(''); setCity(''); setState(''); setZip(''); setCurrency('USD')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Client</DialogTitle>
          <DialogDescription>Add a new client to your roster</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Client name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corp" className="h-10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="billing@company.com" className="h-10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Billing address</Label>
            <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Street address" className="h-10" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">State</Label>
              <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">ZIP</Label>
              <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="ZIP" className="h-10" />
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || createClient.isPending}>
            {createClient.isPending ? 'Adding...' : 'Add Client'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}