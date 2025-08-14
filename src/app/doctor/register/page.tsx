/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { Stethoscope, ShieldCheck, UserCheck } from 'lucide-react'

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

    if (!formData.email.includes('@')) return toast.error('Invalid email format')
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) return toast.error('Invalid phone number')

    try {
      const res = await fetch('https://mock-api-schedula-1-xzbk.onrender.com/doctors')
      const doctors = await res.json()

      const exists = doctors.some(
        (doc: any) => doc.email === formData.email || doc.phone === formData.phone
      )

      if (exists) {
        toast.error('Doctor already registered!')
        return
      }

      const createRes = await fetch('https://mock-api-schedula-1-xzbk.onrender.com/doctors', {
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
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <Toaster position="top-center" />

      {/* Left Content */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 border-r border-gray-200 bg-white text-slate-800">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="flex items-center gap-2 text-indigo-700">
            <Stethoscope size={36} />
            <h1 className="text-3xl font-bold">Join Schedula Health</h1>
          </div>
          <p className="text-base leading-relaxed text-slate-600">
            Empower your practice with our secure, modern platform built for doctors.
            Manage appointments, connect with patients, and track your medical journey in one place.
          </p>

          <div className="space-y-4 text-slate-700">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-indigo-600" size={22} />
              <span><strong>Secure & Trusted</strong><br />Your data is protected with medical-grade encryption.</span>
            </div>
            <div className="flex items-start gap-3">
              <UserCheck className="text-indigo-600" size={22} />
              <span><strong>Verified Doctor Community</strong><br />Connect with verified peers from across the country.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-white p-8 border border-gray-200 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-800 text-center mb-6">
            Doctor Registration
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="Email"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              placeholder="Password"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <select
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location (e.g. Mumbai)"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Experience in Years"
              type="number"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />

            <button
              type="submit"
              className="col-span-1 md:col-span-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md transition"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
