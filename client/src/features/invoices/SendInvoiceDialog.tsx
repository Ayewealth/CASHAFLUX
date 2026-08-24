import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog'
import { useSendInvoice } from './hooks'
import { toast } from '../../components/ui/toast'

interface SendInvoiceDialogProps {
  open: boolean
  onClose: () => void
  invoiceId: string
  invoiceNumber: string
  clientEmail?: string | null
  clientName?: string
  orgName?: string
}

export function SendInvoiceDialog({ open, onClose, invoiceId, invoiceNumber, clientEmail, clientName, orgName }: SendInvoiceDialogProps) {
  const [to, setTo] = useState(clientEmail ?? '')
  const [subject, setSubject] = useState(`Invoice ${invoiceNumber} from ${orgName ?? 'Your Business'}`)
  const [body, setBody] = useState(`Hi ${clientName ?? 'there'},\n\nPlease find attached invoice ${invoiceNumber} for your records.\n\nThank you for your business!`)
  const sendInvoice = useSendInvoice()

  async function handleSend() {
    if (!to.trim()) {
      toast.add({ title: 'Recipient email is required', type: 'error' })
      return
    }
    try {
      await sendInvoice.mutateAsync({ id: invoiceId })
      toast.add({ title: 'Invoice sent successfully', type: 'success' })
      onClose()
    } catch {
      toast.add({ title: 'Failed to send invoice', type: 'error' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Invoice {invoiceNumber}</DialogTitle>
          <DialogDescription>The invoice will be emailed to the client</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">To</Label>
            <Input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="client@company.com" className="h-10" />
            {!clientEmail && <p className="text-xs text-warning">This client has no email address on file</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Message</Label>
            <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            A PDF of the invoice will be attached automatically.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} disabled={!to.trim() || sendInvoice.isPending}>
            {sendInvoice.isPending ? 'Sending...' : 'Send Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}