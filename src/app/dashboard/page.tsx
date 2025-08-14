/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBookingStore } from '@/context/useBookingStore'
import DoctorCard from '../component/DoctorCard'
import { Filter, MapPin, User, DollarSign, Search, X } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { setDoctor } = useBookingStore()
  const [doctors, setDoctors] = useState<any[]>([])
  const [filter, setFilter] = useState({
    name: '',
    speciality: '',
    location: '',
    price: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState(0)

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

  // Count active filters
  useEffect(() => {
    const count = Object.values(filter).filter(value => value !== '').length
    setActiveFilters(count)
  }, [filter])

  const filtered = doctors.filter((doc: any) =>
    doc.name.toLowerCase().includes(filter.name.toLowerCase()) &&
    doc.speciality.toLowerCase().includes(filter.speciality.toLowerCase()) &&
    doc.location.toLowerCase().includes(filter.location.toLowerCase()) &&
    (filter.price ? doc.price <= parseInt(filter.price) : true)
  )

  // Function to handle booking appointment
  const handleBookAppointment = (doctorId: string) => {
    // Find the selected doctor from the doctors array
    const selectedDoctor = doctors.find(doc => doc.id === doctorId)
    
    if (selectedDoctor) {
      // Set the doctor in the booking store
      setDoctor(selectedDoctor)
      // Navigate to the booking page
      router.push('/booking')
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setFilter({
      name: '',
      speciality: '',
      location: '',
      price: '',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium text-lg">Loading amazing doctors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Explore Top Doctors
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find the perfect healthcare professional for your needs with our advanced search and filtering system
          </p>
        </div>

        {/* Modern Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Search className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Smart Filters</h2>
              {activeFilters > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                  {activeFilters} active
                </span>
              )}
            </div>
            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <X size={16} />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Name Filter */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 transition-colors group-focus-within:text-blue-600" size={18} />
                <input
                  value={filter.name}
                  placeholder="Search by name..."
                  onChange={(e) => setFilter({ ...filter, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Speciality Filter */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speciality
              </label>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 transition-colors group-focus-within:text-purple-600" size={18} />
                <input
                  value={filter.speciality}
                  placeholder="e.g., Cardiology..."
                  onChange={(e) => setFilter({ ...filter, speciality: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 transition-colors group-focus-within:text-green-600" size={18} />
                <input
                  value={filter.location}
                  placeholder="City or area..."
                  onChange={(e) => setFilter({ ...filter, location: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Price Filter */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Consultation Fee
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500 transition-colors group-focus-within:text-amber-600" size={18} />
                <input
                  value={filter.price}
                  placeholder="Max price..."
                  type="number"
                  onChange={(e) => setFilter({ ...filter, price: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing <span className="font-semibold text-blue-600">{filtered.length}</span> of{' '}
                <span className="font-semibold">{doctors.length}</span> doctors
              </span>
              {filtered.length !== doctors.length && (
                <span className="text-green-600 font-medium">
                  ✓ Filters applied
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Doctor Cards */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((doc: any) => (
              <DoctorCard 
                key={doc.id} 
                doctor={doc} 
                onBookAppointment={handleBookAppointment}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No doctors found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters to find more doctors that match your criteria.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}