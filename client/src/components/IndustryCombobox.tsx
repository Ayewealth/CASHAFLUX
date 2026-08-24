"use client"

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Briefcase, Plus, Loader2, Check, ChevronsUpDown } from 'lucide-react'
import { Label } from './ui/label'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from './ui/command'
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover'
import { cn } from '../lib/utils'
import { queryClient } from '../lib/queryClient'

interface Industry {
  id: string
  name: string
}

interface IndustryComboboxProps {
  value: string
  onChange: (value: string) => void
}

export function IndustryCombobox({ value, onChange }: IndustryComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { data: industries = [], isLoading } = useQuery<Industry[]>({
    queryKey: ['industries'],
    queryFn: async () => {
      const res = await fetch('/api/industries')
      if (!res.ok) throw new Error('Failed to fetch industries')
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
  })

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/industries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed to create industry')
      return res.json() as Promise<Industry>
    },
    onSuccess: (industry) => {
      queryClient.invalidateQueries({ queryKey: ['industries'] })
      onChange(industry.name)
      setOpen(false)
      setSearch('')
    },
  })

  useEffect(() => {
    if (open) setSearch('')
  }, [open])

  return (
    <div className="space-y-1.5">
      <Label htmlFor="industry-combobox" className="text-sm font-medium">Industry</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10" />
          <PopoverTrigger className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-transparent pl-10 pr-2 text-sm transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value || "Select or type an industry..."}
            </span>
            <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
          </PopoverTrigger>
        </div>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput
              placeholder="Search industries..."
              value={search}
              onValueChange={setSearch}
              className="h-10"
            />
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {!isLoading && (
                <CommandEmpty>
<button
                      type="button"
                      onClick={() => createMutation.mutate(search)}
                      disabled={createMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-accent bg-accent/10 hover:bg-accent/20 transition-colors disabled:opacity-50"
                    >
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Create "{search}"
                  </button>
                </CommandEmpty>
              )}

              <CommandGroup>
                {industries.map((industry) => (
                  <CommandItem
                    key={industry.id}
                    value={industry.name}
                    onSelect={() => {
                      onChange(industry.name)
                      setOpen(false)
                      setSearch('')
                    }}
                  >
                    <Check
                      className={cn(
                        "w-4 h-4",
                        value === industry.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {industry.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}