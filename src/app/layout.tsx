import { Inter } from 'next/font/google'
import './globals.css'
import { Metadata } from 'next'
import AuthWrapper from '@/components/AuthWrapper'
import { AlertProvider } from '@/components/AlertProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Farid Fashion Store - Premium Streetwear & Fashion',
  description: 'Discover exclusive streetwear and fashion pieces from top brands. High-quality clothing, accessories, and unique designs.',
  keywords: 'streetwear, fashion, clothing, accessories, premium, exclusive',
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={inter.className}>
        <AlertProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </AlertProvider>
      </body>
    </html>
  )
}
