'use client'

import { PhoneCall, Mail, Info } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-sm md:text-base">
        {/* Brand Info */}
        <div>
          <h3 className="text-2xl font-bold mb-3">Schedula Health</h3>
          <p className="text-blue-100 leading-relaxed">
            Empowering your health journey. Seamlessly connect with trusted doctors and manage appointments with ease and confidence.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-blue-100">
            <li><a href="#" className="hover:underline hover:text-white transition">About Us</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition">Contact</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:underline hover:text-white transition">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Support Info */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Support</h4>
          <div className="space-y-2 text-blue-100">
            <p className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5" /> +91 99999 12345
            </p>
            <p className="flex items-center gap-3">
              <Mail className="w-5 h-5" /> support@schedulahealth.com
            </p>
            <p className="flex items-center gap-3">
              <Info className="w-5 h-5" /> Mon - Sat, 9AM - 6PM
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="text-center text-xs text-blue-300 mt-8">
        © 2025 Schedula Health. All rights reserved.
      </div>
    </footer>
  )
}
