/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState } from 'react';
import { useDoctorStore } from '@/context/doctorStore';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, isAfter, isBefore, isToday, parseISO } from 'date-fns';
import { CalendarDays, Clock, UserCircle2 } from 'lucide-react';

type Appointment = {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  userId: string;
  status?: 'pending' | 'completed';
};

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  bloodGroup: string;
  medicalConditions: string[];
  allergies: string[];
  prescriptions: string[];
};

const COLORS = ['#10b981', '#f59e0b', '#6366f1']; // green, yellow, indigo

export default function DoctorAppointmentsPage() {
  const { doctor, hydrateDoctor } = useDoctorStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    hydrateDoctor();
    setHydrated(true);
  }, []);

  useEffect(() => {
    const fetchAppointmentsAndUsers = async () => {
      try {
        const [appointmentsRes, usersRes] = await Promise.all([
          fetch('http://localhost:3001/appointments'),
          fetch('http://localhost:3001/users'),
        ]);

        const appointmentsData: Appointment[] = await appointmentsRes.json();
        const usersData: User[] = await usersRes.json();

        const doctorAppointments = appointmentsData
          .filter((a) => a.doctorId === doctor?.id)
          .map((a) => ({ ...a, status: a.status ?? 'pending' }));

        setAppointments(doctorAppointments);
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (doctor?.id) fetchAppointmentsAndUsers();
  }, [doctor?.id]);

  const markCompleted = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!res.ok) throw new Error('Failed to update appointment.');

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'completed' } : a))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to mark appointment as completed.');
    }
  };

  const upcoming = appointments.filter(
    (a) =>
      (isAfter(parseISO(a.date), today) || isToday(parseISO(a.date))) &&
      a.status !== 'completed'
  );

  const previous = appointments.filter(
    (a) =>
      isBefore(parseISO(a.date), today) &&
      a.status === 'completed' &&
      a.doctorId === doctor?.id
  );

  const missed = appointments.filter(
    (a) =>
      isBefore(parseISO(a.date), today) &&
      a.status !== 'completed' &&
      a.doctorId === doctor?.id
  );

  const chartData = [
    {
      name: 'Completed',
      value: appointments.filter((a) => a.status === 'completed').length,
    },
    {
      name: 'Pending',
      value: appointments.filter((a) => a.status !== 'completed').length,
    },
    {
      name: 'Total',
      value: appointments.length,
    },
  ];

  const completedToday = appointments.filter(
    (a) => isToday(parseISO(a.date)) && a.status === 'completed'
  ).length;

  const openUserDetails = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) setSelectedUser(user);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
  };

  if (!hydrated || loading)
    return <div className="p-4 text-gray-600 text-center">Loading appointments...</div>;

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 sm:mb-8 text-center sm:text-left">
        Dr. {doctor?.name || 'Doctor'}’s Appointments
      </h2>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total Appointments</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            {appointments.length}
          </h3>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Completed Today</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            {completedToday}
          </h3>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-orange-500">
          <p className="text-sm text-gray-500">Pending</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            {appointments.filter((a) => a.status !== 'completed').length}
          </h3>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <section className="mb-10">
        <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-4 sm:mb-5">
          Upcoming Appointments
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming appointments.</p>
        ) : (
          <ul className="space-y-4">
            {upcoming.map((a) => {
              const user = users.find((u) => u.id === a.userId);
              return (
                <li
                  key={a.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 rounded-xl bg-white shadow hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-0">
                    <UserCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        Patient: {user?.name || 'Unknown'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 flex flex-wrap items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {format(parseISO(a.date), 'dd MMM yyyy')}
                        &nbsp;&nbsp;
                        <Clock className="w-4 h-4" /> {a.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openUserDetails(a.userId)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => markCompleted(a.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm"
                    >
                      Mark as Completed
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Previous Appointments */}
      <section className="mb-10">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 sm:mb-5">
          Previous Appointments
        </h3>
        {previous.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No previous completed appointments.
          </p>
        ) : (
          <ul className="space-y-4">
            {previous.map((a) => (
              <li
                key={a.id}
                className="p-4 rounded-xl bg-gray-50 border border-gray-200 shadow-sm text-sm sm:text-base"
              >
                <p className="text-gray-800">
                  <strong>Date:</strong> {format(parseISO(a.date), 'dd MMM yyyy')}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className="text-green-600">{a.status}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Missed Appointments */}
      <section className="mb-10">
        <h3 className="text-lg sm:text-xl font-semibold text-red-700 mb-4 sm:mb-5">
          Missed Appointments
        </h3>
        {missed.length === 0 ? (
          <p className="text-gray-500 text-sm">No missed appointments.</p>
        ) : (
          <ul className="space-y-4">
            {missed.map((a) => (
              <li
                key={a.id}
                className="p-4 rounded-xl bg-red-50 border border-red-200 shadow-sm text-sm sm:text-base"
              >
                <p className="text-gray-800">
                  <strong>Date:</strong> {format(parseISO(a.date), 'dd MMM yyyy')}
                </p>
                <p className="text-red-600">
                  <strong>Status:</strong> Missed (Not Completed)
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pie Chart Section */}
      <section className="relative bg-gradient-to-tr from-purple-50 to-white border border-purple-100 rounded-2xl shadow-lg p-5 sm:p-6 overflow-hidden mb-16">
        <h3 className="text-xl sm:text-2xl font-bold text-purple-800 mb-6 flex items-center gap-2">
          Weekly Appointment Summary
        </h3>
        <div className="absolute right-4 top-4 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full shadow-sm">
          Doctor Analytics
        </div>
        <div className="h-[300px] relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                label={({ name, percent }) =>
                  `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                labelLine={false}
                stroke="#fff"
                strokeWidth={2}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number, name: string) => [
                  `${value}`,
                  `${name}`,
                ]}
              />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-sm text-gray-400">Total</div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-700">
            {chartData.find((c) => c.name === 'Total')?.value || 0}
          </div>
        </div>
      </section>

      {/* Patient Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg p-5 sm:p-6 w-full max-w-md shadow-xl relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-lg"
              onClick={closeUserDetails}
            >
              ✕
            </button>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-600">
              Patient Details
            </h2>
            <p><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Phone:</strong> {selectedUser.phone}</p>
            <p><strong>Age:</strong> {selectedUser.age}</p>
            <p><strong>Gender:</strong> {selectedUser.gender}</p>
            <p><strong>Blood Group:</strong> {selectedUser.bloodGroup}</p>
            <p><strong>Medical Conditions:</strong> {selectedUser.medicalConditions.length > 0 ? selectedUser.medicalConditions.join(', ') : 'None'}</p>
            <p><strong>Allergies:</strong> {selectedUser.allergies.length > 0 ? selectedUser.allergies.join(', ') : 'None'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
