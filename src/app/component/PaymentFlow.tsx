import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

// Type definitions
interface Doctor {
  id: string
  name: string
  speciality: string
  location: string
  price: number
  rating: number
  experience: number
  availableDates: string[]
  availableTimes: string[]
}

interface AppointmentTicket {
  id: string
  doctorName: string
  speciality: string
  date: string
  time: string
  location: string
  amount: number
  paymentMethod: string
  paymentStatus: string
  bookingDate: string
  bookingTime: string
}

interface PaymentFlowProps {
  selectedDoctor: Doctor
  selectedDate: string
  selectedTime: string
  onClose: () => void
  resetBooking: () => void
  
}

export default function PaymentFlow({ 
  selectedDoctor, 
  selectedDate, 
  selectedTime, 
  onClose, 
  resetBooking 
}: PaymentFlowProps) {
  const router = useRouter()
  
  // Payment flow states
  const [showPaymentModal, setShowPaymentModal] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [showCardForm, setShowCardForm] = useState(false)
  const [showPaymentProcessing, setShowPaymentProcessing] = useState(false)
  const [showTicket, setShowTicket] = useState(false)
  const [appointmentTicket, setAppointmentTicket] = useState<AppointmentTicket | null>(null)
  
  // Card details state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })
  
  // Processing steps
  const [processingSteps, setProcessingSteps] = useState([
    { text: 'Fetching user details...', completed: false },
    { text: 'Fetching doctor details...', completed: false },
    { text: 'Processing payment...', completed: false },
    { text: 'Confirming booking...', completed: false }
  ])

  // Handle payment method selection
  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method)
    if (method === 'online') {
      setShowCardForm(true)
    } else {
      // For offline payment, directly process
      processPayment()
    }
  }

  // Validate card details
  const validateCardDetails = () => {
    const { cardNumber, expiryDate, cvv, cardholderName } = cardDetails
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Please enter a valid 16-digit card number')
      return false
    }
    
    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      toast.error('Please enter expiry date in MM/YY format')
      return false
    }
    
    if (!cvv || cvv.length !== 3) {
      toast.error('Please enter a valid 3-digit CVV')
      return false
    }
    
    if (!cardholderName.trim()) {
      toast.error('Please enter cardholder name')
      return false
    }
    
    return true
  }

  // Process payment with loading animation
  const processPayment = async () => {
    if (paymentMethod === 'online' && !validateCardDetails()) {
      return
    }

    setShowPaymentProcessing(true)
    setShowCardForm(false)

    // Simulate processing steps with delays
    const steps = [...processingSteps]
    
    // Step 1: Fetching user details
    await new Promise(resolve => setTimeout(resolve, 1500))
    steps[0].completed = true
    setProcessingSteps([...steps])

    // Step 2: Fetching doctor details
    await new Promise(resolve => setTimeout(resolve, 1200))
    steps[1].completed = true
    setProcessingSteps([...steps])

    // Step 3: Processing payment
    await new Promise(resolve => setTimeout(resolve, 2000))
    steps[2].completed = true
    setProcessingSteps([...steps])

    // Step 4: Confirming booking
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      const userId = localStorage.getItem('userId')
      const appointmentData = {
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedTime,
        userId,
        status: 'confirmed',
        paymentMethod,
        paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
        amount: selectedDoctor.price
      }

      const response = await fetch('https://mock-api-schedula-1-xzbk.onrender.com/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        throw new Error('Failed to book appointment')
      }

      const result = await response.json()
      
      steps[3].completed = true
      setProcessingSteps([...steps])

      // Create appointment ticket
      const ticket = {
        id: result.id || Math.random().toString(36).substr(2, 9).toUpperCase(),
        doctorName: selectedDoctor.name,
        speciality: selectedDoctor.speciality,
        date: selectedDate,
        time: selectedTime,
        location: selectedDoctor.location,
        amount: selectedDoctor.price,
        paymentMethod: paymentMethod === 'online' ? 'Online Payment' : 'Pay at Clinic',
        paymentStatus: paymentMethod === 'online' ? 'Paid' : 'Pending',
        bookingDate: new Date().toLocaleDateString(),
        bookingTime: new Date().toLocaleTimeString()
      }

      setAppointmentTicket(ticket)

      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setShowPaymentProcessing(false)
      setShowTicket(true)
      
      toast.success(`Appointment booked successfully with ${selectedDoctor.name}!`)

    } catch (error) {
      console.error('❌ Booking failed:', error)
      toast.error('Failed to book appointment. Please try again.')
      setShowPaymentProcessing(false)
      setShowPaymentModal(false)
      onClose()
    }
  }

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  // Close all modals and redirect
  const handleCloseTicket = () => {
    setShowTicket(false)
    setShowPaymentModal(false)
    resetBooking()
    router.push('/my-appointments')
  }

  // Handle closing payment modal
  const handleClosePayment = () => {
    setShowPaymentModal(false)
    onClose()
  }

  return (
    <>
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            {!showCardForm ? (
              <>
                <h3 className="text-2xl font-bold text-blue-800 text-center mb-6">
                  Choose Payment Method
                </h3>
                
                <div className="space-y-4">
                  <button
                    onClick={() => handlePaymentMethodSelect('online')}
                    className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-blue-900">Pay Online</div>
                        <div className="text-sm text-gray-600">Credit/Debit Card, UPI</div>
                      </div>
                    </div>
                    <div className="text-blue-600">→</div>
                  </button>

                  <button
                    onClick={() => handlePaymentMethodSelect('offline')}
                    className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z" clipRule="evenodd"/>
                          <path d="M9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-green-900">Pay at Clinic</div>
                        <div className="text-sm text-gray-600">Cash payment during visit</div>
                      </div>
                    </div>
                    <div className="text-green-600">→</div>
                  </button>
                </div>

                <button
                  onClick={handleClosePayment}
                  className="w-full mt-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-blue-800 text-center mb-6">
                  Card Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({
                        ...cardDetails,
                        cardNumber: formatCardNumber(e.target.value)
                      })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '')
                          if (value.length >= 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4)
                          }
                          setCardDetails({
                            ...cardDetails,
                            expiryDate: value
                          })
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({
                          ...cardDetails,
                          cvv: e.target.value.replace(/\D/g, '').substring(0, 3)
                        })}
                        placeholder="123"
                        maxLength={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardDetails.cardholderName}
                      onChange={(e) => setCardDetails({
                        ...cardDetails,
                        cardholderName: e.target.value.toUpperCase()
                      })}
                      placeholder="JOHN SMITH"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-900 font-semibold">Total Amount:</span>
                      <span className="text-blue-900 font-bold text-lg">₹{selectedDoctor.price}</span>
                    </div>
                  </div>

                  <button
                    onClick={processPayment}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    Pay ₹{selectedDoctor.price}
                  </button>

                  <button
                    onClick={() => {
                      setShowCardForm(false)
                      setPaymentMethod('')
                    }}
                    className="w-full py-2 text-gray-600 hover:text-gray-800"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentProcessing && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-blue-800 mb-6">Processing Your Booking...</h3>
              
              <div className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {step.completed ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      ) : (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-left ${step.completed ? 'text-green-600' : 'text-gray-600'}`}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Ticket Modal */}
      {showTicket && appointmentTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600">Your appointment has been successfully booked</p>
            </div>

            {/* Ticket Design */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-300 rounded-xl p-6 relative">
              {/* Ticket Header */}
              <div className="text-center border-b border-blue-300 pb-4 mb-4">
                <h4 className="text-xl font-bold text-blue-800">APPOINTMENT TICKET</h4>
                <p className="text-blue-600 text-sm">Booking ID: #{appointmentTicket.id}</p>
              </div>

              {/* Appointment Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Doctor:</span>
                  <span className="text-blue-800 font-semibold">Dr. {appointmentTicket.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Speciality:</span>
                  <span className="text-blue-800">{appointmentTicket.speciality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Date:</span>
                  <span className="text-blue-800 font-semibold">
                    {new Date(appointmentTicket.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Time:</span>
                  <span className="text-blue-800 font-semibold">{appointmentTicket.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Location:</span>
                  <span className="text-blue-800">{appointmentTicket.location}</span>
                </div>
              </div>

              <div className="border-t border-blue-300 pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Consultation Fee:</span>
                  <span className="text-green-600 font-bold">₹{appointmentTicket.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Payment Method:</span>
                  <span className="text-blue-800">{appointmentTicket.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Payment Status:</span>
                  <span className={`font-semibold ${
                    appointmentTicket.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {appointmentTicket.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Booking Timestamp */}
              <div className="bg-white bg-opacity-50 rounded-lg p-3 mt-4">
                <div className="text-center text-sm text-gray-600">
                  <p>Booked on: {appointmentTicket.bookingDate} at {appointmentTicket.bookingTime}</p>
                </div>
              </div>

              {/* Important Notes */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-semibold text-yellow-800 mb-2">Important Instructions:</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Please arrive 10 minutes early</li>
                  <li>• Bring a valid ID and previous medical records</li>
                  <li>• {appointmentTicket.paymentStatus === 'Pending' ? 'Payment due at clinic' : 'Payment completed online'}</li>
                  <li>• For rescheduling, contact us 24 hours in advance</li>
                </ul>
              </div>

              {/* QR Code Placeholder */}
              <div className="flex justify-center mt-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm2 2V5h1v1h-1z" clipRule="evenodd"/>
                    <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 01-1-1 1 1 0 011-1zM16 12a1 1 0 100-2h-3a1 1 0 100 2h3zM12 15a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM16 16a1 1 0 100-2h-2a1 1 0 100 2h2z"/>
                  </svg>
                </div>
              </div>
              <p className="text-center text-xs text-gray-500 mt-2">Scan QR code for quick check-in</p>

              {/* Decorative Elements */}
              <div className="absolute top-6 right-6 w-8 h-8 bg-blue-600 rounded-full opacity-10"></div>
              <div className="absolute bottom-6 left-6 w-6 h-6 bg-green-600 rounded-full opacity-10"></div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  // Download ticket as image or PDF (implementation would depend on library)
                  toast.success('Ticket saved to downloads!')
                }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                <span>Download</span>
              </button>
              
              <button
                onClick={() => {
                  // Share ticket functionality
                  if (navigator.share) {
                    navigator.share({
                      title: 'Appointment Booked',
                      text: `Appointment booked with Dr. ${appointmentTicket.doctorName} on ${appointmentTicket.date} at ${appointmentTicket.time}`,
                    })
                  } else {
                    toast.success('Ticket details copied to clipboard!')
                  }
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                </svg>
                <span>Share</span>
              </button>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={handleCloseTicket}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Continue to My Appointments
              </button>
            </div>

            {/* Success Animation */}
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to prevent interaction during modals */}
      {(showPaymentModal || showPaymentProcessing || showTicket) && (
        <div className="fixed inset-0 bg-transparent z-40" style={{ pointerEvents: 'none' }}></div>
      )}
    </>
  )
}