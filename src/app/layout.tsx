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
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
