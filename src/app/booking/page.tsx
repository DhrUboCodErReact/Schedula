'use client'

import { useBookingStore } from '@/context/useBookingStore'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function DoctorBookingForm() {
  const {
    selectedDoctor,
    selectedDate,
    selectedTime,
    setDate,
    setTime,
    resetBooking,
  } = useBookingStore()

  const router = useRouter()
  const [parsedDate, setParsedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (selectedDate) {
      setParsedDate(new Date(selectedDate))
    }
  }, [selectedDate])

  if (!selectedDoctor) {
    return (
      <div className="text-center py-10 text-lg text-blue-700 font-medium">
        Please select a doctor to proceed with booking.
      </div>
    )
  }

  const availableDateOptions = selectedDoctor.availableDates.map((d) => new Date(d))

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time.')
      return
    }

    // ✅ Get logged-in user ID from localStorage
    const userId = localStorage.getItem('userId')
    if (!userId) {
      toast.error('User not logged in.')
      return
    }

    const newAppointment = {
      doctorId: selectedDoctor.id,
      date: selectedDate,
      time: selectedTime,
      userId, // ✅ Include userId in appointment
    }

    try {
      const res = await fetch('http://localhost:3001/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAppointment),
      })

      if (!res.ok) {
        throw new Error('Failed to book appointment')
      }

      toast.success(`Booking confirmed with ${selectedDoctor.name}`)

      setTimeout(() => {
        resetBooking()
        router.push('/my-appointments')
      }, 1500)
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong while booking.')
    }
  }

  return (
    <div className="min-h-screen bg-white px-6 py-12 flex flex-col lg:flex-row items-start justify-center gap-10">
      {/* LEFT: Doctor Info & Terms */}
      <div className="max-w-2xl text-blue-900 space-y-6">
        <h1 className="text-4xl font-extrabold">Consult Dr. {selectedDoctor.name}</h1>
        <p className="text-lg leading-relaxed">
          Dr. {selectedDoctor.name} is a highly experienced and board-certified expert in <strong>{selectedDoctor.speciality}</strong>. 
          With over 10 years of medical practice, they are known for their evidence-based approach, accurate diagnosis,
          and patient-first attitude. Book your appointment now for a trusted, compassionate consultation.
        </p>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Clinic & Services</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Located in {selectedDoctor.location}</li>
            <li>Consultation fee: ₹{selectedDoctor.price}</li>
            <li>Teleconsultation available on request</li>
            <li>Friendly bilingual support staff</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mt-6">Appointment Policy</h3>
          <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
            <li>Free rescheduling within 24 hours</li>
            <li>Arrive 10 mins early with ID & medical documents</li>
            <li>Late arrivals beyond 15 mins will be marked as no-show</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mt-6">Privacy & Consent</h3>
          <p className="text-sm">
            Your medical data is stored securely and used only for the purpose of your treatment. By booking this
            appointment, you agree to our clinic’s privacy policy and terms of care.
          </p>
        </div>
      </div>

      {/* RIGHT: Booking Form */}
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-blue-100">
        <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">
          Book Your Appointment
        </h2>

        <div className="space-y-6">
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-2">
              Appointment Date
            </label>
            <DatePicker
              selected={parsedDate}
              onChange={(date: Date | null) => {
                const formatted = date ? date.toISOString().split('T')[0] : ''
                setParsedDate(date)
                setDate(formatted)
                setTime('')
              }}
              includeDates={availableDateOptions}
              dateFormat="dd/MM/yyyy"
              placeholderText="Choose available date"
              className="w-full p-3 border border-blue-200 rounded-lg shadow-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Time Dropdown */}
          {selectedDate && (() => {
            const index = selectedDoctor.availableDates.findIndex((d) => d === selectedDate)
            const timeSlot = index !== -1 ? selectedDoctor.availableTimes[index] : null

            if (!timeSlot) return null

            return (
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Time Slot
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-3 border border-blue-200 rounded-lg shadow-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">-- Select Time --</option>
                  <option value={timeSlot}>{timeSlot}</option>
                </select>
              </div>
            )
          })()}

          {/* Confirm Button */}
          <button
            onClick={handleBooking}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  )
}
