import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"
import { DatePicker } from "../../components/ui/date-picker"
import { useCreateMileageLog } from "./hooks"
import { toast } from "../../components/ui/toast"

interface LogTripDialogProps {
  open: boolean
  onClose: () => void
}

const IRS_RATE = 0.70

export function LogTripDialog({ open, onClose }: LogTripDialogProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [miles, setMiles] = useState("")
  const [purpose, setPurpose] = useState("")
  const createMileage = useCreateMileageLog()

  function resetForm() {
    setDate(new Date())
    setOrigin("")
    setDestination("")
    setMiles("")
    setPurpose("")
  }

  const milesNum = parseFloat(miles) || 0
  const deduction = milesNum * IRS_RATE

  async function handleSave() {
    if (!origin.trim() || !destination.trim() || !miles) {
      toast.add({ title: "Origin, destination, and miles are required", type: "error" })
      return
    }
    try {
      await createMileage.mutateAsync({
        date: date.toISOString(),
        origin: origin.trim(),
        destination: destination.trim(),
        miles: milesNum.toFixed(1),
        purpose: purpose.trim() || null,
      })
      toast.add({ title: "Trip logged", type: "success" })
      resetForm()
      onClose()
    } catch {
      toast.add({ title: "Failed to log trip", type: "error" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); resetForm() } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Trip</DialogTitle>
          <DialogDescription>Record a business mileage trip</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Date</Label>
            <DatePicker value={date} onChange={(d) => d && setDate(d)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Origin</Label>
              <Input placeholder="e.g. 123 Main St" value={origin} onChange={(e) => setOrigin(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Destination</Label>
              <Input placeholder="e.g. 456 Oak Ave" value={destination} onChange={(e) => setDestination(e.target.value)} className="h-10" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Miles</Label>
            <Input type="number" min="0" step="0.1" placeholder="0.0" value={miles} onChange={(e) => setMiles(e.target.value)} className="h-10" />
          </div>

          {milesNum > 0 && (
            <div className="rounded-xl border border-border bg-surface p-3 text-sm">
              <div className="flex justify-between text-text">
                <span className="text-muted-foreground">IRS rate (2025)</span>
                <span>${IRS_RATE.toFixed(2)}/mi</span>
              </div>
              <div className="flex justify-between font-medium text-text mt-1">
                <span>Estimated deduction</span>
                <span className="text-success">${deduction.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Purpose <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Client meeting at downtown office" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); resetForm() }}>Cancel</Button>
          <Button onClick={handleSave} disabled={createMileage.isPending}>
            {createMileage.isPending ? "Saving..." : "Log Trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}