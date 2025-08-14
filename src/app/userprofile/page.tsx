/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import { 
  UserCircle, Stethoscope, FileText, Upload, Calendar, 
  Heart, Activity, Download, Eye, Plus, Edit3, Trash2,
  Phone, AlertCircle, CheckCircle
} from 'lucide-react'


interface Medicine {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  beforeAfterFood: string
}

interface VitalSigns {
  bloodPressure: string
  heartRate: string
  temperature: string
  weight: string
}

interface Prescription {
  id: string
  medicines: Medicine[]
  diagnosis: string
  symptoms: string
  vitalSigns: VitalSigns
  followUpDate: string
  additionalNotes: string
  createdAt: string
  updatedAt: string
}

interface Appointment {
  id: string
  doctorId: string
  date: string
  time: string
  status: string
  prescription?: Prescription
  amount?: string
  paymentStatus?: string
}

interface Doctor {
  id: string
  name: string
  speciality: string
  location: string
}

interface TestReport {
  id: string
  name: string
  type: string
  date: string
  result: string
  normalRange?: string
  status: 'normal' | 'abnormal' | 'pending'
  uploadedFile?: string
}

interface HealthDocument {
  id: string
  name: string
  type: string
  uploadDate: string
  fileUrl: string
  category: string
}

interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
}

interface User {
  id: string
  name: string
  email: string
  phone: string
  age: number | null
  gender: string
  bloodGroup: string
  medicalConditions: string[]
  allergies: string[]
  prescriptions: Prescription[]
  testReports?: TestReport[]
  healthDocuments?: HealthDocument[]
  emergencyContacts?: EmergencyContact[]
  insuranceProvider?: string
  insuranceNumber?: string
  height?: string
  weight?: string
  smokingStatus?: string
  alcoholConsumption?: string
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [newTestReport, setNewTestReport] = useState<Partial<TestReport>>({})
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docCategory, setDocCategory] = useState('')
  const [docName, setDocName] = useState('')
  const [showTestForm, setShowTestForm] = useState(false)
