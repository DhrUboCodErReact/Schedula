'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DoctorBookingForm from '@/app/component/DoctorBookingForm' // Adjust path as needed

export default function BookingPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const loggedIn = localStorage.getItem('loggedIn') === 'true'
    if (!loggedIn) {
      router.push('/login')
      return
    }
  }, [router])

  return (
     <div>

      {/* Booking Form */}
      <DoctorBookingForm />
    </div>
  )
}