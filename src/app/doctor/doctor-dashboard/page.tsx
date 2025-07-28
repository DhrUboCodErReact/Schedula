/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useDoctorStore } from '@/context/doctorStore'
import { isAfter, isToday, parseISO } from 'date-fns'

export default function DoctorDashboardPage() {
  const { doctor } = useDoctorStore()
  const [appointments, setAppointments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    const fetchAppointmentsAndUsers = async () => {
      try {
        const [appointmentsRes, usersRes] = await Promise.all([
          fetch('http://localhost:3001/appointments'),
          fetch('http://localhost:3001/users'),
        ])

        const appointmentsData = await appointmentsRes.json()
        const usersData = await usersRes.json()

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const filtered = appointmentsData.filter((appt: any) => {
          const apptDate = parseISO(appt.date)
          const isUpcoming = isToday(apptDate) || isAfter(apptDate, today)
          const isPending = (appt.status ?? 'pending') === 'pending'
          return appt.doctorId === doctor?.id && isUpcoming && isPending
        })

        setAppointments(filtered)
        setUsers(usersData)
      } catch (err) {
        console.error('Error fetching:', err)
      }
    }

    if (doctor?.id) fetchAppointmentsAndUsers()
  }, [doctor?.id])

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 text-blue-900">
          Welcome, Dr. {doctor?.name || 'Doctor'}
        </h2>

        {/* Appointments Section */}
        <section className="bg-gradient-to-tr from-blue-200 to-blue-50 shadow-xl rounded-2xl p-6 border border-blue-300 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">
            Upcoming Appointments (Pending)
          </h3>

          {appointments.length > 0 ? (
            <ul className="space-y-4">
              {appointments.map((appt: any) => {
                const user = users.find((u: any) => u.id === appt.userId)

                return (
                  <li
                    key={appt.id}
                    className="p-4 rounded-xl border border-blue-300 bg-white hover:bg-blue-50 transition-colors shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Patient: {user?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Date: {appt.date} &nbsp;&nbsp; Time: {appt.time}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-medium px-3 py-1 rounded-full ${
                          appt.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {appt.status ?? 'pending'}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-gray-500 italic">
              No upcoming pending appointments.
            </p>
          )}
        </section>

        {/* Quick Actions */}
        <section className="bg-gradient-to-tr from-gray-100 to-gray-200 shadow-xl rounded-2xl p-6 border border-gray-300">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Quick Actions
          </h3>
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
