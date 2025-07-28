'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  UserCircle,
  CalendarDays,
  Stethoscope,
} from 'lucide-react'

const links = [
  { name: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
  { name: 'My Profile', href: '/doctor/profile', icon: UserCircle },
  { name: 'Appointments', href: '/doctor/appointments', icon: CalendarDays },
]

export default function DoctorSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full sm:w-64 bg-white shadow-md h-screen px-4 py-6 flex flex-col justify-between border-r">
      {/* Logo & Title */}
      <div>
        <div className="flex items-center space-x-3 mb-8">
          <Stethoscope className="text-blue-600 w-7 h-7" />
          <span className="text-xl font-bold text-blue-700">DocPortal</span>
        </div>

        {/* Nav Links */}
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-blue-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer (optional) */}
      <div className="text-xs text-gray-400 text-center mt-8 sm:mt-0">
        © 2025 DocPortal. All rights reserved.
      </div>
    </aside>
  )
}
