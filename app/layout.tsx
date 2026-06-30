import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Slektstre – Simen Hustad',
  description: 'Seks generasjoner: Hustad / Husberg / Simensen / Werner',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body>{children}</body>
    </html>
  )
}
