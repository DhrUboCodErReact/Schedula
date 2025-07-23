'use client'

import { useRouter } from 'next/navigation'
import { CalendarCheck2, Clock3, Stethoscope, Users, Hospital, ShieldCheck } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="grid md:grid-cols-2 min-h-screen">
        {/* Left Panel - Branding and Login CTA */}
        <div className="flex flex-col justify-center px-12 py-20 border-r border-gray-200">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">MediCare+</h1>
          <p className="text-lg mb-6 leading-relaxed text-gray-600">
            Your trusted platform for instant doctor appointments. Connect with certified medical professionals from the comfort of your home.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-fit px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            Login to Book Appointments
          </button>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Stethoscope className="text-blue-600" /> 500+ Verified Doctors
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <CalendarCheck2 className="text-blue-600" /> Real-time Appointment Booking
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Clock3 className="text-blue-600" /> 24/7 Availability
            </div>
          </div>
        </div>

        {/* Right Panel - Healthcare Visual & Info */}
        <div className="flex items-center justify-center bg-blue-50 px-10 py-20">
          <div className="max-w-2xl space-y-10">
            <h2 className="text-3xl font-bold text-blue-800">Why Choose Schedula Health ?</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FeatureCard
                icon={<Users className="text-blue-600" />}
                title="Trusted by Thousands"
                desc="Over 1 million users have trusted us for their healthcare needs."
              />
              <FeatureCard
                icon={<ShieldCheck className="text-blue-600" />}
                title="Secure & Private"
                desc="All data is encrypted and secured for your peace of mind."
              />
              <FeatureCard
                icon={<Hospital className="text-blue-600" />}
                title="Top Hospitals"
                desc="We partner with India’s top hospitals and clinics."
              />
              <FeatureCard
                icon={<Clock3 className="text-blue-600" />}
                title="Flexible Scheduling"
                desc="Book slots at your convenience, even on weekends."
              />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">One Platform. All Health Solutions.</h3>
              <p className="text-gray-600">
                From booking appointments to consulting specialists online, MediCare+ simplifies your healthcare journey with a few taps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h4 className="text-lg font-semibold text-blue-700">{title}</h4>
      </div>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  )
}
