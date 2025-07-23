/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import {
  CalendarCheck2,
  Clock3,
  Stethoscope,
  Trash2,
  PhoneCall,
  Mail,
  Info
} from 'lucide-react'

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctorData, setDoctorData] = useState<any[]>([])

  useEffect(() => {
    fetch('http://localhost:3001/appointments')
      .then((res) => res.json())
      .then(setAppointments)

    fetch('http://localhost:3001/doctors')
      .then((res) => res.json())
      .then(setDoctorData)
  }, [])

  const handleCancel = async (id: number) => {
    await fetch(`http://localhost:3001/appointments/${id}`, { method: 'DELETE' })
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }

  const getDoctor = (id: number) => doctorData.find((doc) => doc.id === id)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="max-w-4xl mx-auto p-6 flex-1">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">
          Your Appointments
        </h1>

        {appointments.length === 0 ? (
          <p className="text-center text-blue-500 font-medium">
            No appointments booked yet. Stay healthy!
          </p>
        ) : (
          <ul className="space-y-6">
            {appointments.map((a) => {
              const doctor = getDoctor(a.doctorId)

              return (
                <li
                  key={a.id}
                  className="border-l-4 border-blue-600 bg-blue-50 hover:bg-blue-100 shadow-md rounded-md p-5 relative transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-blue-800 font-semibold text-lg">
                        <Stethoscope className="w-5 h-5" />
                        <span>{doctor?.name || 'Unknown Doctor'}</span>
                      </div>
                      <div className="text-blue-600 font-medium">
                        {doctor?.speciality || 'Speciality not listed'}
                      </div>

                      <div className="flex gap-6 mt-2 text-sm text-blue-700 font-medium">
                        <p className="flex items-center gap-1">
                          <CalendarCheck2 className="w-4 h-4" />
                          {a.date}
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock3 className="w-4 h-4" />
                          {a.time}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCancel(a.id)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                      title="Cancel Appointment"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>

      
    </div>
  )
}
