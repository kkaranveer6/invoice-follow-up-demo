import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { DM_Sans, Source_Sans_3 } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Invoice Follow-Up',
  description: 'Automated invoice reminder system',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${dmSans.variable} ${sourceSans.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
