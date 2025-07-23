// app/layout.tsx (Server Component)
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

import Navbar from '@/app/component/Navbar'
import Footer from '@/app/component/Footer'
import ClientWrapper from '@/app/component/ClientWrapper' // 👈 We'll create this

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Schedula Health - Doctor Appointments Simplified',
  description: 'Book appointments, consult doctors, and manage your health online with ease.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-blue-50 text-gray-800 min-h-screen flex flex-col`}
      >
        <ClientWrapper>
          <Toaster position="top-center" reverseOrder={false} />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ClientWrapper>
      </body>
    </html>
  )
}
