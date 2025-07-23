// context/useBookingStore.ts
import { create } from 'zustand'

type Doctor = {
  id: number
  name: string
  speciality: string
  location: string
  price: number
  rating: number
  experience: number
  availableDates: string[]
  availableTimes: string[]
}

type Appointment = {
  doctor: Doctor
  date: string
  time: string
}

interface BookingStore {
  selectedDoctor: Doctor | null
  selectedDate: string
  selectedTime: string
  appointments: Appointment[]
  setDoctor: (doctor: Doctor) => void
  setDate: (date: string) => void
  setTime: (time: string) => void
  addAppointment: (appointment: Appointment) => void
  resetBooking: () => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedDoctor: null,
  selectedDate: '',
  selectedTime: '',
  appointments: [],
  setDoctor: (doctor) => set({ selectedDoctor: doctor }),
  setDate: (date) => set({ selectedDate: date }),
  setTime: (time) => set({ selectedTime: time }),
  addAppointment: (appointment) =>
    set((state) => ({
      appointments: [...state.appointments, appointment],
    })),
  resetBooking: () =>
    set({
      selectedDoctor: null,
      selectedDate: '',
      selectedTime: '',
    }),
}))
