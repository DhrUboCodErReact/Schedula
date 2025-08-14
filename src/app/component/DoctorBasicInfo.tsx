/* eslint-disable @typescript-eslint/no-explicit-any */
// components/DoctorBasicInfo.tsx
'use client'

import { useState } from 'react'
import { Doctor } from '@/context/doctorStore'
import { UserCircle } from 'lucide-react'
import Image from 'next/image'

interface DoctorBasicInfoProps {
  doctor: Doctor
  isEditing: boolean
  onUpdate: (updates: Partial<Doctor>) => void
}

export default function DoctorBasicInfo({ doctor, isEditing, onUpdate }: DoctorBasicInfoProps) {
  const [formData, setFormData] = useState<Partial<Doctor>>(doctor)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)
    onUpdate(updatedData)
  }

  const basicFields = [
    { label: 'Name', key: 'name', type: 'text', required: true },
    { label: 'Email', key: 'email', type: 'email', required: true },
    { label: 'Phone', key: 'phone', type: 'tel', required: true },
    { label: 'Qualification', key: 'qualification', type: 'text', required: true },
    { label: 'Speciality', key: 'speciality', type: 'text', required: false },
    { label: 'Location', key: 'location', type: 'text', required: false },
    { label: 'Experience (years)', key: 'experience', type: 'text', required: false },
    { label: 'Consultation Fee (₹)', key: 'price', type: 'number', required: false }
  ]

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
      {/* Profile Image Section */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-200 to-blue-100">
          {formData.image ? (
            <Image
              src={formData.image}
              alt="Doctor Profile"
              width={160}
              height={160}
              className="object-cover w-full h-full"
              onError={() => setFormData(prev => ({...prev, image: ''}))}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-blue-800">
              <UserCircle className="w-24 h-24" />
            </div>
          )}
          
          {/* Speciality Badge */}
          <div className="absolute bottom-0 w-full text-center text-xs bg-blue-600 text-white py-2 font-medium">
            {formData.speciality || 'Doctor'}
          </div>
        </div>
        
        {/* Image URL Input - Only in Edit Mode */}
        {isEditing && (
          <div className="mt-4 w-full max-w-xs">
            <label className="text-xs text-gray-600 block mb-1">Profile Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image || ''}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full text-xs px-3 py-2 rounded-md border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste an image URL or leave blank for default
            </p>
          </div>
        )}
      </div>

      {/* Basic Information Grid */}
      <div className="flex-1 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {basicFields.map(({ label, key, type, required }) => (
            <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
              <label className="text-xs text-gray-600 font-medium block mb-2 items-center gap-1">
                {label}
                {required && <span className="text-red-500">*</span>}
              </label>
              
              {!isEditing ? (
                <p className="text-blue-900 font-semibold text-sm min-h-[1.25rem]">
                  {(formData as any)[key] || '-'}
                  {key === 'price' && formData.price && ' ₹'}
                  {key === 'experience' && formData.experience && ' years'}
                </p>
              ) : (
                <input
                  type={type}
                  name={key}
                  value={(formData as any)[key] || ''}
                  onChange={handleChange}
                  required={required}
                  min={type === 'number' ? '0' : undefined}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={
                    key === 'price' ? 'Enter consultation fee' :
                    key === 'experience' ? 'Years of experience' :
                    key === 'phone' ? '+91 XXXXXXXXXX' :
                    key === 'email' ? 'doctor@example.com' :
                    `Enter ${label.toLowerCase()}`
                  }
                />
              )}
            </div>
          ))}
        </div>

        {/* Additional Info in Edit Mode */}
        {isEditing && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Default Appointment Settings</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Default Start Time</label>
                <input
                  type="time"
                  name="defaultStartTime"
                  value={formData.defaultStartTime || '09:00'}
                  onChange={handleChange}
                  className="w-full text-xs px-2 py-1 rounded border border-blue-300 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600 block mb-1">Default End Time</label>
                <input
                  type="time"
                  name="defaultEndTime"
                  value={formData.defaultEndTime || '17:00'}
                  onChange={handleChange}
                  className="w-full text-xs px-2 py-1 rounded border border-blue-300 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600 block mb-1">Default Slot Duration</label>
                <select
                  name="defaultSlotDuration"
                  value={formData.defaultSlotDuration || 30}
                  onChange={(e) => handleChange({target: {name: 'defaultSlotDuration', value: e.target.value}} as any)}
                  className="w-full text-xs px-2 py-1 rounded border border-blue-300 focus:ring-1 focus:ring-blue-500"
                >
                  <option value={15}>15 min</option>
                  <option value={20}>20 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-600 block mb-1">Default Type</label>
                <select
                  name="defaultSlotType"
                  value={formData.defaultSlotType || 'stream'}
                  onChange={(e) => handleChange({target: {name: 'defaultSlotType', value: e.target.value}} as any)}
                  className="w-full text-xs px-2 py-1 rounded border border-blue-300 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="stream">Individual</option>
                  <option value="wave">Group</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              These defaults will be used when creating new appointment slots
            </p>
          </div>
        )}
      </div>
    </div>
  )
}