const [showContactForm, setShowContactForm] = useState(false)
const [newEmergencyContact, setNewEmergencyContact] = useState<Partial<EmergencyContact>>({})

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setDocName(file.name.split('.')[0])
    }
  }

  const uploadDocument = async () => {
    if (!selectedFile || !docCategory || !docName || !user) {
      toast.error('Please fill all fields and select a file')
      return
    }

    setUploadingDoc(true)
    try {
      // Simulate file upload - In real app, upload to cloud storage
      const newDoc: HealthDocument = {
        id: Date.now().toString(),
        name: docName,
        type: selectedFile.type,
        uploadDate: new Date().toISOString(),
        fileUrl: `uploads/${selectedFile.name}`, // In real app, this would be the cloud URL
        category: docCategory
      }

      const updatedDocs = [...(user.healthDocuments || []), newDoc]
      const updatedUser = { ...user, healthDocuments: updatedDocs }

      const res = await fetch(`https://mock-api-schedula-1-xzbk.onrender.com/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      })

      if (!res.ok) throw new Error('Failed to upload document')
      
      setUser(updatedUser)
      setSelectedFile(null)
      setDocCategory('')
      setDocName('')
      toast.success('Document uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setUploadingDoc(false)
    }
  }
  const router = useRouter()
  
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  useEffect(() => {
    if (!userId) {
      toast.error('No user logged in. Redirecting...')
      router.push('/login')
      return
    }
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [userRes, appointmentsRes, doctorsRes] = await Promise.all([
        fetch(`https://mock-api-schedula-1-xzbk.onrender.com/users/${userId}`),
        fetch(`https://mock-api-schedula-1-xzbk.onrender.com/appointments?userId=${userId}`),
        fetch('https://mock-api-schedula-1-xzbk.onrender.com/doctors')
      ])

      const userData = await userRes.json()
      const appointmentsData = await appointmentsRes.json()
      const doctorsData = await doctorsRes.json()

      // Initialize missing fields with defaults
      if (!userData.testReports) userData.testReports = []
      if (!userData.healthDocuments) userData.healthDocuments = []
      if (!userData.emergencyContacts) userData.emergencyContacts = []

      setUser(userData)
      setAppointments(appointmentsData)
      setDoctors(doctorsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!user) return
    const { name, value } = e.target
    setUser({ ...user, [name]: value })
  }

  const handleArrayChange = (field: keyof User, value: string) => {
    if (!user) return
    const arrayValue = value.split(',').map(v => v.trim()).filter(v => v)
    setUser({ ...user, [field]: arrayValue as any })
  }

  const handleUpdate = async () => {
    if (!user) return
    try {
      const res = await fetch(`https://mock-api-schedula-1-xzbk.onrender.com/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })
      if (!res.ok) throw new Error('Failed to update user')
      toast.success('Profile updated successfully')
      setEditing(false)
    } catch (error) {
      toast.error('Update failed')
      console.error(error)
    }
  }

  const addTestReport = async () => {
    if (!user || !newTestReport.name || !newTestReport.type) {
      toast.error('Please fill all required fields')
      return
    }

    const report: TestReport = {
      id: Date.now().toString(),
      name: newTestReport.name,
      type: newTestReport.type,
      date: newTestReport.date || new Date().toISOString().split('T')[0],
      result: newTestReport.result || 'Pending',
      normalRange: newTestReport.normalRange || '',
      status: newTestReport.status || 'pending',
      uploadedFile: ''
    }

    const updatedReports = [...(user.testReports || []), report]
    const updatedUser = { ...user, testReports: updatedReports }

    try {
      const res = await fetch(`https://mock-api-schedula-1-xzbk.onrender.com/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      })
      if (!res.ok) throw new Error('Failed to add test report')
      
      setUser(updatedUser)
      setNewTestReport({})
      setShowTestForm(false)
      toast.success('Test report added successfully')
    } catch (error) {
      toast.error('Failed to add test report')
    }
  }

  const addEmergencyContact = async () => {
    if (!user || !newEmergencyContact.name || !newEmergencyContact.phone) {
      toast.error('Please fill all required fields')
      return
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newEmergencyContact.name,
      relationship: newEmergencyContact.relationship || '',
      phone: newEmergencyContact.phone
    }

    const updatedContacts = [...(user.emergencyContacts || []), contact]
    const updatedUser = { ...user, emergencyContacts: updatedContacts }

    try {
      const res = await fetch(`https://mock-api-schedula-1-xzbk.onrender.com/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      })
      if (!res.ok) throw new Error('Failed to add emergency contact')
      
      setUser(updatedUser)
      setNewEmergencyContact({})
      setShowContactForm(false)
      toast.success('Emergency contact added successfully')
    } catch (error) {
      toast.error('Failed to add emergency contact')
    }
  }

  const getPrescriptionsFromAppointments = () => {
    return appointments
      .filter(apt => apt.prescription && apt.status === 'completed')
      .map(apt => {
        const doctor = doctors.find(d => d.id === apt.doctorId)
        return {
          ...apt.prescription!,
          appointmentDate: apt.date,
          appointmentTime: apt.time,
          doctorName: doctor?.name || 'Unknown Doctor',
          doctorSpeciality: doctor?.speciality || ''
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'text-green-600 bg-green-50'
      case 'abnormal': return 'text-red-600 bg-red-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading || !user) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-700 font-semibold">Loading profile...</p>
      </div>
    </div>
  }

  const prescriptionsFromAppointments = getPrescriptionsFromAppointments()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-white border border-blue-200 rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCircle className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-800">{user.name}</h1>
              <p className="text-blue-600">{user.email}</p>
            </div>
          </div>
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-blue-200 rounded-xl shadow-md mb-6 overflow-hidden">
        <div className="flex flex-wrap border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          {[
            { key: 'profile', label: 'Profile', icon: UserCircle, color: 'text-blue-600' },
            { key: 'prescriptions', label: 'Prescriptions', icon: Stethoscope, color: 'text-green-600' },
            { key: 'tests', label: 'Test Reports', icon: FileText, color: 'text-purple-600' },
            { key: 'documents', label: 'Documents', icon: Upload, color: 'text-orange-600' },
            { key: 'vitals', label: 'Vital Signs', icon: Activity, color: 'text-red-600' },
            { key: 'emergency', label: 'Emergency', icon: Phone, color: 'text-pink-600' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition relative ${
                activeTab === tab.key 
                  ? `${tab.color} bg-white border-b-3 border-current shadow-sm` 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                activeTab === tab.key ? 'bg-current/10' : 'bg-gray-100'
              }`}>
                <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? 'text-current' : 'text-gray-500'}`} />
              </div>
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-current"></div>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {editing ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-blue-900 font-medium">Full Name</label>
                    <input name="name" value={user.name} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-blue-900 font-medium">Email</label>
                    <input name="email" value={user.email} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-blue-900 font-medium">Phone</label>
                    <input name="phone" value={user.phone} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-blue-900 font-medium">Age</label>
                    <input name="age" value={user.age ?? ''} onChange={handleChange} type="number" className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-blue-900 font-medium">Gender</label>
                    <select name="gender" value={user.gender} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-blue-900 font-medium">Blood Group</label>
                    <select name="bloodGroup" value={user.bloodGroup} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-blue-900 font-medium">Height (cm)</label>
                    <input name="height" value={user.height || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-blue-900 font-medium">Weight (kg)</label>
                    <input name="weight" value={user.weight || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-blue-900 font-medium">Insurance Provider</label>
                    <input name="insuranceProvider" value={user.insuranceProvider || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-blue-900 font-medium">Insurance Number</label>
                    <input name="insuranceNumber" value={user.insuranceNumber || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-blue-900 font-medium">Smoking Status</label>
                    <select name="smokingStatus" value={user.smokingStatus || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select Status</option>
                      <option>Never smoked</option>
                      <option>Former smoker</option>
                      <option>Current smoker</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-blue-900 font-medium">Alcohol Consumption</label>
                    <select name="alcoholConsumption" value={user.alcoholConsumption || ''} onChange={handleChange} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select Frequency</option>
                      <option>Never</option>
                      <option>Occasionally</option>
                      <option>Regularly</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 lg:col-span-3">
                    <label className="text-blue-900 font-medium">Medical Conditions (comma-separated)</label>
                    <input
                      value={(user.medicalConditions || []).join(', ')}
                      onChange={(e) => handleArrayChange('medicalConditions', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Diabetes, Hypertension"
                    />
                  </div>
                  <div className="flex flex-col gap-1 lg:col-span-3">
                    <label className="text-blue-900 font-medium">Allergies (comma-separated)</label>
                    <input
                      value={(user.allergies || []).join(', ')}
                      onChange={(e) => handleArrayChange('allergies', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Penicillin, Peanuts"
                    />
                  </div>
                  <button
                    className="lg:col-span-3 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition font-medium"
                    onClick={handleUpdate}
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-blue-800 text-lg">Personal Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white/70 rounded-lg p-3">
                        <span className="font-medium text-blue-900">Age:</span>
                        <span className="text-blue-700 font-semibold">{user.age ?? 'Not set'}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/70 rounded-lg p-3">
                        <span className="font-medium text-blue-900">Gender:</span>
                        <span className="text-blue-700 font-semibold">{user.gender || 'Not set'}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/70 rounded-lg p-3">
                        <span className="font-medium text-blue-900">Blood Group:</span>
                        <span className="text-red-600 font-bold text-lg">{user.bloodGroup || 'Not set'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-green-800 text-lg">Physical Details</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white/70 rounded-lg p-3">
                        <span className="font-medium text-green-900">Height:</span>
                        <span className="text-green-700 font-semibold">{user.height ? `${user.height} cm` : 'Not set'}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/70 rounded-lg p-3">
                        <span className="font-medium text-green-900">Weight:</span>
                        <span className="text-green-700 font-semibold">{user.weight ? `${user.weight} kg` : 'Not set'}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/70 rounded-lg p-3">
                        <span className="font-medium text-green-900">BMI:</span>
                        <span className={`font-semibold ${user.height && user.weight ? 'text-green-700' : 'text-gray-500'}`}>
                          {user.height && user.weight ? (parseFloat(user.weight) / Math.pow(parseFloat(user.height) / 100, 2)).toFixed(1) : 'Not available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-purple-800 text-lg">Lifestyle</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white/70 rounded-lg p-3">
                        <span className="font-medium text-purple-900">Smoking:</span>
                        <span className={`font-semibold ${user.smokingStatus === 'Never smoked' ? 'text-green-600' : 'text-orange-600'}`}>
                          {user.smokingStatus || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-white/70 rounded-lg p-3">
                        <span className="font-medium text-purple-900">Alcohol:</span>
                        <span className={`font-semibold ${user.alcoholConsumption === 'Never' ? 'text-green-600' : 'text-orange-600'}`}>
                          {user.alcoholConsumption || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-orange-800 text-lg">Insurance</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white/70 rounded-lg p-3">
                        <span className="font-medium text-orange-900">Provider:</span>
                        <span className="text-orange-700 font-semibold">{user.insuranceProvider || 'Not set'}</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/70 rounded-lg p-3">
                        <span className="font-medium text-orange-900">Number:</span>
                        <span className="text-orange-700 font-semibold">{user.insuranceNumber || 'Not set'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-red-800 text-lg">Medical Conditions</h3>
                    </div>
                    <div className="bg-white/70 rounded-lg p-4">
                      {user.medicalConditions?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {user.medicalConditions.map((condition, index) => (
                            <span key={index} className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                              {condition}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">None reported</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-yellow-800 text-lg">Allergies</h3>
                    </div>
                    <div className="bg-white/70 rounded-lg p-4">
                      {user.allergies?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {user.allergies.map((allergy, index) => (
                            <span key={index} className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-green-600 font-medium">None reported</span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-green-800">Prescription History</h2>
              </div>
              {prescriptionsFromAppointments.length > 0 ? (
                <div className="space-y-6">
                  {prescriptionsFromAppointments.map((prescription, index) => (
                    <div key={index} className="bg-gradient-to-r from-white to-green-50 border-2 border-green-100 rounded-xl p-6 hover:shadow-lg transition">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-lg">Dr. {prescription.doctorName}</p>
                            <p className="text-green-600 font-medium">{prescription.doctorSpeciality}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(prescription.appointmentDate).toLocaleDateString()} at {prescription.appointmentTime}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold mb-1">
                            PRESCRIBED
                          </div>
                          <p className="font-medium text-gray-700">{new Date(prescription.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {prescription.diagnosis && (
                        <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                          <span className="font-bold text-blue-800">Diagnosis: </span>
                          <span className="text-blue-700">{prescription.diagnosis}</span>
                        </div>
                      )}
                      
                      {prescription.symptoms && (
                        <div className="mb-4 bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                          <span className="font-bold text-orange-800">Symptoms: </span>
                          <span className="text-orange-700">{prescription.symptoms}</span>
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <h4 className="font-bold text-green-800 mb-4 text-lg flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">💊</span>
                          </div>
                          Prescribed Medications:
                        </h4>
                        <div className="grid gap-3">
                          {prescription.medicines.map((medicine, medIndex) => (
                            <div key={medIndex} className="bg-white border-2 border-gray-100 p-4 rounded-xl hover:border-green-200 transition">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm">💊</span>
                                  </div>
                                  {medicine.name}
                                </div>
                                <div className="bg-purple-50 p-2 rounded-lg">
                                  <span className="text-xs text-purple-600 font-medium">DOSAGE</span>
                                  <p className="font-semibold text-purple-800">{medicine.dosage}</p>
                                </div>
                                <div className="bg-green-50 p-2 rounded-lg">
                                  <span className="text-xs text-green-600 font-medium">FREQUENCY</span>
                                  <p className="font-semibold text-green-800">{medicine.frequency}</p>
                                </div>
                                <div className="bg-orange-50 p-2 rounded-lg">
                                  <span className="text-xs text-orange-600 font-medium">DURATION</span>
                                  <p className="font-semibold text-orange-800">{medicine.duration}</p>
                                </div>
                                <div className="bg-blue-50 p-2 rounded-lg md:col-span-2">
                                  <span className="text-xs text-blue-600 font-medium">INSTRUCTIONS</span>
                                  <p className="font-semibold text-blue-800">{medicine.instructions}</p>
                                </div>
                                <div className="bg-red-50 p-2 rounded-lg md:col-span-2">
                                  <span className="text-xs text-red-600 font-medium">TIMING</span>
                                  <p className="font-semibold text-red-800">{medicine.beforeAfterFood}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {prescription.followUpDate && (
                        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <Calendar className="w-5 h-5 text-yellow-600" />
                          <span className="font-bold text-yellow-800">Follow-up scheduled:</span>
                          <span className="text-yellow-700 font-semibold">{new Date(prescription.followUpDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No prescriptions available</h3>
                  <p className="text-gray-500">Your prescription history will appear here after completed appointments</p>
                </div>
              )}
            </div>
          )}

          {/* Test Reports Tab */}
          {activeTab === 'tests' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-blue-800">Test Reports</h2>
                <button
                  onClick={() => setShowTestForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Test Report
                </button>
              </div>

              {showTestForm && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-4">Add New Test Report</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      placeholder="Test Name"
                      value={newTestReport.name || ''}
                      onChange={(e) => setNewTestReport({...newTestReport, name: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      placeholder="Test Type"
                      value={newTestReport.type || ''}
                      onChange={(e) => setNewTestReport({...newTestReport, type: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      type="date"
                      value={newTestReport.date || ''}
                      onChange={(e) => setNewTestReport({...newTestReport, date: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      placeholder="Result"
                      value={newTestReport.result || ''}
                      onChange={(e) => setNewTestReport({...newTestReport, result: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      placeholder="Normal Range"
                      value={newTestReport.normalRange || ''}
                      onChange={(e) => setNewTestReport({...newTestReport, normalRange: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <select
                      value={newTestReport.status || 'pending'}
                      onChange={(e) => setNewTestReport({...newTestReport, status: e.target.value as any})}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="pending">Pending</option>
                      <option value="normal">Normal</option>
                      <option value="abnormal">Abnormal</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={addTestReport} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                      Add Report
                    </button>
                    <button onClick={() => setShowTestForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                {user.testReports?.map((report) => (
                  <div key={report.id} className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{report.name}</h3>
                        <p className="text-sm text-gray-600">{report.type}</p>
                        <p className="text-sm text-gray-500">{new Date(report.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Result: </span>
                        <span>{report.result}</span>
                      </div>
                      {report.normalRange && (
                        <div>
                          <span className="font-medium text-gray-700">Normal Range: </span>
                          <span>{report.normalRange}</span>
                        </div>
                      )}
                    </div>
                    {report.uploadedFile && (
                      <div className="mt-3 flex items-center gap-2 text-blue-600">
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Download Report</span>
                      </div>
                    )}
                  </div>
                )) || (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No test reports available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Health Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-blue-800">Health Documents</h2>
              </div>

              {/* Upload Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-xl p-8 mb-6">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Upload Health Document</h3>
                  <p className="text-blue-600 mb-6">Upload your medical reports, prescriptions, and health documents</p>
                  
                  <div className="max-w-md mx-auto space-y-4">
                    <div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center w-full p-4 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                      >
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-sm text-blue-600">
                            {selectedFile ? selectedFile.name : 'Click to select file or drag and drop'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
                        </div>
                      </label>
                    </div>
                    
                    {selectedFile && (
                      <>
                        <input
                          type="text"
                          placeholder="Document name"
                          value={docName}
                          onChange={(e) => setDocName(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        
                        <select
                          value={docCategory}
                          onChange={(e) => setDocCategory(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Category</option>
                          <option value="Lab Reports">Lab Reports</option>
                          <option value="Prescriptions">Prescriptions</option>
                          <option value="Insurance">Insurance</option>
                          <option value="Vaccination Records">Vaccination Records</option>
                          <option value="X-Rays">X-Rays</option>
                          <option value="MRI/CT Scans">MRI/CT Scans</option>
                          <option value="Discharge Summary">Discharge Summary</option>
                          <option value="Others">Others</option>
                        </select>
                        
                        <button
                          onClick={uploadDocument}
                          disabled={uploadingDoc}
                          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                        >
                          {uploadingDoc ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Upload Document
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {user.healthDocuments?.map((doc) => (
                  <div key={doc.id} className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        {doc.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-blue-600 transition truncate">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">{doc.type}</p>
                    <p className="text-sm text-gray-500 mb-4">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition flex-1 justify-center">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button className="flex items-center gap-1 text-green-600 text-sm hover:text-green-800 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 transition flex-1 justify-center">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                )) || (
                  <div className="col-span-full text-center py-16 text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No documents uploaded yet</h3>
                    <p className="text-gray-500 mb-4">Upload your medical reports, prescriptions, and other health-related documents</p>
                    <p className="text-sm text-gray-400">Supported formats: PDF, JPG, PNG, DOC</p>
                  </div>
                )}
              </div>

              {/* Document Categories Stats */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-800 mb-6 text-lg">Document Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Lab Reports', icon: FileText, color: 'from-red-400 to-red-600', bgColor: 'bg-red-50', textColor: 'text-red-700' },
                    { name: 'Prescriptions', icon: Stethoscope, color: 'from-green-400 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-700' },
                    { name: 'Insurance', icon: FileText, color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
                    { name: 'Vaccination Records', icon: Activity, color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
                    { name: 'X-Rays', icon: Eye, color: 'from-orange-400 to-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
                    { name: 'MRI/CT Scans', icon: Activity, color: 'from-pink-400 to-pink-600', bgColor: 'bg-pink-50', textColor: 'text-pink-700' },
                    { name: 'Discharge Summary', icon: FileText, color: 'from-indigo-400 to-indigo-600', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
                    { name: 'Others', icon: Upload, color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-50', textColor: 'text-gray-700' }
                  ].map((category) => (
                    <div key={category.name} className={`${category.bgColor} border-2 border-transparent hover:border-blue-300 p-4 rounded-xl text-center cursor-pointer hover:shadow-md transition group`}>
                      <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition`}>
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className={`text-sm font-bold ${category.textColor} mb-1`}>{category.name}</p>
                      <p className="text-xs text-gray-500">
                        {user.healthDocuments?.filter(doc => doc.category === category.name).length || 0} documents
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Vital Signs Tab */}
          {activeTab === 'vitals' && (
            <div>
              <h2 className="text-xl font-semibold text-blue-800 mb-6">Vital Signs History</h2>
              
              {prescriptionsFromAppointments.filter(p => p.vitalSigns && Object.values(p.vitalSigns).some(v => v)).length > 0 ? (
                <div className="space-y-4">
                  {prescriptionsFromAppointments
                    .filter(p => p.vitalSigns && Object.values(p.vitalSigns).some(v => v))
                    .map((prescription, index) => (
                    <div key={index} className="bg-white border rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="font-semibold text-gray-800">Dr. {prescription.doctorName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(prescription.appointmentDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Recorded: {new Date(prescription.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {prescription.vitalSigns.bloodPressure && (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="w-5 h-5 text-red-600" />
                              <span className="font-medium text-red-800">Blood Pressure</span>
                            </div>
                            <p className="text-2xl font-bold text-red-700">{prescription.vitalSigns.bloodPressure}</p>
                            <p className="text-sm text-red-600">mmHg</p>
                          </div>
                        )}
                        
                        {prescription.vitalSigns.heartRate && (
                          <div className="bg-pink-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="w-5 h-5 text-pink-600" />
                              <span className="font-medium text-pink-800">Heart Rate</span>
                            </div>
                            <p className="text-2xl font-bold text-pink-700">{prescription.vitalSigns.heartRate}</p>
                            <p className="text-sm text-pink-600">bpm</p>
                          </div>
                        )}
                        
                        {prescription.vitalSigns.temperature && (
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                              <span className="font-medium text-orange-800">Temperature</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-700">{prescription.vitalSigns.temperature}°</p>
                            <p className="text-sm text-orange-600">Fahrenheit</p>
                          </div>
                        )}
                        
                        {prescription.vitalSigns.weight && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="w-5 h-5 text-blue-600" />
                              <span className="font-medium text-blue-800">Weight</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">{prescription.vitalSigns.weight}</p>
                            <p className="text-sm text-blue-600">kg</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No vital signs recorded</p>
                  <p className="text-sm">Vital signs will be recorded during your appointments</p>
                </div>
              )}
            </div>
          )}

          {/* Emergency Contacts Tab */}
          {activeTab === 'emergency' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-blue-800">Emergency Contacts</h2>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </button>
              </div>

              {showContactForm && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-4">Add Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      placeholder="Full Name"
                      value={newEmergencyContact.name || ''}
                      onChange={(e) => setNewEmergencyContact({...newEmergencyContact, name: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      placeholder="Relationship"
                      value={newEmergencyContact.relationship || ''}
                      onChange={(e) => setNewEmergencyContact({...newEmergencyContact, relationship: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                    <input
                      placeholder="Phone Number"
                      value={newEmergencyContact.phone || ''}
                      onChange={(e) => setNewEmergencyContact({...newEmergencyContact, phone: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={addEmergencyContact} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                      Add Contact
                    </button>
                    <button onClick={() => setShowContactForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                {user.emergencyContacts?.map((contact) => (
                  <div key={contact.id} className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{contact.name}</h3>
                          <p className="text-sm text-gray-600">{contact.relationship}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{contact.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-12 text-gray-500">
                    <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No emergency contacts added</p>
                    <p className="text-sm">Add emergency contacts for quick access during medical emergencies</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Emergency Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-red-700">In case of emergency:</p>
                    <ul className="list-disc list-inside mt-2 text-red-600">
                      <li>Call emergency services: 911</li>
                      <li>Contact your primary doctor</li>
                      <li>Notify emergency contacts</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-red-700">Important Medical Info:</p>
                    <ul className="list-disc list-inside mt-2 text-red-600">
                      <li>Blood Type: {user.bloodGroup || 'Unknown'}</li>
                      <li>Allergies: {user.allergies?.join(', ') || 'None known'}</li>
                      <li>Conditions: {user.medicalConditions?.join(', ') || 'None reported'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Prescriptions</p>
              <p className="text-xl font-bold text-gray-800">{prescriptionsFromAppointments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Appointments</p>
              <p className="text-xl font-bold text-gray-800">
                {appointments.filter(apt => apt.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Test Reports</p>
              <p className="text-xl font-bold text-gray-800">{user.testReports?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Emergency Contacts</p>
              <p className="text-xl font-bold text-gray-800">{user.emergencyContacts?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}