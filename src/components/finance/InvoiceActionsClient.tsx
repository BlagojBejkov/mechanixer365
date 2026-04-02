'use client'
import dynamic from 'next/dynamic'

const InvoiceActions = dynamic(() => import('./InvoiceActions'), { ssr: false })

export default InvoiceActions
