/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })

  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const existingRes = await fetch('http://localhost:3001/users')
      const users = await existingRes.json()

      const alreadyExists = users.some(
        (user: any) =>
          user.email === formData.email || user.phone === formData.phone
      )

      if (alreadyExists) {
        toast.error('User already registered. Please log in.')
        return
      }

      const res = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Registration failed')

      toast.success('Registration successful! Redirecting to login...')

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      console.error(err)
      toast.error('Error during registration')
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-blue-200 space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-800">Create Your Account</h2>
          <p className="text-sm text-gray-600 mt-1">It only takes a minute to register</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">Full Name</label>
          <input
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-md bg-white text-blue-900 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">Email</label>
          <input
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-md bg-white text-blue-900 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-md bg-white text-blue-900 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">Phone Number</label>
          <input
            name="phone"
            placeholder="+91 9876543210"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-md bg-white text-blue-900 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition"
        >
          Register
        </button>

        <p className="text-sm text-center text-gray-500 mt-2">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </>
  )
}
