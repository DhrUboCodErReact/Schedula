import RegisterForm from '@/app/component/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16 sm:px-10 lg:px-24">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left: Welcome Section */}
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-800 leading-tight">
            Join Our Healthcare Platform
          </h1>
          <p className="text-lg text-gray-600">
            Book appointments with top-rated doctors, access your medical records anytime, and take control of your health journey — all in one place.
          </p>
          <ul className="text-gray-700 list-disc ml-6 space-y-1">
            <li>Instant doctor appointments</li>
            <li>Secure medical history tracking</li>
            <li>Expert healthcare at your fingertips</li>
            <li>Trusted by thousands of patients</li>
          </ul>
          <p className="text-sm text-gray-500 pt-2">
            100% confidential & secure – your data is safe with us.
          </p>
        </div>

        {/* Right: Form Card */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl p-8 sm:p-10">
         

          <RegisterForm />

         
        </div>
      </div>
    </div>
  )
}
