'use client'

export async function generateInvoicePDF(data: any): Promise<void> {
  // Load jsPDF from CDN to avoid bundler issues
  if (!(window as any).jspdf) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      s.onload = () => resolve()
      s.onerror = reject
      document.head.appendChild(s)
    })
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
      s.onload = () => resolve()
      s.onerror = reject
      document.head.appendChild(s)
    })
  }

  const { jsPDF } = (window as any).jspdf
  const { formatCurrency, formatDate } = await import('@/lib/utils')
  // ... rest of your existing PDF generation code unchanged,
  // just replace:  new jsPDF(...)  →  new jsPDF(...)  (same, works from window.jspdf)