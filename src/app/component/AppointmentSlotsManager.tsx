/* eslint-disable @typescript-eslint/no-explicit-any */
// components/AppointmentSlotsManager.tsx
'use client'

import { useState } from 'react'
import { AppointmentSlot } from '@/context/doctorStore'
import AppointmentSlotForm from './AppointmentSlotForm'
import { Clock, PlusCircle, Calendar, RotateCcw, AlertCircle, TrendingUp, Users, CheckCircle2, XCircle } from 'lucide-react'

interface AppointmentSlotsManagerProps {
  appointmentSlots: AppointmentSlot[]
  isEditing: boolean
  onAddSlot: () => void
  onUpdateSlot: (slotId: string, updates: Partial<AppointmentSlot>) => void
  onDeleteSlot: (slotId: string) => void
  onGenerateRecurring?: (slotId: string, weeks: number) => void
}

export default function AppointmentSlotsManager({
  appointmentSlots,
  isEditing,
  onAddSlot,
  onUpdateSlot,
  onDeleteSlot,
  onGenerateRecurring
}: AppointmentSlotsManagerProps) {
  const [showRecurringOptions, setShowRecurringOptions] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'available' | 'booked' | 'wave' | 'stream'>('all')

  // Group slots by day for better organization
  const groupSlotsByDay = (slots: AppointmentSlot[]) => {
    const grouped: { [key: string]: AppointmentSlot[] } = {}
    
    slots.forEach(slot => {
      if (slot.date) {
        const dayName = slot.dayOfWeek || new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long' })
        if (!grouped[dayName]) {
          grouped[dayName] = []
        }
        grouped[dayName].push(slot)
      }
    })

    // Sort each day's slots by date, then by start time
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime()
        if (dateCompare !== 0) return dateCompare
        return a.startTime.localeCompare(b.startTime)
      })
    })

    return grouped
  }

  // Filter slots based on selected filter
  const getFilteredSlots = (slots: AppointmentSlot[]) => {
    switch (filterType) {
      case 'available':
        return slots.filter(slot => {
          const totalSlots = Math.floor((new Date(`2000-01-01T${slot.endTime}:00`).getTime() - new Date(`2000-01-01T${slot.startTime}:00`).getTime()) / (1000 * 60 * slot.slotDuration))
          return slot.bookedSlots.length < totalSlots
        })
      case 'booked':
        return slots.filter(slot => slot.bookedSlots.length > 0)
      case 'wave':
        return slots.filter(slot => slot.slotType === 'wave')
      case 'stream':
        return slots.filter(slot => slot.slotType === 'stream')
      default:
        return slots
    }
  }

  const filteredSlots = getFilteredSlots(appointmentSlots)
  const groupedSlots = groupSlotsByDay(filteredSlots)

  // Handle recurring slot generation
  const handleGenerateRecurring = (slotId: string, weeks: number) => {
    if (onGenerateRecurring) {
      onGenerateRecurring(slotId, weeks)
    }
    setShowRecurringOptions(null)
  }

  // Get statistics
  const totalSlots = appointmentSlots.reduce((sum, slot) => {
    const timeSlots = Math.floor((new Date(`2000-01-01T${slot.endTime}:00`).getTime() - new Date(`2000-01-01T${slot.startTime}:00`).getTime()) / (1000 * 60 * slot.slotDuration))
    return sum + timeSlots
  }, 0)
  
  const bookedSlots = appointmentSlots.reduce((sum, slot) => sum + slot.bookedSlots.length, 0)
  const availableSlots = totalSlots - bookedSlots
  const waveSlots = appointmentSlots.filter(slot => slot.slotType === 'wave').length
  const streamSlots = appointmentSlots.filter(slot => slot.slotType === 'stream').length

  // Calculate booking percentage
  const bookingPercentage = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0

  // Get upcoming slots (next 7 days)
  const getUpcomingSlots = () => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return appointmentSlots.filter(slot => {
      const slotDate = new Date(slot.date)
      return slotDate >= today && slotDate <= nextWeek
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const upcomingSlots = getUpcomingSlots()

  if (!isEditing && appointmentSlots.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Appointment Slots</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg mb-2">No appointment slots configured yet</p>
          <p className="text-sm text-gray-400">Start by adding your first appointment slot to manage your schedule</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Appointment Slots</h3>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Filter Options */}
          {!isEditing && appointmentSlots.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Filter:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Slots</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="wave">Group Only</option>
                <option value="stream">Individual Only</option>
              </select>
            </div>
          )}
          
          {/* Statistics */}
          {!isEditing && appointmentSlots.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700 font-medium">{appointmentSlots.length} slots</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span className="text-green-700 font-medium">{availableSlots} available</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-red-600" />
                <span className="text-red-700 font-medium">{bookedSlots} booked</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 text-blue-600" />
                <span className="text-blue-700 font-medium text-xs">{bookingPercentage}% booked</span>
              </div>
            </div>
          )}
          
          {isEditing && (
            <button
              onClick={onAddSlot}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg"
            >
              <PlusCircle className="w-4 h-4" />
              Add Slot
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">🚀 Quick Setup Guide:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-600">
                <div className="space-y-1">
                  <p>• <strong>Date Selection:</strong> Choose specific date or recurring day</p>
                  <p>• <strong>Time Setup:</strong> Set start time, end time, and slot duration</p>
                </div>
                <div className="space-y-1">
                  <p>• <strong>Appointment Types:</strong> Individual (stream) or Group (wave)</p>
                  <p>• <strong>Recurring:</strong> Generate weekly repeating appointments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Dashboard - Display Mode Only */}
      {!isEditing && appointmentSlots.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Total Appointments</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{appointmentSlots.length}</p>
            <p className="text-xs text-blue-600">{totalSlots} time slots</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-800">Available</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{availableSlots}</p>
            <p className="text-xs text-green-600">{Math.round((availableSlots/totalSlots)*100) || 0}% open</p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-800">Group Slots</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">{waveSlots}</p>
            <p className="text-xs text-orange-600">{streamSlots} individual</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-800">This Week</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{upcomingSlots.length}</p>
            <p className="text-xs text-purple-600">upcoming slots</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {isEditing ? (
          // Edit Mode - Show all slots with forms
          <div className="space-y-4">
            {appointmentSlots.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium mb-2">No appointment slots yet</h4>
                <p className="text-sm text-gray-400 mb-6">Create your first appointment slot to start managing your schedule</p>
                <button
                  onClick={onAddSlot}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium mx-auto transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add First Appointment Slot
                </button>
              </div>
            ) : (
              appointmentSlots.map((slot) => (
                <div key={slot.id} className="relative">
                  <AppointmentSlotForm
                    slot={slot}
                    onUpdate={onUpdateSlot}
                    onDelete={onDeleteSlot}
                    isEditing={true}
                  />
                  
                  {/* Recurring Options */}
                  {slot.isRecurring && onGenerateRecurring && (
                    <div className="mt-3">
                      {showRecurringOptions === slot.id ? (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                          <div className="flex items-center gap-2 mb-3">
                            <RotateCcw className="w-4 h-4 text-indigo-600" />
                            <p className="text-sm font-medium text-indigo-800">
                              Generate recurring appointments for {slot.dayOfWeek}s:
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {[2, 4, 8, 12, 16].map((weeks) => (
                              <button
                                key={weeks}
                                onClick={() => handleGenerateRecurring(slot.id, weeks)}
                                className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-lg transition-colors font-medium"
                              >
                                Next {weeks} weeks
                              </button>
                            ))}
                            <button
                              onClick={() => setShowRecurringOptions(null)}
                              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg transition-colors ml-2"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowRecurringOptions(slot.id)}
                          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Generate recurring slots
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          // Display Mode - Group by day
          <div className="space-y-6">
            {Object.keys(groupedSlots).length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium mb-2">
                  {filterType === 'all' ? 'No appointment slots configured' : `No ${filterType} slots found`}
                </h4>
                {filterType !== 'all' && (
                  <button
                    onClick={() => setFilterType('all')}
                    className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                  >
                    View all slots
                  </button>
                )}
              </div>
            ) : (
              Object.entries(groupedSlots)
                .sort(([a], [b]) => {
                  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                  return dayOrder.indexOf(a) - dayOrder.indexOf(b)
                })
                .map(([day, slots]) => {
                  const dayStats = {
                    total: slots.reduce((sum, slot) => sum + Math.floor((new Date(`2000-01-01T${slot.endTime}:00`).getTime() - new Date(`2000-01-01T${slot.startTime}:00`).getTime()) / (1000 * 60 * slot.slotDuration)), 0),
                    booked: slots.reduce((sum, slot) => sum + slot.bookedSlots.length, 0),
                    wave: slots.filter(slot => slot.slotType === 'wave').length,
                    stream: slots.filter(slot => slot.slotType === 'stream').length
                  }
                  
                  return (
                    <div key={day} className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg p-5 border border-blue-100">
                      <div 
                        className="flex items-center justify-between mb-4 cursor-pointer"
                        onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-blue-800 text-lg">{day}s</h4>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {slots.length} appointment{slots.length !== 1 ? 's' : ''}
                            </span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {dayStats.total - dayStats.booked}/{dayStats.total} available
                            </span>
                            {dayStats.wave > 0 && (
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                                {dayStats.wave} group
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {expandedDay === day ? 'Click to collapse' : 'Click to expand'}
                          </span>
                          <div className={`w-4 h-4 text-blue-600 transition-transform ${expandedDay === day ? 'rotate-90' : ''}`}>
                            ▶
                          </div>
                        </div>
                      </div>
                      
                      <div className={`space-y-3 transition-all duration-300 ${expandedDay === day ? 'block' : 'hidden'}`}>
                        {slots.map((slot) => (
                          <AppointmentSlotForm
                            key={slot.id}
                            slot={slot}
                            onUpdate={onUpdateSlot}
                            onDelete={onDeleteSlot}
                            isEditing={false}
                          />
                        ))}
                      </div>
                      
                      {/* Show first slot by default when collapsed */}
                      {expandedDay !== day && (
                        <div className="space-y-3">
                          <AppointmentSlotForm
                            slot={slots[0]}
                            onUpdate={onUpdateSlot}
                            onDelete={onDeleteSlot}
                            isEditing={false}
                          />
                          {slots.length > 1 && (
                            <div className="text-center py-2">
                              <button
                                onClick={() => setExpandedDay(day)}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                Show {slots.length - 1} more {day} slot{slots.length - 1 !== 1 ? 's' : ''}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
            )}
          </div>
        )}
      </div>
    </div>
  )
}