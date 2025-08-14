/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
'use client'

import { useBookingStore } from '@/context/useBookingStore'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import PaymentFlow from './PaymentFlow'
import { Clock, Calendar, User, MapPin, Star, IndianRupee, Users, UserCheck } from 'lucide-react'

// Enhanced appointment slot interface
interface AppointmentSlot {
  date: string
  startTime: string
  endTime: string
  slotDuration: number
  totalSlots: number
  bookedSlots: string[]
  slotType: 'wave' | 'stream'
  maxPatients?: number
  availableSlots: string[]
  dayOfWeek: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Enhanced Doctor interface
interface Doctor {
  id: string
  name: string
  speciality: string
  location: string
  price: number
  rating: number
  experience: string
  availableDates: string[]
  availableTimes: string[]
  appointmentSlots?: AppointmentSlot[]
}

export default function DoctorBookingForm() {
  const {
    selectedDoctor,
    selectedDate,
    selectedTime,
    setDate,
    setTime,
    resetBooking,
    getCurrentBookingInfo,
  } = useBookingStore()

  const [parsedDate, setParsedDate] = useState<Date | null>(null)
  const [showPaymentFlow, setShowPaymentFlow] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<{
    slot: AppointmentSlot
    timeSlot: string
  } | null>(null)
  const [slotAvailability, setSlotAvailability] = useState<{[key: string]: {available: number, total: number, type: string}}>({})

  useEffect(() => {
    if (selectedDate) {
      setParsedDate(new Date(selectedDate))
    }
  }, [selectedDate])

  // Debug logging
  useEffect(() => {
    if (selectedDoctor) {
      console.log('🔍 Booking Page - Selected Doctor:', selectedDoctor)
      console.log('🔍 Appointment Slots:', selectedDoctor.appointmentSlots)
    }
  }, [selectedDoctor])

  // Get appointment slots for a specific date
const getAppointmentSlotsForDate = (dateStr: string): AppointmentSlot[] => {
  if (!selectedDoctor?.appointmentSlots) return []

  return selectedDoctor.appointmentSlots.filter((slot: { date: string; isActive: any }) =>
    slot.date === dateStr && slot.isActive
  )
}


  // Get available time slots for the selected date with real-time availability
  const getAvailableTimeSlotsForDate = (dateStr: string): string[] => {
    const appointmentSlots = getAppointmentSlotsForDate(dateStr)
    const availabilityMap: {[key: string]: {available: number, total: number, type: string}} = {}
    const allAvailableTimeSlots: string[] = []
    
    appointmentSlots.forEach(slot => {
      // Use the pre-computed availableSlots from the database
      const availableSlots = slot.availableSlots.filter(timeSlot => 
        !slot.bookedSlots.includes(timeSlot)
      )
      
      // Add to availability map for display purposes
      availableSlots.forEach(timeSlot => {
        const remainingSlots = slot.slotType === 'wave' 
          ? (slot.maxPatients || 1) - (slot.bookedSlots.filter(bookedSlot => bookedSlot === timeSlot).length)
          : slot.bookedSlots.includes(timeSlot) ? 0 : 1
          
        availabilityMap[timeSlot] = {
          available: Math.max(0, remainingSlots),
          total: slot.slotType === 'wave' ? (slot.maxPatients || 1) : 1,
          type: slot.slotType
        }
      })
      
      allAvailableTimeSlots.push(...availableSlots)
    })
    
    // Update slot availability state
    setSlotAvailability(availabilityMap)
    
    // Remove duplicates and sort
    return [...new Set(allAvailableTimeSlots)].sort()
  }

  // Update available time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const slots = getAvailableTimeSlotsForDate(selectedDate)
      setAvailableTimeSlots(slots)
      console.log('🔍 Available time slots for', selectedDate, ':', slots)
      console.log('🔍 Slot availability:', slotAvailability)
    } else {
      setAvailableTimeSlots([])
      setSlotAvailability({})
    }
  }, [selectedDate, selectedDoctor])

  // Get available dates from appointment slots
  const getAvailableDates = (): Date[] => {
    if (!selectedDoctor?.appointmentSlots) {
      // Fallback to legacy availableDates
      return selectedDoctor?.availableDates?.map(d => new Date(d)) || []
    }
    
  const availableDatesWithSlots = Array.isArray(selectedDoctor?.appointmentSlots)
  ? selectedDoctor.appointmentSlots
      .filter((slot: { isActive: boolean }) => slot.isActive)
      .filter((slot: { availableSlots: string[]; bookedSlots: string[] }) => {
        const availableSlots = slot.availableSlots.filter(
          (timeSlot) => !slot.bookedSlots.includes(timeSlot)
        )
        return availableSlots.length > 0
      })
      .map((slot: { date: string }) => slot.date)
  : []

    
    const uniqueDates = [...new Set(availableDatesWithSlots)]
    return uniqueDates
      .map(date => new Date(date as string))
      .sort((a, b) => a.getTime() - b.getTime())
  }

  // Find slot info for selected time
  const getSlotInfoForTime = (dateStr: string, timeStr: string): { slot: AppointmentSlot, timeSlot: string } | null => {
    const appointmentSlots = getAppointmentSlotsForDate(dateStr)
    
    for (const slot of appointmentSlots) {
      if (slot.availableSlots.includes(timeStr) && !slot.bookedSlots.includes(timeStr)) {
        return { slot, timeSlot: timeStr }
      }
    }
    
    return null
  }

  // Update selected slot info when time changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const slotInfo = getSlotInfoForTime(selectedDate, selectedTime)
      setSelectedSlotInfo(slotInfo)
    } else {
      setSelectedSlotInfo(null)
    }
  }, [selectedDate, selectedTime, selectedDoctor])

  if (!selectedDoctor) {
    return (
      <div className="text-center py-10 text-lg text-blue-700 font-medium">
        Please select a doctor to proceed with booking.
      </div>
    )
  }

  const availableDateOptions = getAvailableDates()

  // Handle initial booking button click
  const handleInitialBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time.')
      return
    }

    const userId = localStorage.getItem('userId')
    if (!userId) {
      toast.error('User not logged in.')
      return
    }

    if (!selectedSlotInfo) {
      toast.error('Invalid time slot selected.')
      return
    }

    // Additional validation for slot availability
    const availability = slotAvailability[selectedTime]
    if (!availability || availability.available <= 0) {
      toast.error('This time slot is no longer available.')
      return
    }

    setShowPaymentFlow(true)
  }

  // Handle closing payment flow
  const handleClosePaymentFlow = () => {
    setShowPaymentFlow(false)
  }

  // Get slot type display text with availability
  const getSlotTypeDisplay = (slot: AppointmentSlot, timeSlot?: string): string => {
    if (slot.slotType === 'wave') {
      const availability = timeSlot ? slotAvailability[timeSlot] : null
      const availableSpots = availability ? availability.available : (slot.maxPatients || 1)
      const totalSpots = slot.maxPatients || 1
      return `Group Consultation (${availableSpots}/${totalSpots} spots available)`
    }
    return 'Individual Consultation'
  }

  // Get slot availability status
  const getSlotAvailabilityStatus = (timeSlot: string) => {
    const availability = slotAvailability[timeSlot]
    if (!availability) return null
    
    if (availability.type === 'wave') {
      const percentage = (availability.available / availability.total) * 100
      if (percentage > 50) return { status: 'available', color: 'text-green-600' }
      if (percentage > 20) return { status: 'limited', color: 'text-yellow-600' }
      return { status: 'few-left', color: 'text-red-600' }
    }
    
    return availability.available > 0 
      ? { status: 'available', color: 'text-green-600' }
      : { status: 'full', color: 'text-red-600' }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-6 py-12 flex flex-col lg:flex-row items-start justify-center gap-10">
        {/* LEFT: Doctor Info & Terms */}
        <div className="max-w-2xl text-blue-900 space-y-8">
          {/* Doctor Header */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {selectedDoctor.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">Dr. {selectedDoctor.name}</h1>
                <p className="text-blue-600 font-medium">{selectedDoctor.speciality}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{selectedDoctor.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-green-500" />
                <span>₹{selectedDoctor.price}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{selectedDoctor.rating}/5</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" />
                <span>{selectedDoctor.experience} years exp</span>
              </div>
            </div>
          </div>

          {/* About Doctor */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <h2 className="text-2xl font-bold mb-4">About Dr. {selectedDoctor.name}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dr. {selectedDoctor.name} is a highly experienced and board-certified expert in <strong>{selectedDoctor.speciality}</strong>. 
              With over {selectedDoctor.experience} years of medical practice, they are known for their evidence-based approach, accurate diagnosis,
              and patient-first attitude.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Services Offered</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Comprehensive medical consultation</li>
                  <li>• Diagnostic assessment</li>
                  <li>• Treatment planning</li>
                  <li>• Follow-up care</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Consultation Types</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Individual consultations (Stream)</li>
                  <li>• Group consultations (Wave)</li>
                  <li>• Real-time slot availability</li>
                  <li>• Flexible scheduling options</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Booking Policies */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <h3 className="text-xl font-semibold mb-4">Booking Information</h3>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Stream Slots
                  </h4>
                  <ul className="space-y-1">
                    <li>• Individual consultation</li>
                    <li>• One-on-one with doctor</li>
                    <li>• 30-minute duration</li>
                    <li>• Private session</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Wave Slots
                  </h4>
                  <ul className="space-y-1">
                    <li>• Group consultation</li>
                    <li>• Multiple patients (max 10)</li>
                    <li>• 20-minute duration</li>
                    <li>• Cost-effective option</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-blue-800 mb-2">Booking Policy</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Real-time slot availability updates</li>
                  <li>Free rescheduling within 24 hours</li>
                  <li>Cancellation allowed up to 2 hours before appointment</li>
                  <li>Late arrivals beyond 15 mins will be marked as no-show</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Booking Form */}
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 sticky top-4">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h2 className="text-3xl font-bold text-blue-800">Book Appointment</h2>
              <p className="text-gray-600 text-sm">Select your preferred date and time</p>
            </div>

            <div className="space-y-6">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Appointment Date
                </label>
                <DatePicker
                  selected={parsedDate}
                  onChange={(date: Date | null) => {
                    const formatted = date ? date.toISOString().split('T')[0] : ''
                    console.log('🔍 Date selected:', formatted)
                    setParsedDate(date)
                    setDate(formatted)
                    setTime('')
                  }}
                  includeDates={availableDateOptions}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Choose available date"
                  className="w-full p-4 border-2 border-blue-200 rounded-xl shadow-sm text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  calendarClassName="shadow-lg border-blue-200"
                />
                {availableDateOptions.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠️ No available dates found. Please check back later.
                  </p>
                )}
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-3">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Available Time Slots
                  </label>
                  {availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {availableTimeSlots.map((timeSlot, index) => {
                        const slotInfo = getSlotInfoForTime(selectedDate, timeSlot)
                        const availability = slotAvailability[timeSlot]
                        const availabilityStatus = getSlotAvailabilityStatus(timeSlot)
                        const isSelected = selectedTime === timeSlot
                        const isAvailable = availability && availability.available > 0
                        
                        return (
                          <button
                            key={`${timeSlot}-${index}`}
                            onClick={() => {
                              if (isAvailable) {
                                console.log('🔍 Time selected:', timeSlot)
                                setTime(timeSlot)
                              }
                            }}
                            disabled={!isAvailable}
                            className={`p-3 rounded-lg border-2 text-xs font-medium transition-all ${
                              !isAvailable
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                : 'bg-white text-blue-800 border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                          >
                            <div className="text-center">
                              <div className="font-semibold text-sm">{timeSlot}</div>
                              {slotInfo && (
                                <>
                                  <div className="mt-1">
                                    {slotInfo.slot.slotDuration}min
                                  </div>
                                  <div className={`text-xs mt-1 ${
                                    slotInfo.slot.slotType === 'wave' ? 'text-purple-600' : 'text-green-600'
                                  }`}>
                                    {slotInfo.slot.slotType === 'wave' ? (
                                      <div className="flex items-center justify-center gap-1">
                                        <Users className="w-3 h-3" />
                                        <span>Group</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center gap-1">
                                        <UserCheck className="w-3 h-3" />
                                        <span>Individual</span>
                                      </div>
                                    )}
                                  </div>
                                  {availability && availability.type === 'wave' && (
                                    <div className={`text-xs mt-1 ${availabilityStatus?.color}`}>
                                      {availability.available}/{availability.total} spots
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                      <p className="text-sm text-yellow-800 text-center">
                        No time slots available for this date.<br />
                        Please select another date.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Appointment Summary */}
              {selectedDate && selectedTime && selectedSlotInfo && (
                <div className="p-5 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl">
                  <h4 className="font-bold text-green-800 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Appointment Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Date:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Time:</span>
                      <span className="font-semibold text-gray-900">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Duration:</span>
                      <span className="font-semibold text-gray-900">{selectedSlotInfo.slot.slotDuration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Type:</span>
                      <span className="font-semibold text-gray-900">
                        {getSlotTypeDisplay(selectedSlotInfo.slot, selectedTime)}
                      </span>
                    </div>
                    {selectedSlotInfo.slot.slotType === 'wave' && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Availability:</span>
                        <span className="font-semibold text-blue-600">
                          {slotAvailability[selectedTime]?.available || 0} spots remaining
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 mt-3">
                      <span className="text-gray-700">Consultation Fee:</span>
                      <span className="font-bold text-green-600 text-base">₹{selectedDoctor.price}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleInitialBooking}
                disabled={!selectedDate || !selectedTime || !selectedSlotInfo}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Proceed to Payment
              </button>

              {(!selectedDate || !selectedTime) && (
                <p className="text-xs text-gray-500 text-center">
                  Please select both date and time to proceed
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Flow Component */}
      {showPaymentFlow && selectedSlotInfo && (
        <PaymentFlow
          selectedDoctor={selectedDoctor}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          slotInfo={selectedSlotInfo}
          onClose={handleClosePaymentFlow}
          resetBooking={resetBooking}
        />
      )}
    </>
  )
}