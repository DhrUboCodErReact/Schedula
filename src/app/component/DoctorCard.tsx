/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Star, MapPin, Calendar, Clock, UserCircle, Award, Sparkles, CheckCircle } from 'lucide-react'

interface DoctorCardProps {
  doctor: any
  onBookAppointment: (doctorId: string) => void
}

export default function DoctorCard({ doctor, onBookAppointment }: DoctorCardProps) {
  // Helper function to format time from 24hr to 12hr format
  const formatTime = (time: string) => {
    if (!time || typeof time !== 'string') return 'N/A'
    
    const timeParts = time.split(':')
    if (timeParts.length < 2) return time // Return as-is if not properly formatted
    
    const hours = parseInt(timeParts[0]) || 0
    const minutes = parseInt(timeParts[1]) || 0
    
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Get the next available appointment slot
  const getNextAvailableSlot = () => {
    if (!doctor.appointmentSlots || doctor.appointmentSlots.length === 0) {
      // Fallback to legacy format
      return {
        date: doctor.availableDates?.[0] || 'Not specified',
        startTime: doctor.availableTimes?.[0] || 'Not specified',
        endTime: doctor.availableEndTimes?.[0] || 'Not specified'
      }
    }

    // Find the first active slot with available slots
    const availableSlot = doctor.appointmentSlots.find((slot: any) => 
      slot.isActive && slot.availableSlots && slot.availableSlots.length > 0
    )

    if (availableSlot) {
      return {
        date: availableSlot.date,
        startTime: availableSlot.startTime,
        endTime: availableSlot.endTime,
        availableCount: availableSlot.availableSlots?.length || 0,
        totalSlots: availableSlot.totalSlots
      }
    }

    // Return first slot even if no available slots
    return {
      date: doctor.appointmentSlots[0]?.date || 'Not specified',
      startTime: doctor.appointmentSlots[0]?.startTime || 'Not specified',
      endTime: doctor.appointmentSlots[0]?.endTime || 'Not specified',
      availableCount: 0,
      totalSlots: doctor.appointmentSlots[0]?.totalSlots || 0
    }
  }

  // Get total available slots across all dates
  const getTotalAvailableSlots = () => {
    if (!doctor.appointmentSlots) return 0
    return doctor.appointmentSlots.reduce((total: number, slot: any) => {
      return total + (slot.availableSlots?.length || 0)
    }, 0)
  }

  const nextSlot = getNextAvailableSlot()
  const totalAvailable = getTotalAvailableSlots()
  const hasAvailableSlots = totalAvailable > 0

  return (
    <div className="group relative bg-gradient-to-br from-white via-blue-50/30 to-slate-50/50 rounded-3xl shadow-xl hover:shadow-2xl border border-blue-100/60 overflow-hidden transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm">
      {/* Premium Glass Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-600/10 backdrop-blur-md border-b border-blue-200/30"></div>
      
      {/* Floating Profile Picture */}
      <div className="relative pt-8 pb-6 flex justify-center">
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-xl scale-125"></div>
          
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-white via-blue-50/50 to-slate-50/30 p-1 shadow-2xl backdrop-blur-sm border border-blue-200/50">
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-50/80 to-indigo-50/60 flex items-center justify-center backdrop-blur-sm">
              {doctor.image ? (
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <UserCircle className="text-blue-400/80" size={50} />
              )}
            </div>
          </div>
          
          {/* Premium Status Indicator */}
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-lg ${
            hasAvailableSlots 
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500' 
              : 'bg-gradient-to-r from-red-400 to-rose-500'
          }`}>
            <div className="w-full h-full flex items-center justify-center">
              {hasAvailableSlots ? (
                <CheckCircle size={10} className="text-white" />
              ) : (
                <Clock size={10} className="text-white" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Content Section */}
      <div className="px-6 pb-6 space-y-4">
        {/* Name with Premium Typography */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-tight tracking-tight">
            {doctor.name}
          </h3>
          
          {/* Specialty with Glass Morphism */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100/60 to-indigo-100/40 backdrop-blur-sm rounded-full border border-blue-200/40 shadow-sm">
            <Award size={14} className="text-blue-600/80" />
            <span className="text-sm font-semibold text-blue-700/90">{doctor.speciality}</span>
          </div>
        </div>

        {/* Premium Stats Row */}
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-gradient-to-r from-yellow-100/60 to-amber-100/40 rounded-full">
              <Star size={14} className="text-yellow-500 fill-current" />
            </div>
            <span className="text-sm font-bold text-slate-700">{doctor.rating || '4.5'}</span>
          </div>
          
          <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full opacity-60"></div>
          
          <div className="text-sm font-semibold text-slate-600">
            {doctor.experience} yrs exp
          </div>
        </div>

        {/* Location */}
        <div className="text-center py-1">
          <div className="flex items-center justify-center gap-1 text-slate-700">
            <MapPin size={14} className="text-slate-500" />
            <span className="text-base font-semibold">{doctor.location}</span>
          </div>
        </div>

        {/* Price */}
        <div className="text-center py-2">
          <span className="text-2xl font-bold text-green-600">₹{doctor.price}</span>
          <span className="text-sm text-slate-500 ml-1">per consultation</span>
        </div>

        {/* Availability Status */}
        <div className="text-center space-y-2 py-2">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
            hasAvailableSlots 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {hasAvailableSlots ? (
              <>
                <CheckCircle size={12} />
                <span>{totalAvailable} slots available</span>
              </>
            ) : (
              <>
                <Clock size={12} />
                <span>No slots available</span>
              </>
            )}
          </div>
        </div>

        {/* Next Available Slot */}
        <div className="text-center space-y-2 py-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-100/50 backdrop-blur-sm">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Next Available</p>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-700">
              {formatDate(nextSlot.date)}
            </p>
            <p className="text-sm text-slate-600">
              {formatTime(nextSlot.startTime)} - {formatTime(nextSlot.endTime)}
            </p>
            {nextSlot.availableCount !== undefined && (
              <p className="text-xs text-slate-500">
                {nextSlot.availableCount} of {nextSlot.totalSlots} slots free
              </p>
            )}
          </div>
        </div>

        {/* Multiple Slots Preview */}
        {doctor.appointmentSlots && doctor.appointmentSlots.length > 1 && (
          <div className="text-center py-2">
            <p className="text-xs text-slate-500">
              +{doctor.appointmentSlots.length - 1} more date{doctor.appointmentSlots.length > 2 ? 's' : ''} available
            </p>
          </div>
        )}

        {/* Premium CTA Button */}
        <button
          onClick={() => onBookAppointment(doctor.id)}
          disabled={!hasAvailableSlots}
          className={`w-full font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl backdrop-blur-sm border group relative overflow-hidden ${
            hasAvailableSlots
              ? 'bg-gradient-to-r from-blue-500/90 via-indigo-500/90 to-blue-600/90 hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 text-white border-blue-400/20'
              : 'bg-gradient-to-r from-gray-400/90 to-gray-500/90 text-white border-gray-400/20 cursor-not-allowed'
          }`}
        >
          {/* Button Shine Effect */}
          {hasAvailableSlots && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          )}
          
          <Calendar size={18} className={`transition-transform duration-300 ${hasAvailableSlots ? 'group-hover:scale-110' : ''}`} />
          <span className="relative z-10">
            {hasAvailableSlots ? 'Book Appointment' : 'No Slots Available'}
          </span>
        </button>
      </div>

      {/* Premium Floating Elements */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-blue-200/40 to-indigo-200/30 rounded-full opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-500"></div>
      <div className="absolute top-8 right-8 w-4 h-4 bg-gradient-to-br from-indigo-200/50 to-blue-200/40 rounded-full opacity-50 group-hover:scale-125 group-hover:opacity-70 transition-all duration-700"></div>
      <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-teal-200/30 to-emerald-200/20 rounded-full opacity-40 group-hover:scale-105 group-hover:opacity-60 transition-all duration-600"></div>
    </div>
  )
}