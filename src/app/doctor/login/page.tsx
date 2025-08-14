/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { useDoctorStore } from '@/context/doctorStore'
import { Stethoscope, UserCircle2, HeartPulse } from 'lucide-react'

export default function DoctorLogin() {
  const router = useRouter()
  const setDoctor = useDoctorStore((state) => state.setDoctor)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('https://mock-api-schedula-1-xzbk.onrender.com/doctors')
      const doctors = await res.json()

      const doctor = doctors.find(
        (doc: any) => doc.email === email && doc.password === password
      )

      if (!doctor) {
        toast.error('Invalid credentials')
        return
      }

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
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <Toaster position="top-center" />

      {/* Left Info Panel */}
      <div className="flex-1 flex flex-col justify-center items-center text-center p-10 bg-white border-r border-gray-200">
        <div className="max-w-md space-y-6">
          <div className="flex items-center justify-center gap-2 text-indigo-600">
            <Stethoscope size={38} strokeWidth={1.5} />
            <h1 className="text-3xl font-semibold tracking-tight">Schedula Health</h1>
          </div>
          <p className="text-slate-600 leading-relaxed text-base">
            Welcome to Schedula Health — a modern and secure platform tailored for doctors.
            Manage your patients, appointments, and consultations from one place.
          </p>
          <div className="flex justify-center gap-6 pt-4 text-indigo-600">
            <UserCircle2 size={28} />
            <HeartPulse size={28} />
            <Stethoscope size={28} />
          </div>
        </div>
      </div>

      {/* Right Form Panel (Updated Style) */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-8"
        >
          <h2 className="text-2xl font-semibold text-slate-800 text-center">
            Sign in to your account
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                placeholder="doctor@example.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={password}
                placeholder="Your password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md transition"
          >
            Login
          </button>

          <p className="text-sm text-center text-slate-600">
            New here?{' '}
            <a
              href="/doctor/register"
              className="text-indigo-600 hover:underline font-medium"
            >
              Register as a Doctor
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
