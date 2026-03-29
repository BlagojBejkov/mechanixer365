import { formatCurrency, formatDate } from '@/lib/utils'

interface InvoicePDFData {
  number: string
  title: string
  issueDate: Date
  dueDate: Date
  client: {
    companyName: string
    contactName: string
    contactEmail: string
    billingAddress?: string
    vatNumber?: string
  }
  lineItems: {
    description: string
    quantity: number
    unit: string
    unitPrice: number
    total: number
  }[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  terms?: string
  currency: string
}

export async function generateInvoicePDF(data: InvoicePDFData): Promise<void> {
  // Dynamic imports — browser-only, never runs on the server
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 20

  // ── Header ────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(15, 15, 20)
  doc.text('MECHANIXER', margin, 28)

  // Accent line
  doc.setDrawColor(61, 142, 240)
  doc.setLineWidth(0.5)
  doc.line(margin, 32, W - margin, 32)

  // Invoice label + number (top right)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(107, 107, 122)
  doc.text('INVOICE', W - margin, 24, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(15, 15, 20)
  doc.text(data.number, W - margin, 30, { align: 'right' })

  // ── Addresses ──────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(107, 107, 122)
  doc.text('FROM', margin, 46)
  doc.text('TO', 110, 46)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(30, 30, 36)

  const from = [
    'Mechanixer Engineering Studio',
    'blagoj@mechanixer.com',
    'mechanixer.com',
  ]
  from.forEach((line, i) => doc.text(line, margin, 52 + i * 5))

  const to = [
    data.client.companyName,
    data.client.contactName,
    data.client.contactEmail,
    ...(data.client.billingAddress ? [data.client.billingAddress] : []),
    ...(data.client.vatNumber ? [`VAT: ${data.client.vatNumber}`] : []),
  ]
  to.forEach((line, i) => doc.text(line, 110, 52 + i * 5))

  // ── Dates ──────────────────────────────────────────
  const dateY = 80
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(107, 107, 122)
  doc.text('ISSUE DATE', margin, dateY)
  doc.text('DUE DATE', margin + 50, dateY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(30, 30, 36)
  doc.text(formatDate(data.issueDate, 'MMMM d, yyyy'), margin, dateY + 5)
  doc.text(formatDate(data.dueDate, 'MMMM d, yyyy'), margin + 50, dateY + 5)

  // ── Line items table ───────────────────────────────
  autoTable(doc, {
    startY: 96,
    margin: { left: margin, right: margin },
    head: [['Description', 'Qty', 'Unit', 'Unit Price', 'Total']],
    body: data.lineItems.map(li => [
      li.description,
      li.quantity.toString(),
      li.unit,
      formatCurrency(li.unitPrice, data.currency),
      formatCurrency(li.total, data.currency),
    ]),
    headStyles: {
      fillColor: [22, 22, 26],
      textColor: [200, 200, 212],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 60] },
    alternateRowStyles: { fillColor: [245, 245, 248] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right', cellWidth: 15 },
      2: { cellWidth: 15 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 28 },
    },
    theme: 'striped',
  })

  const finalY = (doc as any).lastAutoTable.finalY + 8

  // ── Totals ─────────────────────────────────────────
  const totalsX = W - margin - 70
  let tY = finalY

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(107, 107, 122)
  doc.text('Subtotal', totalsX, tY)
  doc.setTextColor(30, 30, 36)
  doc.text(formatCurrency(data.subtotal, data.currency), W - margin, tY, { align: 'right' })

  if (data.tax > 0) {
    tY += 6
    doc.setTextColor(107, 107, 122)
    doc.text('Tax', totalsX, tY)
    doc.setTextColor(30, 30, 36)
    doc.text(formatCurrency(data.tax, data.currency), W - margin, tY, { align: 'right' })
  }

  tY += 8
  doc.setDrawColor(200, 200, 212)
  doc.setLineWidth(0.3)
  doc.line(totalsX, tY - 3, W - margin, tY - 3)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(15, 15, 20)
  doc.text('Total', totalsX, tY + 2)
  doc.setTextColor(61, 142, 240)
  doc.text(formatCurrency(data.total, data.currency), W - margin, tY + 2, { align: 'right' })

  // ── Notes / Terms ──────────────────────────────────
  if (data.notes || data.terms) {
    const notesY = tY + 20
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(107, 107, 122)
    if (data.notes) {
      doc.text('NOTES', margin, notesY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(80, 80, 90)
      doc.text(data.notes, margin, notesY + 4, { maxWidth: W - margin * 2 })
    }
    if (data.terms) {
      const termsY = notesY + (data.notes ? 14 : 0)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(107, 107, 122)
      doc.text('PAYMENT TERMS', margin, termsY)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 90)
      doc.text(data.terms, margin, termsY + 4, { maxWidth: W - margin * 2 })
    }
  }

  // ── Footer ─────────────────────────────────────────
  doc.setDrawColor(42, 42, 50)
  doc.setLineWidth(0.3)
  doc.line(margin, 280, W - margin, 280)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(107, 107, 122)
  doc.text('Mechanixer Engineering Studio · mechanixer.com', W / 2, 285, { align: 'center' })

  doc.save(`${data.number}.pdf`)
}
