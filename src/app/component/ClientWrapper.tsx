/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// components/ClientWrapper.tsx
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDoctorStore } from '@/context/doctorStore'



interface ClientWrapperProps {
  children: React.ReactNode
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const pathname = usePathname()
  const { hydrateDoctor, isHydrated, doctor } = useDoctorStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Maximum retry attempts
  const MAX_RETRIES = 3

  const handleHydration = async () => {
    try {
      setError(null)
      setLoading(true)
      
      // Hydrate doctor from localStorage
      hydrateDoctor()
      
      // Add a small delay for smoother UX
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setLoading(false)
    } catch (err) {
      console.error('Hydration error:', err)
      setError('Failed to load profile data')
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1)
      handleHydration()
    }
  }

  useEffect(() => {
    handleHydration()
  }, [pathname]) // Re-hydrate on route changes

  // Show loading screen
  if (loading || !isHydrated) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-50/90 via-white/90 to-indigo-50/90 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ 
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className="flex flex-col items-center gap-6 p-8"
          >
            {/* Loading Spinner */}
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 w-12 h-12 border-3 border-transparent border-t-indigo-400 rounded-full"
              />
            </div>

            {/* Loading Text */}
            <div className="text-center">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-semibold text-blue-900 mb-2"
              >
                Loading Your Profile
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-blue-600"
              >
                Preparing your dashboard...
              </motion.p>
            </div>

            {/* Progress Indicators */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-32 h-1 bg-blue-200 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Show error state
  if (error) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-red-50/90 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center border border-red-200"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <AlertCircle className="w-8 h-8 text-red-600" />
            </motion.div>

            <h3 className="text-xl font-semibold text-red-900 mb-2">
              Loading Error
            </h3>
            <p className="text-red-600 mb-6 text-sm">
              {error}
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                disabled={retryCount >= MAX_RETRIES}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                {retryCount >= MAX_RETRIES ? 'Max Retries Reached' : `Retry (${retryCount}/${MAX_RETRIES})`}
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Reload Page
              </button>
            </div>

            {retryCount >= MAX_RETRIES && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-gray-500 mt-4"
              >
                If the problem persists, try clearing your browser cache or contact support.
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Render children with smooth transition
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
        
      </motion.div>
    </AnimatePresence>
    
  )
}

// Optional: Loading component for specific sections
export function SectionLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center py-12"
    >
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-blue-600 font-medium">{message}</span>
      </div>
    </motion.div>
  )
}

// Optional: Error boundary component
export function ErrorBoundary({ 
  error, 
  onRetry 
}: { 
  error: string
  onRetry: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
    >
      <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h3>
      <p className="text-red-600 mb-4 text-sm">{error}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
      >
        Try Again
      </button>
    </motion.div>
  )
}