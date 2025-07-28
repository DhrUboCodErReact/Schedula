/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useDoctorStore } from '@/context/doctorStore'

export default function DoctorLogin() {
  const router = useRouter()
  const setDoctor = useDoctorStore((state) => state.setDoctor)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('http://localhost:3001/doctors')
      const doctors = await res.json()

      const doctor = doctors.find(
        (doc: any) => doc.email === email && doc.password === password
      )

      if (!doctor) {
        toast.error('Invalid credentials')
        return
      }

      // ✅ Save doctor in Zustand and persist in localStorage
      setDoctor(doctor)
      localStorage.setItem('doctorId', doctor.id)

      toast.success('Login successful! Redirecting...')
      setTimeout(() => router.push('/doctor/doctor-dashboard'), 1500)
    } catch (err) {
      console.error('Login error:', err)
      toast.error('Something went wrong during login.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-blue-50">
      <Toaster position="top-center" />
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-8 space-y-4 w-full max-w-md border border-blue-200"
      >
        <h2 className="text-2xl font-bold text-blue-800 text-center">Doctor Login</h2>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Email</span>
          <input
            type="email"
            name="email"
            value={email}
            placeholder="doctor@example.com"
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Password</span>
          <input
            type="password"
            name="password"
            value={password}
            placeholder="Your password"
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1"
            required
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Login
        </button>

        <p className="text-sm text-center text-gray-600">
          New doctor?{' '}
          <a href="/doctor/register" className="text-blue-600 underline hover:text-blue-800">
            Register here
          </a>
        </p>
      </form>
    </div>
  )
}
