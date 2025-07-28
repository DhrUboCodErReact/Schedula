/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DoctorCard from '../component/DoctorCard'
import { LogOut, Filter, MapPin, User, DollarSign } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<any[]>([])
  const [filter, setFilter] = useState({
    name: '',
    speciality: '',
    location: '',
    price: '',
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true'
    if (!loggedIn) {
      router.push('/login')
      return
    }

    fetch('http://localhost:3001/doctors')
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setIsLoading(false)
      })
  }, [])

  const filtered = doctors.filter((doc: any) =>
    doc.name.toLowerCase().includes(filter.name.toLowerCase()) &&
    doc.speciality.toLowerCase().includes(filter.speciality.toLowerCase()) &&
    doc.location.toLowerCase().includes(filter.location.toLowerCase()) &&
    (filter.price ? doc.price <= parseInt(filter.price) : true)
  )

  if (isLoading) return <div className="p-6 text-blue-600 font-medium">Loading...</div>

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-blue-800">Explore Top Doctors</h1>
        <button
          onClick={() => {
            localStorage.clear()
            router.push('/login')
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={18} />
          <input
            placeholder="Search by Name"
            onChange={(e) => setFilter({ ...filter, name: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-blue-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={18} />
          <input
            placeholder="Speciality"
            onChange={(e) => setFilter({ ...filter, speciality: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-purple-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />
          <input
            placeholder="Location"
            onChange={(e) => setFilter({ ...filter, location: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-green-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500" size={18} />
          <input
            placeholder="Max Price"
            type="number"
            onChange={(e) => setFilter({ ...filter, price: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-amber-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((doc: any) => (
          <DoctorCard key={doc.id} doctor={doc} />
        ))}
      </div>
    </div>
  )
}
