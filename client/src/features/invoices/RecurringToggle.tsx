import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../../components/ui/select'
import { DatePicker } from '../../components/ui/date-picker'
import { Label } from '../../components/ui/label'
import { Switch } from '@base-ui/react/switch'

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
]

export interface RecurringConfig {
  enabled: boolean
  frequency: string
  endDate: Date | undefined
}

interface RecurringToggleProps {
  value: RecurringConfig
  onChange: (config: RecurringConfig) => void
}

export function RecurringToggle({ value, onChange }: RecurringToggleProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Make this recurring</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Automatically generate invoices on a schedule</p>
        </div>
        <Switch.Root
          checked={value.enabled}
          onCheckedChange={(v) => onChange({ ...value, enabled: v })}
          className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors data-[checked]:bg-accent bg-muted cursor-pointer"
        >
          <Switch.Thumb className="inline-block h-4 w-4 rounded-full bg-white transition-transform data-[checked]:translate-x-4 translate-x-0.5" />
        </Switch.Root>
      </div>
      {value.enabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Frequency</Label>
            <Select value={value.frequency} onValueChange={(v) => v && onChange({ ...value, frequency: v })}>
              <SelectTrigger className="h-9 w-full">
                <span className="flex-1 text-left truncate text-sm">{FREQUENCIES.find((f) => f.value === value.frequency)?.label ?? 'Select...'}</span>
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">End date <span className="font-normal">(optional)</span></Label>
            <DatePicker value={value.endDate} onChange={(d) => onChange({ ...value, endDate: d })} placeholder="No end date" />
          </div>
        </div>
      )}
    </div>
  )
}