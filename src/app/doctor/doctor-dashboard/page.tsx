'use client'

import { useEffect, useState } from 'react'
import { useDoctorStore } from '@/context/doctorStore'

interface Appointment {
  id: number
  patient: string
  date: string
  time: string
  doctorId: string
}

export default function DoctorDashboardPage() {
  const { doctor } = useDoctorStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch('http://localhost:3001/appointments')
        const allAppointments: Appointment[] = await res.json()

        const doctorAppointments = allAppointments.filter(
          (appt) => appt.doctorId === doctor?.id
        )
        setAppointments(doctorAppointments)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      }
    }

    if (doctor?.id) fetchAppointments()
  }, [doctor?.id])

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-gradient-to-br from-blue-50 to-white">
  

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-blue-800">
          Welcome, Dr. {doctor?.name || 'Doctor'}
        </h2>

        {/* Appointments Card */}
        <section className="bg-white shadow-xl rounded-2xl p-6 border border-blue-100 mb-8 transition-all">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">Upcoming Appointments</h3>

          {appointments.length > 0 ? (
            <ul className="space-y-4">
              {appointments.map((appt) => (
                <li
                  key={appt.id}
                  className="p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="font-medium text-gray-900"> Patient: {appt.patient}</div>
                  <div className="text-sm text-gray-600">
                     Date: {appt.date} &nbsp;&nbsp;  Time: {appt.time}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No upcoming appointments.</p>
          )}
        </section>

        {/* Quick Actions Card */}
        <section className="bg-white shadow-xl rounded-2xl p-6 border border-blue-100">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">Quick Actions</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/doctor/profile"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-center text-sm font-medium shadow transition duration-200"
            >
               Go to My Profile
            </a>
            <a
              href="/doctor/appointments"
              className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-center text-sm font-medium shadow transition duration-200"
            >
               View All Appointments
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
