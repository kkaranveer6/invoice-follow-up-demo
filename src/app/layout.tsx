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
    <html lang="en">
      <body className={`${dmSans.variable} ${sourceSans.variable} antialiased`}>
        <div style={{
          background: '#0ea5e9',
          color: '#fff',
          textAlign: 'center',
          padding: '8px',
          fontSize: '13px',
          fontWeight: 500,
        }}>
          Demo mode — all data is fictional.{' '}
          <a
            href="https://github.com/kkaranveer6/invoice-follow-up-demo"
            style={{ color: '#fff', textDecoration: 'underline' }}
          >
            View source on GitHub
          </a>
        </div>
        {children}
      </body>
    </html>
  )
}
