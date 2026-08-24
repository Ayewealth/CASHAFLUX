import { useState, useEffect, useRef } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"
import { DatePicker } from "../../components/ui/date-picker"
import { Checkbox } from "../../components/ui/checkbox"
import { useCreateExpense, useExpenseCategories, useCreateExpenseCategory, useUploadReceipt } from "./hooks"
import { toast } from "../../components/ui/toast"
import { Upload, X, FileText, Plus, ChevronDown, ChevronUp } from "lucide-react"
import type { Expense, ExpenseCategory } from "@shared/schema"

interface LogExpenseDialogProps {
  open: boolean
  onClose: () => void
  expense?: Expense | null
}

interface Allocation {
  category: string
  amount: string
}

export function LogExpenseDialog({ open, onClose, expense }: LogExpenseDialogProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [merchant, setMerchant] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [reconciled, setReconciled] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [splitEnabled, setSplitEnabled] = useState(false)
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [newCatName, setNewCatName] = useState("")
  const [showNewCat, setShowNewCat] = useState(false)
  const newCatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showNewCat) return
    function handleClickOutside(e: MouseEvent) {
      if (newCatRef.current && !newCatRef.current.contains(e.target as Node)) {
        setShowNewCat(false)
        setNewCatName("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showNewCat])

  const createExpense = useCreateExpense()
  const uploadReceipt = useUploadReceipt()
  const { data: categories } = useExpenseCategories()
  const createCategory = useCreateExpenseCategory()
  const isEdit = !!expense

  useEffect(() => {
    if (expense) {
      setDate(new Date(expense.date))
      setMerchant(expense.merchant)
      setAmount(expense.amount)
      setCategory(expense.category)
      setDescription(expense.description ?? "")
      setReconciled(expense.reconciled)
      setReceiptFile(null)
    }
  }, [expense])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setReceiptFile(file)
  }

  function handleRemoveFile() {
    setReceiptFile(null)
  }

  function resetForm() {
    setDate(new Date())
    setMerchant("")
    setAmount("")
    setCategory("")
    setDescription("")
    setReconciled(false)
    setReceiptFile(null)
    setSplitEnabled(false)
    setAllocations([])
    setNewCatName("")
    setShowNewCat(false)
  }

  function addAllocation() {
    setAllocations([...allocations, { category: "", amount: "" }])
  }

  function updateAllocation(i: number, field: keyof Allocation, value: string) {
    const copy = [...allocations]
    copy[i] = { ...copy[i], [field]: value }
    setAllocations(copy)
  }

  function removeAllocation(i: number) {
    setAllocations(allocations.filter((_, idx) => idx !== i))
  }

  const allocationSum = allocations.reduce((s, a) => s + (parseFloat(a.amount) || 0), 0)
  const totalAmount = parseFloat(amount) || 0
  const allocationValid = !splitEnabled || Math.abs(allocationSum - totalAmount) < 0.01

  async function handleSave() {
    if (!merchant.trim() || !amount || (!category && !splitEnabled)) {
      toast.add({ title: "Merchant, amount, and category are required", type: "error" })
      return
    }
    if (splitEnabled && !allocationValid) {
      toast.add({ title: "Allocations must sum to the total amount", type: "error" })
      return
    }
    try {
      const payload: Record<string, unknown> = {
        date: date.toISOString(),
        merchant: merchant.trim(),
        amount: totalAmount.toFixed(2),
        category: splitEnabled ? "Split" : category,
        description: description.trim() || null,
        reconciled,
        receiptR2Key: null,
      }

      if (splitEnabled && allocations.length > 0) {
        payload.allocations = allocations.map((a) => ({
          category: a.category,
          amount: parseFloat(a.amount).toFixed(2),
        }))
      }

      const result = await createExpense.mutateAsync(payload)

      if (receiptFile) {
        await uploadReceipt.mutateAsync({ id: result.id, file: receiptFile })
      }

      toast.add({ title: isEdit ? "Expense updated" : "Expense saved", type: "success" })
      resetForm()
      onClose()
    } catch {
      toast.add({ title: "Failed to save expense", type: "error" })
    }
  }

  const catOptions = categories ?? []

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); resetForm() } }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Expense" : "Log Expense"}</DialogTitle>
          <DialogDescription>{isEdit ? "Update this business expense" : "Record a new business expense"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Date</Label>
              <DatePicker value={date} onChange={(d) => d && setDate(d)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Category</Label>
              {splitEnabled ? (
                <div className="text-sm text-muted-foreground py-2">Split across categories (see below)</div>
              ) : (
                <>
                  <Select value={category} onValueChange={(v) => { if (v) setCategory(v); setShowNewCat(false) }}>
                    <SelectTrigger className="h-10 w-full">
                      <span className="flex-1 text-left truncate">{category || "Select category..."}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {catOptions.map((cat: ExpenseCategory) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-accent hover:bg-muted rounded"
                          onClick={(e) => { e.stopPropagation(); setShowNewCat(true) }}
                        >
                          <Plus className="h-3.5 w-3.5" /> Add custom category
                        </button>
                      </div>
                    </SelectContent>
                  </Select>
                  {showNewCat && (
                    <div ref={newCatRef} className="flex gap-2 mt-2">
                      <Input
                        placeholder="Category name"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        className="h-8"
                        disabled={!newCatName.trim()}
                        onClick={async () => {
                          await createCategory.mutateAsync({ name: newCatName.trim() })
                          setCategory(newCatName.trim())
                          setNewCatName("")
                          setShowNewCat(false)
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Merchant</Label>
            <Input placeholder="e.g. Staples, WeWork, Shell" value={merchant} onChange={(e) => setMerchant(e.target.value)} className="h-10" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-10 pl-7" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add notes about this expense..." />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Receipt <span className="text-muted-foreground font-normal">(optional)</span></Label>
            {receiptFile ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text truncate">{receiptFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(receiptFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={handleRemoveFile} className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-danger">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors bg-surface">
                <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                <span className="text-sm text-muted-foreground">Upload receipt</span>
                <span className="text-xs text-muted-foreground/60 mt-0.5">PNG, JPG or PDF</span>
                <input type="file" accept="image/png,image/jpeg,application/pdf" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>

          {/* Split expense */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <button
              type="button"
              onClick={() => setSplitEnabled(!splitEnabled)}
              className="flex items-center justify-between w-full text-sm font-medium text-text"
            >
              <span>Split across categories</span>
              {splitEnabled ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {splitEnabled && (
              <div className="space-y-3">
                {allocations.map((a, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Select value={a.category} onValueChange={(v) => v && updateAllocation(i, "category", v)}>
                        <SelectTrigger className="h-9 w-full">
                          <span className="flex-1 text-left truncate text-sm">{a.category || "Category"}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {catOptions.map((cat: ExpenseCategory) => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                      <Input
                        type="number" min="0" step="0.01" placeholder="0.00"
                        value={a.amount} onChange={(e) => updateAllocation(i, "amount", e.target.value)}
                        className="h-9 pl-5 text-sm"
                      />
                    </div>
                    {allocations.length > 1 && (
                      <button onClick={() => removeAllocation(i)} className="p-1.5 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors mt-0.5">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addAllocation} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add split
                </Button>
                {allocations.length > 0 && (
                  <p className={`text-xs ${allocationValid ? "text-success" : "text-danger"}`}>
                    Allocated: ${allocationSum.toFixed(2)} of ${totalAmount.toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={reconciled} onCheckedChange={(v) => setReconciled(v === true)} id="reconciled" />
            <Label htmlFor="reconciled" className="text-sm font-medium cursor-pointer">Mark as reconciled</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); resetForm() }}>Cancel</Button>
          <Button onClick={handleSave} disabled={createExpense.isPending || uploadReceipt.isPending}>
            {createExpense.isPending ? "Saving..." : isEdit ? "Update Expense" : "Save Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}