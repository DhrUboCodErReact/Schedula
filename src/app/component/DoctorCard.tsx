/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useBookingStore } from '@/context/useBookingStore'
import { useRouter } from 'next/navigation'
import { Star, UserCircle } from 'lucide-react'
import Image from 'next/image'

export default function DoctorCard({ doctor }: { doctor: any }) {
  const setDoctor = useBookingStore((state) => state.setDoctor)
  const router = useRouter()

  const handleBook = () => {
    setDoctor(doctor)
    router.push('/booking')
  }

  return (
    <div className="bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 shadow-md hover:shadow-xl border border-blue-200 rounded-2xl p-5 transition duration-300">
      {/* Profile Picture */}
      <div className="w-full flex justify-center mt-2">
        <div className="w-28 h-28 rounded-full border-4 border-white shadow-inner bg-gradient-to-br from-blue-200 via-white to-blue-300 flex items-center justify-center overflow-hidden">
          {doctor.image ? (
            <Image
              src={doctor.image}
              alt={doctor.name}
              width={112}
              height={112}
              className="rounded-full object-cover w-full h-full"
            />
          ) : (
            <UserCircle className="text-gray-400" size={96} />
          )}
        </div>
      </div>

      {/* Doctor Info */}
      <div className="p-4 space-y-2 text-center">
        <h2 className="text-xl font-bold text-gray-800">{doctor.name}</h2>
        <p className="text-indigo-600 font-medium">{doctor.speciality}</p>
        <p className="text-gray-600">{doctor.location}</p>
        <p className="text-green-600 font-bold text-lg">₹{doctor.price}</p>

        {/* Rating and Experience */}
        <div className="flex items-center justify-center gap-2 text-yellow-500">
          <Star size={16} fill="currentColor" />
          <span className="text-sm font-medium">
            {doctor.rating ?? '4.5'} / 5
          </span>
          <span className="text-sm text-gray-500 ml-2">
            {doctor.experience ? `${doctor.experience} yrs` : '5+ yrs'} exp
          </span>
        </div>

        {/* Availability */}
        <div className="text-sm text-gray-600">
          <p>
            <strong>Available Date:</strong>{' '}
            {doctor.availableDate || doctor.availableDates?.[0] || '2025-07-28'}
          </p>
          <p>
            <strong>Time Slot:</strong>{' '}
            {doctor.availableTime || doctor.availableTimes?.[0] || '10:00 AM - 1:00 PM'}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleBook}
          className="mt-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
        >
          Book Appointment
        </button>
      </div>
    </div>
  )
}

