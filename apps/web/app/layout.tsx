import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
 
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})
 
export const metadata: Metadata = {
  title: 'PracaTymczasowa – Znajdź pracę tymczasową',
  description: 'Platforma łącząca pracowników z pracodawcami oferującymi pracę tymczasową.',
}
 
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}