'use client'

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

async function loadJsPDF(): Promise<void> {
    if ((window as any).jspdf) return
    await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
          s.onload = () => resolve()
          s.onerror = () => reject(new Error('Failed to load jsPDF'))
          document.head.appendChild(s)
    })
    await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
          s.onload = () => resolve()
          s.onerror = () => reject(new Error('Failed to load autotable'))
          document.head.appendChild(s)
    })
}

export async function generateInvoicePDF(data: InvoicePDFData): Promise<void> {
    await loadJsPDF()

  const { jsPDF } = (window as any).jspdf
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const W = 210
    const margin = 20

  const fmt = (n: number) => {
        const sym = data.currency === 'EUR' ? '€' : data.currency === 'GBP' ? '£' : '$'
        return sym + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
    const fmtDate = (d: Date) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  // Header
  doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.setTextColor(15, 15, 15)
    doc.text('INVOICE', margin, 28)

  doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(data.number, margin, 36)

  // Company info (right side)
  doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(15, 15, 15)
    doc.text('Mechanixer Engineering Studio', W - margin, 22, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text('contact@mechanixer.com', W - margin, 28, { align: 'right' })

  // Divider
  doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.3)
    doc.line(margin, 42, W - margin, 42)

  // Bill To
  let y = 52
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(130, 130, 130)
    doc.text('BILL TO', margin, y)
    y += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(15, 15, 15)
    doc.text(data.client.companyName, margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text(data.client.contactName, margin, y)
    y += 4
    doc.text(data.client.contactEmail, margin, y)
    if (data.client.billingAddress) {
          y += 4
          doc.text(data.client.billingAddress, margin, y)
    }
    if (data.client.vatNumber) {
          y += 4
          doc.text('VAT: ' + data.client.vatNumber, margin, y)
    }

  // Dates (right side)
  const dateX = W - margin
    let dy = 52
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(130, 130, 130)
    doc.text('ISSUE DATE', dateX, dy, { align: 'right' })
    dy += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(15, 15, 15)
    doc.text(fmtDate(data.issueDate), dateX, dy, { align: 'right' })
    dy += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(130, 130, 130)
    doc.text('DUE DATE', dateX, dy, { align: 'right' })
    dy += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(15, 15, 15)
    doc.text(fmtDate(data.dueDate), dateX, dy, { align: 'right' })

  // Project title
  y = Math.max(y, dy) + 12
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(130, 130, 130)
    doc.text('PROJECT', margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(15, 15, 15)
    doc.text(data.title, margin, y)
    y += 10

  // Line items table
  const tableBody = data.lineItems.map(li => [
        li.description,
        li.quantity.toString(),
        li.unit,
        fmt(li.unitPrice),
        fmt(li.total),
      ])

  ;(doc as any).autoTable({
        startY: y,
        head: [['Description', 'Qty', 'Unit', 'Unit Price', 'Total']],
        body: tableBody,
        margin: { left: margin, right: margin },
        headStyles: {
                fillColor: [15, 15, 15],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
        },
        bodyStyles: { fontSize: 9, textColor: [40, 40, 40] },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: {
                0: { cellWidth: 'auto' },
                1: { halign: 'center', cellWidth: 18 },
                2: { halign: 'center', cellWidth: 18 },
                3: { halign: 'right', cellWidth: 28 },
                4: { halign: 'right', cellWidth: 28 },
        },
  })

  y = (doc as any).lastAutoTable.finalY + 8

  // Totals
  const totX = W - margin
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text('Subtotal', totX - 40, y)
    doc.text(fmt(data.subtotal), totX, y, { align: 'right' })
    y += 5
    doc.text('Tax', totX - 40, y)
    doc.text(fmt(data.tax), totX, y, { align: 'right' })
    y += 2
    doc.setDrawColor(180, 180, 180)
    doc.line(totX - 60, y, totX, y)
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(15, 15, 15)
    doc.text('Total', totX - 40, y)
    doc.text(fmt(data.total), totX, y, { align: 'right' })
    y += 12

  // Notes / Terms
  if (data.notes) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(130, 130, 130)
        doc.text('NOTES', margin, y)
        y += 5
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(60, 60, 60)
        const noteLines = doc.splitTextToSize(data.notes, W - margin * 2)
        doc.text(noteLines, margin, y)
        y += noteLines.length * 4 + 6
  }

  if (data.terms) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(130, 130, 130)
        doc.text('TERMS', margin, y)
        y += 5
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(60, 60, 60)
        const termLines = doc.splitTextToSize(data.terms, W - margin * 2)
        doc.text(termLines, margin, y)
  }

  doc.save(data.number + '.pdf')
}
