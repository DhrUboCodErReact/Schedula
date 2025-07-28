/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { Doctor, useDoctorStore } from '@/context/doctorStore'
import { Pencil, Save, PlusCircle, Trash2, UserCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

type EditableDoctor = Partial<Doctor> & { id: string }

export default function DoctorProfilePage() {
  const { doctor, setDoctor } = useDoctorStore()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<EditableDoctor | null>(null)

  // Helper function to get next occurrence of a day
  const getNextOccurrence = (dayName: string, weeksAhead: number = 0): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const targetDay = days.indexOf(dayName)
    
    const today = new Date()
    const currentDay = today.getDay()
    
    let daysUntilTarget = targetDay - currentDay
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7 // Move to next week if day has passed
    }
    
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + daysUntilTarget + (weeksAhead * 7))
    
    return targetDate.toISOString().split('T')[0] // Return YYYY-MM-DD format
  }

  // Helper function to get day name from date string
  const getDayFromDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  // Generate weekly recurring dates for next 4 weeks
  const generateWeeklyDates = (selectedDays: string[]): string[] => {
    const dates: string[] = []
    
    selectedDays.forEach(dayName => {
      for (let week = 0; week < 4; week++) {
        dates.push(getNextOccurrence(dayName, week))
      }
    })
    
    // Sort dates chronologically
    return dates.sort()
  }

  useEffect(() => {
    if (doctor) {
      // Convert existing day names to actual dates if needed
      let availableDates = doctor.availableDates || []
      
      // Check if we have day names instead of dates
      const hasDateFormat = availableDates.some(date => date.includes('-'))
      
      if (!hasDateFormat && availableDates.length > 0) {
        // Convert day names to recurring dates
        availableDates = generateWeeklyDates(availableDates)
      }

      setFormData({
        ...doctor,
        availableDates,
        availableTimes: doctor.availableTimes || [],
        slotTypes: doctor.slotTypes || [],
      })
    }
  }, [doctor])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => prev ? { ...prev, [name]: value } : prev)
  }

  const handleArrayChange = (
    key: 'availableDates' | 'availableTimes',
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      if (!prev) return prev
      const updatedArray = [...(prev[key] || [])]
      updatedArray[index] = value
      return { ...prev, [key]: updatedArray }
    })
  }

  const deleteArrayItem = (key: 'availableDates' | 'availableTimes', index: number) => {
    setFormData((prev) => {
      if (!prev) return prev
      const updatedArray = [...(prev[key] || [])]
      updatedArray.splice(index, 1)
      const updatedSlotTypes = [...(prev.slotTypes || [])]
      updatedSlotTypes.splice(index, 1)
      return { ...prev, [key]: updatedArray, slotTypes: updatedSlotTypes }
    })
  }

  const addArrayItem = (key: 'availableDates' | 'availableTimes') => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [key]: [...(prev[key] || []), key === 'availableDates' ? '' : ''],
            slotTypes: [
              ...(prev.slotTypes || []),
              { type: 'stream', expected: 0, booked: 0 },
            ],
          }
        : prev
    )
  }

  // Handle day selection and generate recurring dates
  const handleDaySelection = (index: number, selectedDay: string) => {
    if (!selectedDay) {
      handleArrayChange('availableDates', index, '')
      return
    }

    setFormData((prev) => {
      if (!prev) return prev
      
      const updatedDates = [...(prev.availableDates || [])]
      
      // Generate 4 weeks of dates for this day
      const weeklyDates = []
      for (let week = 0; week < 4; week++) {
        weeklyDates.push(getNextOccurrence(selectedDay, week))
      }
      
      // Replace the current slot with the first date, and add the rest
      updatedDates[index] = weeklyDates[0]
      
      // Add remaining weeks after current position
      for (let i = 1; i < weeklyDates.length; i++) {
        updatedDates.splice(index + i, 0, weeklyDates[i])
      }
      
      // Also add corresponding time slots and slot types
      const updatedTimes = [...(prev.availableTimes || [])]
      const updatedSlotTypes = [...(prev.slotTypes || [])]
      
      for (let i = 1; i < weeklyDates.length; i++) {
        updatedTimes.splice(index + i, 0, updatedTimes[index] || '')
        updatedSlotTypes.splice(index + i, 0, updatedSlotTypes[index] || { type: 'stream', expected: 0, booked: 0 })
      }
      
      return { 
        ...prev, 
        availableDates: updatedDates.sort(),
        availableTimes: updatedTimes,
        slotTypes: updatedSlotTypes
      }
    })
  }

  const handleUpdate = async () => {
    if (!formData?.id) return
    try {
      const res = await fetch(`http://localhost:3001/doctors/${formData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Update failed')
      const updated = await res.json()
      setDoctor(updated)
      toast.success('Profile updated with weekly recurring dates!')
      setEditing(false)
    } catch {
      toast.error('Failed to update profile')
    }
  }

  if (!formData) return <p className="text-center mt-10 text-gray-600">Loading profile...</p>

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Group dates by day for display
  const groupedDates = formData.availableDates?.reduce((acc: {[key: string]: string[]}, date) => {
    if (date) {
      const day = getDayFromDate(date)
      if (!acc[day]) acc[day] = []
      acc[day].push(date)
    }
    return acc
  }, {}) || {}

  return (
    <section className="max-w-5xl mx-auto pt-20 pb-16 px-6">
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-lg p-6 md:p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-900">Doctor Profile</h2>
          <button
            onClick={() => (editing ? handleUpdate() : setEditing(true))}
            className={`flex items-center gap-2 px-5 py-2.5 text-white text-sm rounded-lg font-medium transition
            ${editing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {editing ? <Save className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            {editing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-[5px] border-white shadow-md bg-gradient-to-br from-blue-200 to-blue-100">
              {formData.image ? (
                <Image
                  src={formData.image}
                  alt="Doctor"
                  width={144}
                  height={144}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-blue-800">
                  <UserCircle className="w-20 h-20" />
                </div>
              )}
              <div className="absolute bottom-0 w-full text-center text-xs bg-blue-600 text-white py-1 font-medium">
                {formData.speciality || 'Doctor'}
              </div>
            </div>
            {editing && (
              <input
                type="text"
                name="image"
                value={formData.image || ''}
                onChange={handleChange}
                placeholder="Paste Image URL"
                className="mt-3 text-xs w-full px-3 py-1 rounded-md border border-blue-300 focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Qualification', 'qualification'], ['Speciality', 'speciality'], ['Location', 'location'], ['Experience (yrs)', 'experience'], ['Price (₹)', 'price']].map(([label, key]) => (
              <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                <label className="text-xs text-gray-500 block mb-1">{label}</label>
                {!editing ? (
                  <p className="text-blue-900 font-semibold text-sm">{(formData as any)[key] || '-'}</p>
                ) : (
                  <input
                    type={key === 'email' ? 'email' : key === 'price' || key === 'experience' ? 'number' : 'text'}
                    name={key}
                    value={(formData as any)[key] || ''}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}

            <div className="col-span-1 sm:col-span-2 bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
              <label className="text-xs text-gray-500 block mb-2">Weekly Available Schedule</label>
              {!editing ? (
                <div className="space-y-3">
                  {Object.keys(groupedDates).length ? (
                    Object.entries(groupedDates).map(([day, dates]) => (
                      <div key={day} className="bg-blue-50 rounded-lg p-3">
                        <div className="font-medium text-blue-800 text-sm mb-2">{day}s</div>
                        <div className="flex flex-wrap gap-1">
                          {dates.map((date, i) => (
                            <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {new Date(date).toLocaleDateString('en-GB')}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No available days</p>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-xs text-blue-600 mb-3">
                    Select days to automatically generate 4 weeks of recurring appointments
                  </p>
                  {formData.availableDates?.map((date, idx) => {
                    // Skip if this is a generated recurring date (not the first of its kind)
                    const dayName = date ? getDayFromDate(date) : ''
                    const isFirstOfDay = !formData.availableDates?.slice(0, idx).some(d => d && getDayFromDate(d) === dayName)
                    
                    if (!isFirstOfDay && date) return null

                    return (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <select
                          value={dayName}
                          onChange={(e) => handleDaySelection(idx, e.target.value)}
                          className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Day for Weekly Recurrence</option>
                          {daysOfWeek.map((day) => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                        <button onClick={() => deleteArrayItem('availableDates', idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                  <button
                    onClick={() => addArrayItem('availableDates')}
                    className="text-blue-600 hover:underline text-sm mt-1 flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Weekly Day
                  </button>
                </>
              )}
            </div>

            <div className="col-span-1 sm:col-span-2 bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
              <label className="text-xs text-gray-500 block mb-2">Available Time Slots</label>
              {!editing ? (
                <div className="flex flex-wrap gap-2">
                  {formData.availableTimes?.length ? (
                    formData.availableTimes.map((time, i) => (
                      <span key={i} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full shadow">{time}</span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No times available</p>
                  )}
                </div>
              ) : (
                <>
                  {formData.availableTimes?.map((time, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleArrayChange('availableTimes', idx, e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      />
                      <button onClick={() => deleteArrayItem('availableTimes', idx)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('availableTimes')}
                    className="text-blue-600 hover:underline text-sm mt-1 flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Time
                  </button>
                </>
              )}
            </div>

            <div className="col-span-1 sm:col-span-2 bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm text-gray-700 font-medium">Consultation Setup</label>
                {editing && (
                  <button
                    onClick={() => {
                      setFormData((prev) => prev ? {
                        ...prev,
                        slotTypes: [
                          ...(prev.slotTypes || []),
                          { type: 'stream', expected: 0, booked: 0 }
                        ]
                      } : prev)
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Slot
                  </button>
                )}
              </div>
              
              <p className="text-gray-500 text-sm mb-4">
                <strong>Regular:</strong> Continuous patient flow. <br />
                <strong>Group:</strong> Patients in batches.
              </p>

              {!editing ? (
                <div className="space-y-2">
                  {formData.slotTypes?.length ? (
                    formData.slotTypes.map((slot, i) => (
                      <p key={i} className="text-sm text-blue-900 font-medium">
                        {slot.type === 'wave'
                          ? `Group (Booked: ${slot.booked} / Max: ${slot.max})`
                          : `Regular (Booked: ${slot.booked || 0} / Expected: ${slot.expected || 0})`}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No consultation slots configured</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.slotTypes?.map((slot, i) => (
                    <div key={i} className="border rounded-lg p-4 bg-blue-50/50 relative">
                      {formData.slotTypes && formData.slotTypes.length > 1 && (
                        <button
                          onClick={() => {
                            setFormData((prev) => {
                              if (!prev) return prev
                              const updated = [...(prev.slotTypes || [])]
                              updated.splice(i, 1)
                              return { ...prev, slotTypes: updated }
                            })
                          }}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-gray-600 font-medium">Slot Type</label>
                          <select
                            value={slot.type}
                            onChange={(e) => {
                              const updated = [...(formData.slotTypes || [])]
                              if (e.target.value === 'wave') {
                                updated[i] = {
                                  type: 'wave',
                                  expected: 0,
                                  max: 1,
                                  booked: 0
                                }
                              } else {
                                updated[i] = {
                                  type: 'stream',
                                  expected: 0,
                                  booked: 0
                                }
                              }
                              setFormData((prev) => prev ? { ...prev, slotTypes: updated } : prev)
                            }}
                            className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="stream">Regular</option>
                            <option value="wave">Group</option>
                          </select>
                        </div>

                        {slot.type === 'wave' ? (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-600 font-medium">Max Patients</label>
                              <input
                                type="number"
                                min="1"
                                value={slot.max || ''}
                                onChange={(e) => {
                                  const updated = [...(formData.slotTypes || [])]
                                  updated[i] = { ...updated[i], max: Number(e.target.value) }
                                  setFormData((prev) => prev ? { ...prev, slotTypes: updated } : prev)
                                }}
                                className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter max patients"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-600 font-medium">Booked</label>
                              <input
                                type="number"
                                min="0"
                                max={slot.max || 999}
                                value={typeof slot.booked === 'number' ? slot.booked : 0}
                                onChange={(e) => {
                                  const updated = [...(formData.slotTypes || [])]
                                  updated[i] = { ...updated[i], booked: Number(e.target.value) }
                                  setFormData((prev) => prev ? { ...prev, slotTypes: updated } : prev)
                                }}
                                className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-600 font-medium">Expected</label>
                              <input
                                type="number"
                                min="0"
                                value={slot.expected || 0}
                                onChange={(e) => {
                                  const updated = [...(formData.slotTypes || [])]
                                  updated[i] = { ...updated[i], expected: Number(e.target.value) }
                                  setFormData((prev) => prev ? { ...prev, slotTypes: updated } : prev)
                                }}
                                className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="Expected patients"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-600 font-medium">Booked</label>
                              <input
                                type="number"
                                min="0"
                                value={typeof slot.booked === 'number' ? slot.booked : 0}
                                onChange={(e) => {
                                  const updated = [...(formData.slotTypes || [])]
                                  updated[i] = { ...updated[i], booked: Number(e.target.value) }
                                  setFormData((prev) => prev ? { ...prev, slotTypes: updated } : prev)
                                }}
                                className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(!formData.slotTypes || formData.slotTypes.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">No consultation slots added yet</p>
                      <button
                        onClick={() => {
                          setFormData((prev) => prev ? {
                            ...prev,
                            slotTypes: [{ type: 'stream', expected: 0, booked: 0 }]
                          } : prev)
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mx-auto"
                      >
                        <PlusCircle className="w-4 h-4" /> Add First Slot
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}