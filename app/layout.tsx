import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'StudentHub — Modern Knowledge & Study Workspace',
    template: '%s | StudentHub',
  },
  description: 'A modern, GitHub-inspired productivity and knowledge platform for students to organize, share, and collaborate.',
  keywords: ['studenthub', 'study notes', 'notebooks', 'education', 'collaboration', 'knowledge sharing'],
  authors: [{ name: 'StudentHub' }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-background text-text antialiased min-h-screen flex flex-col font-sans">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#FFFFFF',
                color: '#0F172A',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                fontSize: '14px',
                fontWeight: 500,
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
                padding: '12px 16px',
              },
              success: { iconTheme: { primary: '#10B981', secondary: '#FFFFFF' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
