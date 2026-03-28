import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s · Mechanixer 365',
    default: 'Mechanixer 365',
  },
  description: 'Internal operating system for Mechanixer Engineering Studio',
  robots: 'noindex, nofollow', // private system — never index
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="antialiased">{children}</body>
    </html>
  )
}
