'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Stethoscope, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useDoctorStore } from '@/context/doctorStore'

type NavItem = {
  name: string
  path: string
  onClick?: () => void
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const doctor = useDoctorStore((state) => state.doctor)
  const logoutDoctor = useDoctorStore((state) => state.logoutDoctor)

  const handleLogout = () => {
    logoutDoctor()
    localStorage.removeItem('doctorId')
    toast.success('Logged out successfully!')
    router.push('/')
  }

  const navItems: NavItem[] = [
    { name: 'Doctor List', path: '/dashboard' },
    { name: 'Booking', path: '/booking' },
    { name: 'Appointments', path: '/my-appointments' },
    { name: 'Profile', path: '/userprofile' },
  ]

  const doctorNavItems: NavItem[] = [
    {name:'Profile', path:'/doctor/profile'},
    { name: 'Dashboard', path: '/doctor/doctor-dashboard' },
    {name:'My-Appointments', path:'/doctor/appointments'},
    { name: 'Logout', path: '/', onClick: handleLogout }

  ]

  const guestNavItems: NavItem[] = [
    ...navItems,
    { name: 'Doctor Portal', path: '/doctor/login' },
  ]

  const itemsToRender = doctor ? doctorNavItems : guestNavItems

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-blue-700" />
          <h1 className="text-2xl font-bold text-blue-700">Schedula Health</h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-6">
          {itemsToRender.map((item) =>
            item.onClick ? (
              <button
                key={item.name}
                onClick={item.onClick}
                className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.name}
              </button>
            ) : (
              <Link
                key={item.path}
                href={item.path}
                className={`text-base font-medium transition-colors ${
                  pathname === item.path
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            )
          )}
        </div>

        {/* Hamburger Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-blue-700" />
            ) : (
              <Menu className="w-6 h-6 text-blue-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white px-6 pb-4"
          >
            <div className="flex flex-col gap-4">
              {itemsToRender.map((item) =>
                item.onClick ? (
                  <button
                    key={item.name}
                    onClick={() => {
                      setMenuOpen(false)
                      item.onClick?.()
                    }}
                    className="text-base font-medium text-gray-700 hover:text-blue-600 text-left"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`text-base font-medium transition-colors ${
                      pathname === item.path
                        ? 'text-blue-600 border-b border-blue-600 pb-1'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
