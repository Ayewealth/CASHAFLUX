import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Invoice, InvoiceLineItem } from '@shared/schema'

export interface InvoiceWithClient extends Invoice {
  clientName: string
  clientCompany: string | null
  clientEmail: string | null
}

export interface InvoiceWithLineItems extends Invoice {
  lineItems: InvoiceLineItem[]
}

export interface CreateInvoicePayload {
  clientId: string
  invoiceNumber: string
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate: string
  currency?: string
  subtotal: string
  taxTotal: string
  discount?: string | null
  total: string
  notes?: string | null
  logoR2Key?: string | null
  lineItems?: {
    description: string
    quantity: number
    unitPrice: string
    taxRate: string
    total: string
  }[]
}

async function fetchInvoices(filters?: { status?: string; clientId?: string; dateFrom?: string; dateTo?: string }): Promise<InvoiceWithClient[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.clientId) params.set('clientId', filters.clientId)
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.set('dateTo', filters.dateTo)
  const query = params.toString()
  const res = await fetch(`/api/invoices${query ? `?${query}` : ''}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch invoices')
  }
  return res.json()
}

async function fetchInvoice(id: string): Promise<InvoiceWithLineItems> {
  const res = await fetch(`/api/invoices/${id}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to fetch invoice')
  }
  return res.json()
}

async function createInvoice(data: CreateInvoicePayload): Promise<InvoiceWithLineItems> {
  const res = await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to create invoice')
  }
  return res.json()
}

async function updateInvoice({ id, ...data }: Partial<Invoice> & CreateInvoicePayload & { id: string }): Promise<InvoiceWithLineItems> {
  const res = await fetch(`/api/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to update invoice')
  }
  return res.json()
}

async function deleteInvoice(id: string): Promise<void> {
  const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to delete invoice')
  }
}

export function useInvoices(filters?: { status?: string; clientId?: string; dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => fetchInvoices(filters),
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => fetchInvoice(id),
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] })
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

async function markPaid(id: string): Promise<void> {
  const res = await fetch(`/api/invoices/${id}/mark-paid`, { method: 'POST' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to mark invoice as paid')
  }
}

async function sendInvoice({ id }: { id: string }): Promise<void> {
  const res = await fetch(`/api/invoices/${id}/send`, { method: 'POST' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to send invoice')
  }
}

export function useMarkPaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useSendInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export interface CreateRecurringInvoicePayload {
  templateInvoiceId: string
  frequency: string
  nextDate: string
  endDate?: string | null
}

async function createRecurringInvoice(data: CreateRecurringInvoicePayload) {
  const res = await fetch('/api/recurring-invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to create recurring invoice')
  }
  return res.json()
}

export function useCreateRecurringInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRecurringInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-invoices'] })
    },
  })
}