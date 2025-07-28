/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { UserCircle, Stethoscope } from 'lucide-react'

interface Medicine {
  name: string
  dosage: string
  frequency: string
}

interface Prescription {
  id: string
  date: string
  doctor: string
  medicine: Medicine[]
  notes: string
}

interface User {
  id: string
  name: string
  email: string
  phone: string
  age: number | null
  gender: string
  bloodGroup: string
  medicalConditions: string[]
  allergies: string[]
  prescriptions: Prescription[]
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const router = useRouter()
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  useEffect(() => {
    if (!userId) {
      toast.error('No user logged in. Redirecting...')
      router.push('/login')
      return
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:3001/users/${userId}`)
        const data = await res.json()
        setUser(data)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!user) return
    const { name, value } = e.target
    setUser({ ...user, [name]: value })
  }

  const handleUpdate = async () => {
    if (!user) return
    try {
      const res = await fetch(`http://localhost:3001/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })
      if (!res.ok) throw new Error('Failed to update user')
      toast.success('Profile updated successfully')
      setEditing(false)
    } catch (error) {
      toast.error('Update failed')
      console.error(error)
    }
  }

  if (loading || !user) {
    return <p className="text-center mt-10 text-blue-700 font-semibold">Loading profile...</p>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <Toaster position="top-center" />

      <div className="bg-white border border-blue-200 rounded-xl shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-800 flex items-center gap-2">
            <UserCircle className="w-8 h-8" /> User Profile
          </h1>
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {editing ? (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-blue-900 font-medium">Full Name</label>
                <input name="name" value={user.name} onChange={handleChange} className="input" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-blue-900 font-medium">Email</label>
                <input name="email" value={user.email} onChange={handleChange} className="input" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-blue-900 font-medium">Phone</label>
                <input name="phone" value={user.phone} onChange={handleChange} className="input" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-blue-900 font-medium">Age</label>
                <input
                  name="age"
                  value={user.age ?? ''}
                  onChange={handleChange}
                  type="number"
                  className="input"
                  placeholder="Enter your age"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-blue-900 font-medium">Gender</label>
                <select name="gender" value={user.gender} onChange={handleChange} className="input">
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-blue-900 font-medium">Blood Group</label>
                <select name="bloodGroup" value={user.bloodGroup} onChange={handleChange} className="input">
                  <option value="">Select Blood Group</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                  <option>O+</option>
                  <option>O-</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-blue-900 font-medium">Medical Conditions</label>
                <input
                  name="medicalConditions"
                  value={user.medicalConditions.join(',')}
                  onChange={(e) =>
                    setUser({ ...user, medicalConditions: e.target.value.split(',').map((v) => v.trim()) })
                  }
                  className="input"
                  placeholder="e.g., Diabetes, Asthma"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-blue-900 font-medium">Allergies</label>
                <input
                  name="allergies"
                  value={user.allergies.join(',')}
                  onChange={(e) =>
                    setUser({ ...user, allergies: e.target.value.split(',').map((v) => v.trim()) })
                  }
                  className="input"
                  placeholder="e.g., Penicillin"
                />
              </div>

              <button
                className="md:col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                onClick={handleUpdate}
              >
                Save Changes
              </button>
            </>
          ) : (
            <>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone}</p>
              <p><strong>Age:</strong> {user.age ?? 'Not set'}</p>
              <p><strong>Gender:</strong> {user.gender || 'Not set'}</p>
              <p><strong>Blood Group:</strong> {user.bloodGroup || 'Not set'}</p>
              <p><strong>Medical Conditions:</strong> {user.medicalConditions.join(', ') || 'None'}</p>
              <p><strong>Allergies:</strong> {user.allergies.join(', ') || 'None'}</p>
            </>
          )}
        </div>

        {/* Prescriptions Section */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <Stethoscope className="w-6 h-6" /> Prescriptions
          </h2>
          {user.prescriptions.length > 0 ? (
            user.prescriptions.map((p) => (
              <div key={p.id} className="bg-gray-50 border border-blue-100 p-4 rounded-md mb-4 shadow-sm">
                <p><strong>Date:</strong> {p.date}</p>
                <p><strong>Doctor:</strong> {p.doctor}</p>
                <p><strong>Notes:</strong> {p.notes}</p>
                <ul className="list-disc pl-6 mt-2 text-sm text-blue-900">
                  {p.medicine.map((m, idx) => (
                    <li key={idx}>
                      {m.name} – {m.dosage} ({m.frequency})
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-blue-600">No prescriptions available.</p>
          )}
        </div>
      </div>
    </div>
  )
}
