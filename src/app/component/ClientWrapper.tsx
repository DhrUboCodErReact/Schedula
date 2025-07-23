'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)

    const timeout = setTimeout(() => {
      setLoading(false)
    }, 500) // simulate route change time or loader delay

    return () => clearTimeout(timeout)
  }, [pathname])

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-sm flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-blue-600 font-medium text-lg">Loading...</span>
          </motion.div>
        </div>
      )}
      {children}
    </>
  )
}
