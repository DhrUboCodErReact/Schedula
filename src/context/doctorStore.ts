// context/doctorStore.ts
import { create } from 'zustand'

export interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  qualification: string
  speciality?: string
  location?: string
  price?: number
  experience?: number
  image?: string
  availableDates?: string[]
  availableTimes?: string[]
  slotTypes?: {
    expected: number
    type: 'wave' | 'stream'
    max?: number
    booked?: number | boolean
  }[]
}



interface DoctorStore {
  doctor: Doctor | null
  setDoctor: (doc: Doctor) => void
  logoutDoctor: () => void
  hydrateDoctor: () => void
}

export const useDoctorStore = create<DoctorStore>((set) => ({
  doctor: null,
  setDoctor: (doc) => {
    localStorage.setItem('doctor', JSON.stringify(doc))
    set({ doctor: doc })
  },
  logoutDoctor: () => {
    localStorage.removeItem('doctor')
    set({ doctor: null })
  },
  hydrateDoctor: () => {
    const stored = localStorage.getItem('doctor')
    if (stored) {
      set({ doctor: JSON.parse(stored) })
    }
  },
}))
