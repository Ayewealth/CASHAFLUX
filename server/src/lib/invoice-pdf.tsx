import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import type { Organization, Client, Invoice, InvoiceLineItem } from '@shared/schema'

const styles: Record<string, any> = {
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E3A5F', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#6B7280', marginBottom: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase' as const, marginBottom: 8, letterSpacing: 1 },
  row: { flexDirection: 'row' as const },
  col: { flex: 1 },
  tableHeader: { flexDirection: 'row' as const, borderBottom: '1 solid #E5E7EB', paddingBottom: 6, marginBottom: 6 },
  tableHeaderCell: { fontSize: 8, fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase' as const },
  tableRow: { flexDirection: 'row' as const, paddingVertical: 4, borderBottom: '1 solid #F3F4F6' },
  tableCell: { fontSize: 9 },
  totalRow: { flexDirection: 'row' as const, justifyContent: 'flex-end' as const, marginTop: 8, paddingTop: 8, borderTop: '1 solid #E5E7EB' },
  totalLabel: { fontSize: 10, color: '#6B7280', marginRight: 40 },
  totalValue: { fontSize: 14, fontWeight: 'bold' },
  notes: { marginTop: 32, padding: 12, backgroundColor: '#F9FAFB', fontSize: 9, color: '#6B7280' },
  status: { marginTop: 8, padding: '4 12', backgroundColor: '#2563EB', color: 'white', fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' as const, alignSelf: 'flex-start' as const, borderRadius: 4 },
}

function fmt(n: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(n))
}

interface InvoicePDFProps {
  invoice: Invoice
  lineItems: InvoiceLineItem[]
  client: Client | null | undefined
  org: Organization | null | undefined
}

export function InvoicePDF({ invoice, lineItems, client, org }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{org?.name ?? 'Business'}</Text>
          <Text style={styles.subtitle}>{[org?.addressLine1, org?.city, org?.state, org?.zip].filter(Boolean).join(', ')}</Text>
          <Text style={styles.subtitle}>{org?.phone}</Text>
          <Text style={[styles.status, { backgroundColor: invoice.status === 'paid' ? '#16A34A' : invoice.status === 'overdue' ? '#DC2626' : '#2563EB', marginTop: 12 }]}>{invoice.status.toUpperCase()}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.sectionTitle}>Bill To</Text>
              <Text style={{ fontSize: 10, marginBottom: 2 }}>{client?.name}</Text>
              <Text style={{ fontSize: 9, color: '#6B7280' }}>{client?.company}</Text>
              <Text style={{ fontSize: 9, color: '#6B7280' }}>{client?.email}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.sectionTitle}>Invoice</Text>
              <Text style={{ fontSize: 10, marginBottom: 2 }}>{invoice.invoiceNumber}</Text>
              <Text style={{ fontSize: 9, color: '#6B7280' }}>Issue: {new Date(invoice.issueDate).toLocaleDateString()}</Text>
              <Text style={{ fontSize: 9, color: '#6B7280' }}>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Line Items</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Description</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.5, textAlign: 'right' }]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: 'right' }]}>Unit Price</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.5, textAlign: 'right' }]}>Tax</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: 'right' }]}>Total</Text>
          </View>
          {lineItems.map((li, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{li.description}</Text>
              <Text style={[styles.tableCell, { flex: 0.5, textAlign: 'right' }]}>{li.quantity}</Text>
              <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'right' }]}>{fmt(li.unitPrice)}</Text>
              <Text style={[styles.tableCell, { flex: 0.5, textAlign: 'right' }]}>{li.taxRate}%</Text>
              <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'right' }]}>{fmt(li.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={{ fontSize: 10 }}>{fmt(invoice.subtotal)}</Text>
        </View>
        <View style={[styles.totalRow, { borderTopWidth: 0, marginTop: 0, paddingTop: 2 }]}>
          <Text style={styles.totalLabel}>Tax</Text>
          <Text style={{ fontSize: 10 }}>{fmt(invoice.taxTotal)}</Text>
        </View>
        {invoice.discount && parseFloat(invoice.discount) > 0 && (
          <View style={[styles.totalRow, { borderTopWidth: 0, marginTop: 0, paddingTop: 2 }]}>
            <Text style={styles.totalLabel}>Discount</Text>
            <Text style={{ fontSize: 10, color: '#16A34A' }}>-{fmt(invoice.discount)}</Text>
          </View>
        )}
        <View style={[styles.totalRow, { borderTopWidth: 2, borderTopColor: '#1E3A5F' }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{fmt(invoice.total)}</Text>
        </View>

        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>Notes</Text>
            <Text style={{ fontSize: 9 }}>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}