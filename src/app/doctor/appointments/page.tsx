/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useDoctorStore } from "@/context/doctorStore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, isAfter, isBefore, isToday, parseISO } from "date-fns";
import {
  CalendarDays,
  Clock,
  UserCircle2,
  FileText,
  Eye,
  Plus,
} from "lucide-react";
import AppointmentCalendar from "@/app/component/AppointmentCalendar";
import PrescriptionManager from "@/app/component/PrescriptionManager";

type Appointment = {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  userId: string;
  status?: "pending" | "completed" | "confirmed";
  paymentMethod?: string;
  paymentStatus?: string;
  amount?: number;
  prescription?: {
    id: string;
    medicines: any[];
    diagnosis: string;
    symptoms: string;
    vitalSigns: {
      bloodPressure: string;
      heartRate: string;
      temperature: string;
      weight: string;
    };
    followUpDate?: string;
    additionalNotes: string;
    createdAt: string;
    updatedAt: string;
  };
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

const COLORS = ["#10b981", "#f59e0b", "#6366f1", "#ef4444"]; // green, yellow, indigo, red

export default function DoctorAppointmentsPage() {
  const { doctor, hydrateDoctor } = useDoctorStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPrescriptionManager, setShowPrescriptionManager] = useState(false);
  const [
    selectedAppointmentForPrescription,
    setSelectedAppointmentForPrescription,
  ] = useState<string | null>(null);
  const [viewingPrescription, setViewingPrescription] =
    useState<Appointment | null>(null);

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
          fetch("https://mock-api-schedula-1-xzbk.onrender.com/appointments"),
          fetch("https://mock-api-schedula-1-xzbk.onrender.com/users"),
        ]);

        const appointmentsData: Appointment[] = await appointmentsRes.json();
        const usersData: User[] = await usersRes.json();

        const doctorAppointments = appointmentsData
          .filter((a) => a.doctorId === doctor?.id)
          .map((a) => ({
            ...a,
            status: a.status ?? "pending",
          }));

        setAppointments(doctorAppointments);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (doctor?.id) fetchAppointmentsAndUsers();
  }, [doctor?.id]);

  const markCompleted = async (id: string, withPrescription = false) => {
    if (withPrescription) {
      // Open prescription manager for this specific appointment
      setSelectedAppointmentForPrescription(id);
      setShowPrescriptionManager(true);
    } else {
      // Just mark as completed without prescription
      try {
        const res = await fetch(`https://mock-api-schedula-1-xzbk.onrender.com/appointments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        });

        if (!res.ok) throw new Error("Failed to update appointment.");

        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "completed" } : a))
        );
      } catch (err) {
        console.error(err);
        alert("Failed to mark appointment as completed.");
      }
    }
  };

  const refreshAppointments = async () => {
    if (!doctor?.id) return;

    try {
      const appointmentsRes = await fetch("https://mock-api-schedula-1-xzbk.onrender.com/appointments");
      const appointmentsData: Appointment[] = await appointmentsRes.json();

      const doctorAppointments = appointmentsData
        .filter((a) => a.doctorId === doctor.id)
        .map((a) => ({
          ...a,
          status: a.status ?? "pending",
        }));

      setAppointments(doctorAppointments);
    } catch (error) {
      console.error("Failed to refresh appointments:", error);
    }
  };

  // Function to handle prescription creation/update completion
  const handlePrescriptionComplete = () => {
    setShowPrescriptionManager(false);
    setSelectedAppointmentForPrescription(null);
    refreshAppointments(); // Refresh appointments when prescription is completed
  };

  // Filter appointments based on status and date
  const upcoming = appointments.filter(
    (a) =>
      (isAfter(parseISO(a.date), today) || isToday(parseISO(a.date))) &&
      a.status !== "completed"
  );

  const previous = appointments.filter(
    (a) => isBefore(parseISO(a.date), today) && a.status === "completed"
  );

  const missed = appointments.filter(
    (a) => isBefore(parseISO(a.date), today) && a.status !== "completed"
  );

  // Updated chart data to handle all status types including missed
  const completedCount = appointments.filter(
    (a) => a.status === "completed"
  ).length;
  const pendingCount = appointments.filter(
    (a) => a.status === "pending"
  ).length;
  const confirmedCount = appointments.filter(
    (a) => a.status === "confirmed"
  ).length;
  const missedCount = missed.length;

  const chartData = [
    {
      name: "Completed",
      value: completedCount,
    },
    {
      name: "Confirmed",
      value: confirmedCount,
    },
    {
      name: "Pending",
      value: pendingCount,
    },
    {
      name: "Missed",
      value: missedCount,
    },
  ].filter((item) => item.value > 0); // Only show categories with values

  const completedToday = appointments.filter(
    (a) => isToday(parseISO(a.date)) && a.status === "completed"
  ).length;

  const openUserDetails = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) setSelectedUser(user);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
  };

  const viewPrescription = (appointment: Appointment) => {
    setViewingPrescription(appointment);
  };

  if (!hydrated || loading)
    return (
      <div className="p-4 text-gray-600 text-center">
        Loading appointments...
      </div>
    );

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 sm:mb-8 text-center sm:text-left">
        Dr. {doctor?.name || "Doctor"}'s Appointments
      </h2>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-10">
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
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-indigo-500">
          <p className="text-sm text-gray-500">Confirmed</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            {confirmedCount}
          </h3>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-orange-500">
          <p className="text-sm text-gray-500">Pending</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            {pendingCount}
          </h3>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Missed</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            {missedCount}
          </h3>
        </div>
      </div>

      {/* Calendar Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowCalendar(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          View Calendar
        </button>
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
                        Patient: {user?.name || "Unknown"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 flex flex-wrap items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {format(parseISO(a.date), "dd MMM yyyy")}
                        &nbsp;&nbsp;
                        <Clock className="w-4 h-4" /> {a.time}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          a.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {a.status?.toUpperCase()}
                      </span>
                      {a.amount && (
                        <p className="text-xs text-gray-500 mt-1">
                          Amount: ₹{a.amount}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 p-1">
                    {/* Secondary Action - Details */}
                    <button
                      onClick={() => openUserDetails(a.userId)}
                      className="group relative inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-700 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl hover:bg-slate-50/90 hover:border-slate-300/80 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-white active:scale-98 transition-all duration-300 ease-out shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-50/0 via-slate-50/40 to-slate-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <svg
                        className="relative w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m11.25 11.25.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                        />
                      </svg>
                      <span className="relative">View Details</span>
                    </button>

                    {/* Primary Action - Complete */}
                    <button
                      onClick={() => markCompleted(a.id, true)}
                      className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 rounded-xl hover:from-emerald-600 hover:via-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-white active:scale-95 transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-1 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out"></div>
                      <Plus className="relative w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                      <span className="relative">
                        Add Prescription & Complete
                      </span>
                      <svg
                        className="relative w-4 h-4 ml-2 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-110"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
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
            {previous.map((a) => {
              const user = users.find((u) => u.id === a.userId);
              const hasPrescription = !!a.prescription;
              return (
                <li
                  key={a.id}
                  className="flex flex-col lg:flex-row justify-between items-start p-4 rounded-xl bg-gray-50 border border-gray-200 shadow-sm text-sm sm:text-base"
                >
                  <div className="flex-1 mb-3 lg:mb-0">
                    <div className="flex items-start gap-3 mb-2">
                      <UserCircle2 className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="text-gray-800 font-medium">
                          <strong>Patient:</strong> {user?.name || "Unknown"}
                        </p>
                        <p className="text-gray-800">
                          <strong>Date:</strong>{" "}
                          {format(parseISO(a.date), "dd MMM yyyy")} at {a.time}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-green-600 font-medium">
                            {a.status}
                          </span>
                          {hasPrescription && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              Prescription Available
                            </span>
                          )}
                        </div>
                        {a.amount && (
                          <p className="text-gray-600 text-sm">
                            <strong>Amount:</strong> ₹{a.amount}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 p-1">
                    {/* Patient Details Button */}
                    <button
                      onClick={() => openUserDetails(a.userId)}
                      className="group relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-blue-700 bg-blue-50/80 backdrop-blur-sm border border-blue-200/60 rounded-xl hover:bg-blue-100/90 hover:border-blue-300/80 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-white active:scale-98 transition-all duration-300 ease-out shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5 overflow-hidden"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-50/0 via-blue-100/40 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <svg
                        className="relative w-4 h-4 mr-2.5 transition-all duration-200 group-hover:scale-110 group-hover:-rotate-12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="relative">Patient Details</span>
                    </button>

                    {/* Conditional Prescription Buttons */}
                    {hasPrescription ? (
                      /* View Prescription Button */
                      <button
                        onClick={() => viewPrescription(a)}
                        className="group relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-600 rounded-xl hover:from-emerald-600 hover:via-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-white active:scale-95 transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-1 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out"></div>
                        <Eye className="relative w-4 h-4 mr-2.5 transition-all duration-200 group-hover:scale-110 group-hover:rotate-12" />
                        <span className="relative">View Prescription</span>
                        <div className="relative ml-2 w-1.5 h-1.5 bg-white/80 rounded-full transition-all duration-200 group-hover:w-2 group-hover:h-2 group-hover:bg-white"></div>
                      </button>
                    ) : (
                      /* Add Prescription Button */
                      <button
                        onClick={() => {
                          setSelectedAppointmentForPrescription(a.id);
                          setShowPrescriptionManager(true);
                        }}
                        className="group relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 rounded-xl hover:from-amber-600 hover:via-orange-700 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-white active:scale-95 transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-1 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out"></div>
                        <FileText className="relative w-4 h-4 mr-2.5 transition-all duration-200 group-hover:scale-110 group-hover:rotate-12" />
                        <span className="relative">Add Prescription</span>
                        <svg
                          className="relative w-4 h-4 ml-2 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-110"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
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
            {missed.map((a) => {
              const user = users.find((u) => u.id === a.userId);
              return (
                <li
                  key={a.id}
                  className="p-4 rounded-xl bg-red-50 border border-red-200 shadow-sm text-sm sm:text-base"
                >
                  <div className="flex items-start gap-3">
                    <UserCircle2 className="w-8 h-8 text-red-400" />
                    <div>
                      <p className="text-gray-800">
                        <strong>Patient:</strong> {user?.name || "Unknown"}
                      </p>
                      <p className="text-gray-800">
                        <strong>Date:</strong>{" "}
                        {format(parseISO(a.date), "dd MMM yyyy")} at {a.time}
                      </p>
                      <p className="text-red-600">
                        <strong>Status:</strong> Missed (Not Completed)
                      </p>
                      {a.amount && (
                        <p className="text-gray-600">
                          <strong>Amount:</strong> ₹{a.amount}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Enhanced Pie Chart Section */}
      <section className="relative bg-gradient-to-tr from-purple-50 to-blue-50 border border-purple-100 rounded-2xl shadow-xl p-5 sm:p-6 overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-blue-100/50"></div>
        <div className="relative z-10">
          <h3 className="text-xl sm:text-2xl font-bold text-purple-800 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Appointment Status Analytics
          </h3>
          <div className="absolute right-4 top-4 bg-purple-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
            Doctor Dashboard
          </div>

          {chartData.length > 0 ? (
            <div className="h-[400px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    innerRadius={70}
                    label={({ name, percent }) =>
                      `${name} (${((percent ?? 0) * 100).toFixed(1)}%)`
                    }
                    labelLine={false}
                    stroke="#fff"
                    strokeWidth={3}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} appointments`,
                      `${name}`,
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{
                      paddingTop: "20px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Statistics */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
                  <div className="text-sm text-gray-500 mb-1">Total</div>
                  <div className="text-3xl sm:text-4xl font-bold text-purple-700 mb-1">
                    {appointments.length}
                  </div>
                  <div className="text-xs text-gray-400">Appointments</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <p className="text-purple-600 font-medium">
                  No appointment data available
                </p>
              </div>
            </div>
          )}

          {/* Status Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {chartData.map((item, index) => (
              <div
                key={item.name}
                className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.name}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {item.value}
                </div>
                <div className="text-xs text-gray-500">
                  {appointments.length > 0
                    ? `${((item.value / appointments.length) * 100).toFixed(
                        1
                      )}% of total`
                    : "0% of total"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calendar Modal */}
      {showCalendar && (
        <AppointmentCalendar
          onClose={() => setShowCalendar(false)}
          doctorId={doctor?.id || ""}
        />
      )}

      {/* Enhanced Prescription Manager Modal */}
      {showPrescriptionManager && selectedAppointmentForPrescription && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="w-full h-full bg-white overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Prescription Manager
                </h2>
                <p className="text-sm text-gray-600">
                  Creating prescription for appointment:{" "}
                  {selectedAppointmentForPrescription}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPrescriptionManager(false);
                  setSelectedAppointmentForPrescription(null);
                  refreshAppointments(); // Refresh appointments when closing
                }}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PrescriptionManager
                doctorId={doctor?.id || ""}
                selectedAppointmentId={selectedAppointmentForPrescription}
                onPrescriptionComplete={handlePrescriptionComplete}
              />
            </div>
          </div>
        </div>
      )}

      {/* Prescription Viewer Modal */}
      {viewingPrescription && viewingPrescription.prescription && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-blue-800">
                  Medical Prescription
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => setViewingPrescription(null)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Patient & Appointment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 rounded-xl p-6">
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">
                    Patient Information
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Name:</strong>{" "}
                      {users.find((u) => u.id === viewingPrescription.userId)
                        ?.name || "Unknown"}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {format(
                        parseISO(viewingPrescription.date),
                        "dd MMM yyyy"
                      )}
                    </p>
                    <p>
                      <strong>Time:</strong> {viewingPrescription.time}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">
                    Prescription Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>ID:</strong> {viewingPrescription.prescription.id}
                    </p>
                    <p>
                      <strong>Medicines:</strong>{" "}
                      {viewingPrescription.prescription.medicines.length}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {format(
                        new Date(viewingPrescription.prescription.createdAt),
                        "dd MMM yyyy"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              {viewingPrescription.prescription.diagnosis && (
                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Diagnosis
                  </h4>
                  <p className="text-gray-800">
                    {viewingPrescription.prescription.diagnosis}
                  </p>
                </div>
              )}

              {/* Medicines */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-blue-800 mb-4">
                  Prescribed Medications (
                  {viewingPrescription.prescription.medicines.length})
                </h4>
                <div className="grid gap-4">
                  {viewingPrescription.prescription.medicines.map(
                    (medicine: any, index: number) => (
                      <div
                        key={medicine.id}
                        className="bg-white rounded-lg p-4 border border-blue-200"
                      >
                        <h5 className="font-bold text-blue-700 mb-2">
                          {index + 1}. {medicine.name}
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="font-semibold">Dosage:</span>{" "}
                            {medicine.dosage}
                          </div>
                          <div>
                            <span className="font-semibold">Frequency:</span>{" "}
                            {medicine.frequency}
                          </div>
                          <div>
                            <span className="font-semibold">Duration:</span>{" "}
                            {medicine.duration}
                          </div>
                          <div>
                            <span className="font-semibold">Food:</span>{" "}
                            {medicine.beforeAfterFood}
                          </div>
                        </div>
                        {medicine.instructions && (
                          <div className="mt-2 text-sm text-blue-700">
                            <span className="font-semibold">Instructions:</span>{" "}
                            {medicine.instructions}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Vital Signs */}
              {(viewingPrescription.prescription.vitalSigns.bloodPressure ||
                viewingPrescription.prescription.vitalSigns.heartRate ||
                viewingPrescription.prescription.vitalSigns.temperature ||
                viewingPrescription.prescription.vitalSigns.weight) && (
                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Vital Signs
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {viewingPrescription.prescription.vitalSigns
                      .bloodPressure && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>
                          BP:{" "}
                          {
                            viewingPrescription.prescription.vitalSigns
                              .bloodPressure
                          }
                        </span>
                      </div>
                    )}
                    {viewingPrescription.prescription.vitalSigns.heartRate && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>
                          HR:{" "}
                          {
                            viewingPrescription.prescription.vitalSigns
                              .heartRate
                          }{" "}
                          bpm
                        </span>
                      </div>
                    )}
                    {viewingPrescription.prescription.vitalSigns
                      .temperature && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>
                          Temp:{" "}
                          {
                            viewingPrescription.prescription.vitalSigns
                              .temperature
                          }
                          °F
                        </span>
                      </div>
                    )}
                    {viewingPrescription.prescription.vitalSigns.weight && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>
                          Weight:{" "}
                          {viewingPrescription.prescription.vitalSigns.weight}{" "}
                          kg
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Notes & Follow-up */}
              {(viewingPrescription.prescription.additionalNotes ||
                viewingPrescription.prescription.followUpDate) && (
                <div className="bg-orange-50 rounded-xl p-6">
                  <h4 className="font-semibold text-orange-800 mb-3">
                    Additional Information
                  </h4>
                  {viewingPrescription.prescription.followUpDate && (
                    <div className="mb-3">
                      <span className="font-medium text-gray-700">
                        Follow-up Date:
                      </span>
                      <p className="text-gray-800">
                        {format(
                          new Date(
                            viewingPrescription.prescription.followUpDate
                          ),
                          "dd MMM yyyy"
                        )}
                      </p>
                    </div>
                  )}
                  {viewingPrescription.prescription.additionalNotes && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Additional Notes:
                      </span>
                      <p className="text-gray-800 mt-1">
                        {viewingPrescription.prescription.additionalNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-gray-200 pt-6 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Prescription generated on{" "}
                  {format(
                    new Date(viewingPrescription.prescription.createdAt),
                    "dd MMM yyyy"
                  )}
                  at{" "}
                  {format(
                    new Date(viewingPrescription.prescription.createdAt),
                    "HH:mm"
                  )}
                </p>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-800 font-medium mb-2 flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    Important Medical Instructions
                  </p>
                  <div className="text-xs text-red-700 space-y-1 text-left">
                    <p>
                      • Take medications exactly as prescribed. Do not skip
                      doses or stop early.
                    </p>
                    <p>
                      • Contact your doctor immediately if you experience severe
                      side effects.
                    </p>
                    <p>• Keep this prescription for your medical records.</p>
                    <p>
                      • Do not share medications with others, even with similar
                      symptoms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {/* Premium Patient Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="relative flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {selectedUser.name}
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Complete Medical Profile
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      Patient ID: {selectedUser.id.slice(0, 8)}
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      {
                        appointments.filter((a) => a.userId === selectedUser.id)
                          .length
                      }{" "}
                      Appointments
                    </span>
                  </div>
                </div>
                <button
                  className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all duration-200 hover:scale-105"
                  onClick={closeUserDetails}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto max-h-[calc(95vh-160px)]">
              {/* Quick Stats Dashboard */}
              <div className="p-8 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <UserCircle2 className="w-5 h-5 text-white" />
                  </div>
                  Patient Overview
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                      Age
                    </p>
                    <p className="text-2xl font-bold text-blue-800">
                      {selectedUser.age}
                    </p>
                    <p className="text-xs text-blue-600">years old</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                      Phone
                    </p>
                    <p className="text-lg font-bold text-green-800">
                      {selectedUser.phone}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                      Gender
                    </p>
                    <p className="text-lg font-bold text-purple-800">
                      {selectedUser.gender}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-2xl border border-red-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-red-600 uppercase tracking-wide">
                      Blood Group
                    </p>
                    <p className="text-xl font-bold text-red-800">
                      {selectedUser.bloodGroup}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CalendarDays className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                      Appointments
                    </p>
                    <p className="text-2xl font-bold text-orange-800">
                      {
                        appointments.filter((a) => a.userId === selectedUser.id)
                          .length
                      }
                    </p>
                    <p className="text-xs text-orange-600">total visits</p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-2xl border border-indigo-200 hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                      Prescriptions
                    </p>
                    <p className="text-2xl font-bold text-indigo-800">
                      {
                        appointments.filter(
                          (a) => a.userId === selectedUser.id && a.prescription
                        ).length
                      }
                    </p>
                    <p className="text-xs text-indigo-600">issued</p>
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  Medical Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl border border-red-100 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-red-800">
                        Medical Conditions
                      </h3>
                    </div>
                    {selectedUser.medicalConditions.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUser.medicalConditions.map(
                          (condition, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-red-200/50"
                            >
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-red-800 font-medium">
                                {condition}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg
                              className="w-8 h-8 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <p className="text-green-600 font-medium">
                            No Medical Conditions
                          </p>
                          <p className="text-green-500 text-sm">
                            Patient is healthy
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-2xl border border-orange-100 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-orange-800">
                        Allergies
                      </h3>
                    </div>
                    {selectedUser.allergies.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUser.allergies.map((allergy, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-orange-200/50"
                          >
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-orange-800 font-medium">
                              {allergy}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg
                              className="w-8 h-8 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <p className="text-green-600 font-medium">
                            No Known Allergies
                          </p>
                          <p className="text-green-500 text-sm">
                            Safe to prescribe
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Appointment History Section */}
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  Appointment History & Medical Records
                </h2>

                {(() => {
                  const userAppointments = appointments
                    .filter((a) => a.userId === selectedUser.id)
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );

                  const completedCount = userAppointments.filter(
                    (a) => a.status === "completed"
                  ).length;
                  const pendingCount = userAppointments.filter(
                    (a) => a.status !== "completed"
                  ).length;
                  const prescriptionCount = userAppointments.filter(
                    (a) => a.prescription
                  ).length;

                  return (
                    <div>
                      {/* Statistics Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                            Completed
                          </p>
                          <p className="text-3xl font-bold text-green-800 mb-1">
                            {completedCount}
                          </p>
                          <p className="text-sm text-green-600">
                            Successfully treated
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-6 rounded-2xl border border-yellow-200 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center">
                              <Clock className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">
                            Pending
                          </p>
                          <p className="text-3xl font-bold text-yellow-800 mb-1">
                            {pendingCount}
                          </p>
                          <p className="text-sm text-yellow-600">
                            Awaiting consultation
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                            Prescriptions
                          </p>
                          <p className="text-3xl font-bold text-purple-800 mb-1">
                            {prescriptionCount}
                          </p>
                          <p className="text-sm text-purple-600">
                            Medical prescriptions
                          </p>
                        </div>
                      </div>

                      {/* Appointments Timeline */}
                      {userAppointments.length > 0 ? (
                        <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                          {userAppointments.map((appointment, index) => (
                            <div key={appointment.id} className="relative">
                              {/* Timeline Line */}
                              {index < userAppointments.length - 1 && (
                                <div className="absolute left-6 top-16 w-0.5 h-16 bg-gradient-to-b from-blue-300 to-transparent"></div>
                              )}

                              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ml-4">
                                <div className="flex items-start gap-6">
                                  {/* Timeline Dot */}
                                  <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                      appointment.status === "completed"
                                        ? "bg-green-500"
                                        : appointment.status === "confirmed"
                                        ? "bg-blue-500"
                                        : "bg-yellow-500"
                                    }`}
                                  >
                                    <CalendarDays className="w-6 h-6 text-white" />
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                      <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                                          {format(
                                            parseISO(appointment.date),
                                            "EEEE, dd MMMM yyyy"
                                          )}
                                        </h3>
                                        <p className="text-gray-600 mb-2">
                                          Time: {appointment.time}
                                        </p>
                                        <div className="flex items-center gap-3">
                                          <span
                                            className={`px-3 py-1 text-sm font-medium rounded-full ${
                                              appointment.status === "completed"
                                                ? "bg-green-100 text-green-800"
                                                : appointment.status ===
                                                  "confirmed"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}
                                          >
                                            {appointment.status?.toUpperCase()}
                                          </span>
                                          {appointment.amount && (
                                            <span className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-full">
                                              ₹{appointment.amount}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {appointment.prescription && (
                                        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 rounded-xl border border-purple-200">
                                          <span className="text-purple-800 font-medium text-sm flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Prescription Available
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Prescription Details */}
                                    {appointment.prescription && (
                                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200 mt-4">
                                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                          <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-white" />
                                          </div>
                                          Medical Prescription
                                        </h4>

                                        <div className="space-y-4">
                                          {appointment.prescription
                                            .diagnosis && (
                                            <div className="bg-white p-4 rounded-xl border border-blue-200">
                                              <h5 className="font-semibold text-blue-800 mb-2">
                                                Diagnosis
                                              </h5>
                                              <p className="text-gray-800">
                                                {
                                                  appointment.prescription
                                                    .diagnosis
                                                }
                                              </p>
                                            </div>
                                          )}

                                          {appointment.prescription.medicines &&
                                            appointment.prescription.medicines
                                              .length > 0 && (
                                              <div className="bg-white p-4 rounded-xl border border-green-200">
                                                <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                                  <span>
                                                    Prescribed Medicines
                                                  </span>
                                                  <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
                                                    {
                                                      appointment.prescription
                                                        .medicines.length
                                                    }
                                                  </span>
                                                </h5>
                                                <div className="space-y-3">
                                                  {appointment.prescription.medicines.map(
                                                    (medicine, index) => (
                                                      <div
                                                        key={
                                                          medicine.id || index
                                                        }
                                                        className="bg-green-50 p-4 rounded-xl border border-green-200"
                                                      >
                                                        <div className="flex items-start justify-between mb-2">
                                                          <h6 className="font-bold text-green-800 text-lg">
                                                            {medicine.name}
                                                          </h6>
                                                          <span className="bg-green-200 text-green-800 px-2 py-1 text-xs rounded-full">
                                                            {medicine.dosage}
                                                          </span>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                                          <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-green-600" />
                                                            <span className="text-green-700">
                                                              {
                                                                medicine.frequency
                                                              }
                                                            </span>
                                                          </div>
                                                          <div className="flex items-center gap-2">
                                                            <CalendarDays className="w-4 h-4 text-green-600" />
                                                            <span className="text-green-700">
                                                              {
                                                                medicine.duration
                                                              }
                                                            </span>
                                                          </div>
                                                          <div className="flex items-center gap-2">
                                                            <svg
                                                              className="w-4 h-4 text-green-600"
                                                              fill="none"
                                                              stroke="currentColor"
                                                              strokeWidth="2"
                                                              viewBox="0 0 24 24"
                                                            >
                                                              <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                              />
                                                            </svg>
                                                            <span className="text-green-700">
                                                              {
                                                                medicine.beforeAfterFood
                                                              }
                                                            </span>
                                                          </div>
                                                        </div>
                                                        {medicine.instructions && (
                                                          <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                                                            <p className="text-green-800 text-sm">
                                                              <span className="font-medium">
                                                                Instructions:
                                                              </span>{" "}
                                                              {
                                                                medicine.instructions
                                                              }
                                                            </p>
                                                          </div>
                                                        )}
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                          {/* Vital Signs */}
                                          {(appointment.prescription.vitalSigns
                                            ?.bloodPressure ||
                                            appointment.prescription.vitalSigns
                                              ?.heartRate ||
                                            appointment.prescription.vitalSigns
                                              ?.temperature ||
                                            appointment.prescription.vitalSigns
                                              ?.weight) && (
                                            <div className="bg-white p-4 rounded-xl border border-orange-200">
                                              <h5 className="font-semibold text-orange-800 mb-3">
                                                Vital Signs
                                              </h5>
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {appointment.prescription
                                                  .vitalSigns.bloodPressure && (
                                                  <div className="bg-red-50 p-3 rounded-xl text-center border border-red-200">
                                                    <div className="text-red-600 text-sm font-medium">
                                                      Blood Pressure
                                                    </div>
                                                    <div className="text-red-800 font-bold text-lg">
                                                      {
                                                        appointment.prescription
                                                          .vitalSigns
                                                          .bloodPressure
                                                      }
                                                    </div>
                                                  </div>
                                                )}
                                                {appointment.prescription
                                                  .vitalSigns.heartRate && (
                                                  <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-200">
                                                    <div className="text-blue-600 text-sm font-medium">
                                                      Heart Rate
                                                    </div>
                                                    <div className="text-blue-800 font-bold text-lg">
                                                      {
                                                        appointment.prescription
                                                          .vitalSigns.heartRate
                                                      }{" "}
                                                      bpm
                                                    </div>
                                                  </div>
                                                )}
                                                {appointment.prescription
                                                  .vitalSigns.temperature && (
                                                  <div className="bg-orange-50 p-3 rounded-xl text-center border border-orange-200">
                                                    <div className="text-orange-600 text-sm font-medium">
                                                      Temperature
                                                    </div>
                                                    <div className="text-orange-800 font-bold text-lg">
                                                      {
                                                        appointment.prescription
                                                          .vitalSigns
                                                          .temperature
                                                      }
                                                      °F
                                                    </div>
                                                  </div>
                                                )}
                                                {appointment.prescription
                                                  .vitalSigns.weight && (
                                                  <div className="bg-purple-50 p-3 rounded-xl text-center border border-purple-200">
                                                    <div className="text-purple-600 text-sm font-medium">
                                                      Weight
                                                    </div>
                                                    <div className="text-purple-800 font-bold text-lg">
                                                      {
                                                        appointment.prescription
                                                          .vitalSigns.weight
                                                      }{" "}
                                                      kg
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}

                                          {/* Follow-up and Notes */}
                                          {(appointment.prescription
                                            .followUpDate ||
                                            appointment.prescription
                                              .additionalNotes) && (
                                            <div className="bg-white p-4 rounded-xl border border-indigo-200">
                                              <h5 className="font-semibold text-indigo-800 mb-3">
                                                Additional Information
                                              </h5>
                                              <div className="space-y-3">
                                                {appointment.prescription
                                                  .followUpDate && (
                                                  <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200">
                                                    <div className="flex items-center gap-3">
                                                      <CalendarDays className="w-5 h-5 text-indigo-600" />
                                                      <div>
                                                        <span className="text-indigo-600 font-medium text-sm">
                                                          Follow-up Appointment
                                                        </span>
                                                        <p className="text-indigo-800 font-bold">
                                                          {format(
                                                            new Date(
                                                              appointment.prescription.followUpDate
                                                            ),
                                                            "EEEE, dd MMMM yyyy"
                                                          )}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                                {appointment.prescription
                                                  .additionalNotes && (
                                                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                    <h6 className="font-medium text-gray-700 mb-2">
                                                      Doctor's Notes
                                                    </h6>
                                                    <p className="text-gray-800 leading-relaxed">
                                                      {
                                                        appointment.prescription
                                                          .additionalNotes
                                                      }
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}

                                          {/* Prescription Footer */}
                                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                            <div className="flex items-center justify-between text-sm">
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span className="text-blue-700 font-medium">
                                                  Prescription ID:{" "}
                                                  {appointment.prescription.id.slice(
                                                    0,
                                                    8
                                                  )}
                                                </span>
                                              </div>
                                              <span className="text-blue-600">
                                                Issued:{" "}
                                                {format(
                                                  new Date(
                                                    appointment.prescription.createdAt
                                                  ),
                                                  "dd MMM yyyy"
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CalendarDays className="w-12 h-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-600 mb-2">
                            No Appointment History
                          </h3>
                          <p className="text-gray-500">
                            This patient has no recorded appointments yet.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Contact Information Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Quick Contact
                    </h3>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>{selectedUser.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-2">
                      Profile Last Accessed
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {format(new Date(), "dd MMM yyyy 'at' HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
