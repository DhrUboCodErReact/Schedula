/* eslint-disable @typescript-eslint/no-explicit-any */
// components/AppointmentSlotForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { AppointmentSlot } from '@/context/doctorStore'
import { Trash2, Calendar, Clock, Users, Repeat } from 'lucide-react'

interface AppointmentSlotFormProps {
  slot: AppointmentSlot
  onUpdate: (slotId: string, updates: Partial<AppointmentSlot>) => void
  onDelete: (slotId: string) => void
  isEditing: boolean
}

export default function AppointmentSlotForm({ 
  slot, 
  onUpdate, 
  onDelete, 
  isEditing 
}: AppointmentSlotFormProps) {
  const [localSlot, setLocalSlot] = useState<AppointmentSlot>(slot)

  // Days of the week for recurring appointments
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  // Slot duration options
  const slotDurations = [
    { value: 15, label: '15 minutes' },
    { value: 20, label: '20 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ]

  // Generate time slots based on start/end time and duration
  const generateTimeSlots = (startTime: string, endTime: string, duration: number): string[] => {
    const slots: string[] = []
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    
    const current = new Date(start)
    while (current < end) {
      const timeString = current.toTimeString().substring(0, 5)
      slots.push(timeString)
      current.setMinutes(current.getMinutes() + duration)
    }
    
    return slots
  }

  // Calculate total slots based on time range and duration
  const calculateTotalSlots = (startTime: string, endTime: string, duration: number): number => {
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
    return Math.floor(diffInMinutes / duration)
  }

  // Get minimum date (today)
  const getMinDate = (): string => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Get next occurrence of a day
  const getNextOccurrence = (dayName: string, weeksAhead: number = 0): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const targetDay = days.indexOf(dayName)
    
    const today = new Date()
    const currentDay = today.getDay()
    
    let daysUntilTarget = targetDay - currentDay
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7
    }
    
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + daysUntilTarget + (weeksAhead * 7))
    
    return targetDate.toISOString().split('T')[0]
  }

  // Get day name from date string
  const getDayFromDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  // Update local state and propagate changes
  const updateSlotField = (field: keyof AppointmentSlot, value: any) => {
    const updatedSlot = { ...localSlot, [field]: value }
    
    // Recalculate dependent fields
    if (field === 'startTime' || field === 'endTime' || field === 'slotDuration') {
      updatedSlot.totalSlots = calculateTotalSlots(
        updatedSlot.startTime,
        updatedSlot.endTime,
        updatedSlot.slotDuration
      )
      updatedSlot.availableSlots = generateTimeSlots(
        updatedSlot.startTime,
        updatedSlot.endTime,
        updatedSlot.slotDuration
      ).filter(timeSlot => !updatedSlot.bookedSlots.includes(timeSlot))
    }

    if (field === 'date') {
      updatedSlot.dayOfWeek = getDayFromDate(value)
    }

    setLocalSlot(updatedSlot)
    onUpdate(slot.id, updatedSlot)
  }

  // Handle recurring day selection
  const handleRecurringDayChange = (selectedDay: string) => {
    if (!selectedDay) return

    const nextDate = getNextOccurrence(selectedDay)
    updateSlotField('date', nextDate)
    updateSlotField('dayOfWeek', selectedDay)
    updateSlotField('isRecurring', true)
  }

  useEffect(() => {
    setLocalSlot(slot)
  }, [slot])

  const availableSlots = generateTimeSlots(localSlot.startTime, localSlot.endTime, localSlot.slotDuration)
  const availableSlotsCount = availableSlots.length - localSlot.bookedSlots.length

  if (!isEditing) {
    // Display Mode
    return (
      <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-700">
              {new Date(localSlot.date).toLocaleDateString('en-GB')}
            </span>
            <span className="text-gray-500">({localSlot.dayOfWeek})</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-blue-600">
              {localSlot.startTime} - {localSlot.endTime}
            </span>
          </div>
          
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
            {localSlot.slotDuration}min slots
          </span>
          
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-orange-600" />
            <span className="text-orange-600">
              {localSlot.slotType === 'wave' ? `Group (max ${localSlot.maxPatients})` : 'Individual'}
            </span>
          </div>

          {localSlot.isRecurring && (
            <div className="flex items-center gap-1">
              <Repeat className="w-4 h-4 text-indigo-600" />
              <span className="text-indigo-600 text-xs">Recurring</span>
            </div>
          )}
        </div>

        <div className="mt-3">
          <p className="text-xs text-gray-600 mb-2">
            Available slots ({availableSlotsCount}/{availableSlots.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {availableSlots.map((timeSlot) => (
              <span
                key={timeSlot}
                className={`text-xs px-2 py-1 rounded-full ${
                  localSlot.bookedSlots.includes(timeSlot)
                    ? 'bg-red-100 text-red-700 line-through'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {timeSlot}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Edit Mode
  return (
    <div className="border-2 border-blue-200 rounded-lg p-5 bg-blue-50/30 relative">
      <button
        onClick={() => onDelete(slot.id)}
        className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors"
        title="Delete this appointment slot"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="space-y-4">
        {/* Date and Day Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Specific Date
            </label>
            <input
              type="date"
              min={getMinDate()}
              value={localSlot.date}
              onChange={(e) => updateSlotField('date', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <Repeat className="w-3 h-3" />
              Or Select Recurring Day
            </label>
            <select
              value={localSlot.dayOfWeek || ''}
              onChange={(e) => handleRecurringDayChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select day for recurring</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Time Configuration Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Start Time</label>
            <input
              type="time"
              value={localSlot.startTime}
              onChange={(e) => updateSlotField('startTime', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">End Time</label>
            <input
              type="time"
              value={localSlot.endTime}
              onChange={(e) => updateSlotField('endTime', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Slot Duration</label>
            <select
              value={localSlot.slotDuration}
              onChange={(e) => updateSlotField('slotDuration', parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {slotDurations.map((duration) => (
                <option key={duration.value} value={duration.value}>
                  {duration.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Appointment Type Configuration Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Appointment Type
            </label>
            <select
              value={localSlot.slotType}
              onChange={(e) => updateSlotField('slotType', e.target.value as 'wave' | 'stream')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="stream">Individual (One patient per slot)</option>
              <option value="wave">Group (Multiple patients per slot)</option>
            </select>
          </div>

          {localSlot.slotType === 'wave' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">Max Patients per Slot</label>
              <input
                type="number"
                min="1"
                max="20"
                value={localSlot.maxPatients || 1}
                onChange={(e) => updateSlotField('maxPatients', parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Slot Preview */}
        {localSlot.startTime && localSlot.endTime && localSlot.date && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-sm font-medium text-gray-700">
                Preview: {availableSlots.length} time slots on {getDayFromDate(localSlot.date)}
              </h5>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {localSlot.slotType === 'wave' ? `Group (${localSlot.maxPatients} max)` : 'Individual'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {availableSlots.map((timeSlot) => (
                <span
                  key={timeSlot}
                  className={`text-xs px-2 py-1 rounded-full ${
                    localSlot.bookedSlots.includes(timeSlot)
                      ? 'bg-red-100 text-red-700 line-through'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {timeSlot}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}