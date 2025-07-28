/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

export default function DoctorRegisterForm() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    qualification: '',
    speciality: '',
    location: '',
    experience: '',
  })

  const medicalDegrees = [
    'MBBS',
    'MD (Doctor of Medicine)',
    'MS (Master of Surgery)',
    'DM (Doctorate of Medicine)',
    'MCh (Master of Chirurgiae)',
    'BDS (Bachelor of Dental Surgery)',
    'MDS (Master of Dental Surgery)',
    'BAMS (Ayurveda)',
    'BHMS (Homeopathy)',
    'BUMS (Unani)',
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validations
    if (!formData.email.includes('@')) return toast.error('Invalid email format')
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) return toast.error('Invalid phone number')

    try {
      const res = await fetch('http://localhost:3001/doctors')
      const doctors = await res.json()

      const exists = doctors.some(
        (doc: any) => doc.email === formData.email || doc.phone === formData.phone
      )

      if (exists) {
        toast.error('Doctor already registered!')
        return
      }

      const createRes = await fetch('http://localhost:3001/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!createRes.ok) throw new Error('Registration failed')

      toast.success('Registration successful! Redirecting to login...')
      setTimeout(() => router.push('/doctor/login'), 2000)
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong during registration')
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded shadow border">
      <Toaster position="top-center" />
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Doctor Registration</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="input"
          required
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          placeholder="Email"
          className="input"
          required
        />
        <input
          name="password"
          value={formData.password}
          onChange={handleChange}
          type="password"
          placeholder="Password"
          className="input"
          required
        />
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 9876543210"
          className="input"
          required
        />
        <select
          name="qualification"
          value={formData.qualification}
          onChange={handleChange}
          className="input"
          required
        >
          <option value="">Select Qualification</option>
          {medicalDegrees.map((degree) => (
            <option key={degree} value={degree}>{degree}</option>
          ))}
        </select>
        <input
          name="speciality"
          value={formData.speciality}
          onChange={handleChange}
          placeholder="Speciality (e.g. Cardiologist)"
          className="input"
          required
        />
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location (e.g. Mumbai)"
          className="input"
          required
        />
        <input
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          placeholder="Experience in Years"
          type="number"
          className="input"
          required
        />

        <button
          type="submit"
          className="col-span-1 md:col-span-2 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-2"
        >
          Register
        </button>
      </form>
    </div>
  )
}
