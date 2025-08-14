/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, FileText, Clock, User, Calendar, Eye, 
  Stethoscope, Printer, Download, AlertCircle, RefreshCw, CheckCircle,
  XCircle, PlusCircle, Minus, Activity, Heart, Brain, Bone, Pill
} from 'lucide-react';

// Types
interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  beforeAfterFood: string;
}

interface Prescription {
  id: string;
  medicines: Medicine[];
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
}

interface Appointment {
  id: string;
  doctorId: string;
  userId: string;
  date: string;
  time: string;
  status: string;
  prescription?: Prescription;
}

interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  phone?: string;
}

interface PrescriptionManagerProps {
  doctorId: string;
  selectedAppointmentId?: string | null;
  onPrescriptionComplete?: () => void;
}

// Smaller components for better organization
const MedicineCard = ({ medicine, onEdit, onDelete, isEditing }: { 
  medicine: Medicine; 
  onEdit: () => void; 
  onDelete: () => void; 
  isEditing?: boolean; 
}) => (
  <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-200 ${isEditing ? 'ring-2 ring-blue-300' : ''}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Pill className="w-4 h-4 text-blue-600" />
          <h4 className="font-bold text-blue-800">{medicine.name}</h4>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
          <div><span className="font-medium">Dosage:</span> {medicine.dosage}</div>
          <div><span className="font-medium">Frequency:</span> {medicine.frequency}</div>
          <div><span className="font-medium">Duration:</span> {medicine.duration}</div>
          <div><span className="font-medium">Food:</span> {medicine.beforeAfterFood}</div>
        </div>
        {medicine.instructions && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Instructions:</span> {medicine.instructions}
          </div>
        )}
      </div>
      <div className="flex gap-1 ml-2">
        <button onClick={onEdit} className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const VitalSignsCard = ({ vitalSigns }: { vitalSigns: any }) => (
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
    <div className="flex items-center gap-2 mb-3">
      <Activity className="w-5 h-5 text-green-600" />
      <h4 className="font-semibold text-green-800">Vital Signs</h4>
    </div>
    <div className="grid grid-cols-2 gap-3 text-sm">
      {vitalSigns.bloodPressure && (
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" />
          <span>BP: {vitalSigns.bloodPressure}</span>
        </div>
      )}
      {vitalSigns.heartRate && (
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <span>HR: {vitalSigns.heartRate} bpm</span>
        </div>
      )}
      {vitalSigns.temperature && (
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-orange-500 text-xs flex items-center justify-center text-white">°</span>
          <span>Temp: {vitalSigns.temperature}°F</span>
        </div>
      )}
      {vitalSigns.weight && (
        <div className="flex items-center gap-2">
          <Bone className="w-4 h-4 text-gray-500" />
          <span>Weight: {vitalSigns.weight} kg</span>
        </div>
      )}
    </div>
  </div>
);

// Prescription View Modal
const PrescriptionView = ({ appointment, user, onClose }: { 
  appointment: Appointment; 
  user: User | undefined; 
  onClose: () => void; 
}) => {
  if (!appointment.prescription) return null;

  const prescription = appointment.prescription;

  return (
    <div className="fixed inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">Prescription Details</h3>
              <p className="text-blue-100 mt-1">
                Patient: {user?.name || 'Unknown'} | 
                Date: {new Date(appointment.date).toLocaleDateString()} | 
                Time: {appointment.time}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-blue-100 hover:text-white p-2 rounded-lg hover:bg-blue-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient & Diagnosis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Diagnosis</h4>
              <p className="text-gray-700">{prescription.diagnosis || 'Not specified'}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <h4 className="font-semibold text-orange-800 mb-2">Symptoms</h4>
              <p className="text-gray-700">{prescription.symptoms || 'Not specified'}</p>
            </div>
          </div>

          {/* Vital Signs */}
          <VitalSignsCard vitalSigns={prescription.vitalSigns} />

          {/* Medicines */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600" />
              Prescribed Medicines ({prescription.medicines.length})
            </h4>
            <div className="grid gap-3">
              {prescription.medicines.map(medicine => (
                <div key={medicine.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="w-4 h-4 text-blue-600" />
                    <h5 className="font-bold text-blue-800">{medicine.name}</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div><span className="font-medium">Dosage:</span> {medicine.dosage}</div>
                    <div><span className="font-medium">Frequency:</span> {medicine.frequency}</div>
                    <div><span className="font-medium">Duration:</span> {medicine.duration}</div>
                    <div><span className="font-medium">Food:</span> {medicine.beforeAfterFood}</div>
                  </div>
                  {medicine.instructions && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Instructions:</span> {medicine.instructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prescription.followUpDate && (
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="font-semibold text-green-800 mb-2">Follow-up Date</h4>
                <p className="text-gray-700">{new Date(prescription.followUpDate).toLocaleDateString()}</p>
              </div>
            )}
            {prescription.additionalNotes && (
              <div className="bg-purple-50 rounded-xl p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Additional Notes</h4>
                <p className="text-gray-700">{prescription.additionalNotes}</p>
              </div>
            )}
          </div>

          {/* Prescription Info */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <div>Created: {new Date(prescription.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(prescription.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrescriptionManager: React.FC<PrescriptionManagerProps> = ({ 
  doctorId, 
  selectedAppointmentId, 
  onPrescriptionComplete 
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [showPrescriptionView, setShowPrescriptionView] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [editingPrescription, setEditingPrescription] = useState<{ appointmentId: string; prescription: Prescription } | null>(null);

  // Prescription form data
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    symptoms: '',
    vitalSigns: { bloodPressure: '', heartRate: '', temperature: '', weight: '' },
    followUpDate: '',
    additionalNotes: ''
  });

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [medicineForm, setMedicineForm] = useState({
    name: '', dosage: '', frequency: '', duration: '', instructions: '', beforeAfterFood: ''
  });

  // Options
  const medicineOptions = [
    'Paracetamol', 'Ibuprofen', 'Aspirin', 'Amoxicillin', 'Ciprofloxacin', 'Azithromycin',
    'Omeprazole', 'Ranitidine', 'Metformin', 'Atorvastatin', 'Amlodipine', 'Losartan'
  ];

  const dosageOptions = ['250mg', '500mg', '1g', '100mg', '200mg', '5mg', '10mg', '1 tablet', '2 tablets'];
  const frequencyOptions = ['Once daily', 'Twice daily', 'Three times daily', 'Every 6 hours', 'As needed'];
  const durationOptions = ['3 days', '5 days', '7 days', '10 days', '14 days', '1 month'];
  const instructionOptions = ['Take with water', 'Take on empty stomach', 'Complete the full course'];
  const foodOptions = ['Before meals', 'After meals', 'With meals', 'Anytime'];

  useEffect(() => {
    fetchData();
  }, [doctorId]);

  useEffect(() => {
    if (selectedAppointmentId) {
      setShowForm(true);
    }
  }, [selectedAppointmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [appointmentsRes, usersRes] = await Promise.all([
        fetch('https://mock-api-schedula-1-xzbk.onrender.com/appointments'),
        fetch('https://mock-api-schedula-1-xzbk.onrender.com/users')
      ]);

      if (!appointmentsRes.ok || !usersRes.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const appointmentsData = await appointmentsRes.json();
      const usersData = await usersRes.json();

      const doctorAppointments = appointmentsData.filter(
        (apt: Appointment) => apt.doctorId === doctorId && apt.status === 'completed'
      );

      setAppointments(doctorAppointments);
      setUsers(usersData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPrescriptionData({
      diagnosis: '', symptoms: '', 
      vitalSigns: { bloodPressure: '', heartRate: '', temperature: '', weight: '' },
      followUpDate: '', additionalNotes: ''
    });
    setMedicines([]);
    setMedicineForm({ name: '', dosage: '', frequency: '', duration: '', instructions: '', beforeAfterFood: '' });
    setEditingMedicine(null);
    setEditingPrescription(null);
    setShowForm(false);
    setError(null);
  };

  const addMedicine = () => {
    if (!medicineForm.name.trim() || !medicineForm.dosage.trim() || !medicineForm.duration.trim()) {
      setError('Please fill in medicine name, dosage, and duration');
      return;
    }

    const newMedicine: Medicine = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      ...medicineForm
    };

    if (editingMedicine) {
      setMedicines(prev => prev.map(m => m.id === editingMedicine.id ? newMedicine : m));
      setEditingMedicine(null);
    } else {
      setMedicines(prev => [...prev, newMedicine]);
    }

    setMedicineForm({ name: '', dosage: '', frequency: '', duration: '', instructions: '', beforeAfterFood: '' });
    setError(null);
  };

  const editMedicine = (medicine: Medicine) => {
    setMedicineForm(medicine);
    setEditingMedicine(medicine);
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
    if (editingMedicine?.id === id) {
      setEditingMedicine(null);
      setMedicineForm({ name: '', dosage: '', frequency: '', duration: '', instructions: '', beforeAfterFood: '' });
    }
  };

  const createPrescription = async () => {
    const appointmentId = selectedAppointmentId || editingPrescription?.appointmentId;
    
    if (!appointmentId) {
      setError('No appointment selected');
      return;
    }

    if (medicines.length === 0) {
      setError('Please add at least one medicine');
      return;
    }

    if (!prescriptionData.diagnosis.trim()) {
      setError('Please enter a diagnosis');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Fetch current appointment
      const appointmentRes = await fetch(`http://localhost:3001/appointments/${appointmentId}`);
      
      if (!appointmentRes.ok) {
        throw new Error('Failed to fetch appointment details');
      }

      const appointment = await appointmentRes.json();

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      let updatedPrescription: Prescription;

      if (editingPrescription) {
        // Update existing prescription
        updatedPrescription = {
          ...editingPrescription.prescription,
          medicines: [...medicines],
          diagnosis: prescriptionData.diagnosis,
          symptoms: prescriptionData.symptoms,
          vitalSigns: { ...prescriptionData.vitalSigns },
          followUpDate: prescriptionData.followUpDate,
          additionalNotes: prescriptionData.additionalNotes,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Create new prescription
        updatedPrescription = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          medicines: [...medicines],
          diagnosis: prescriptionData.diagnosis,
          symptoms: prescriptionData.symptoms,
          vitalSigns: { ...prescriptionData.vitalSigns },
          followUpDate: prescriptionData.followUpDate,
          additionalNotes: prescriptionData.additionalNotes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      // Update appointment with prescription
      const updatedAppointment = { 
        ...appointment, 
        prescription: updatedPrescription,
        status: 'completed'
      };

      const updateRes = await fetch(`http://localhost:3001/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAppointment),
      });

      if (!updateRes.ok) {
        throw new Error('Failed to save prescription');
      }

      // Update local state
      setAppointments(prev => prev.map(apt => apt.id === appointmentId ? updatedAppointment : apt));
      
      resetForm();
      
      if (onPrescriptionComplete) {
        onPrescriptionComplete();
      }

    } catch (err) {
      console.error('Save prescription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const getUser = (userId: string) => users.find(u => u.id === userId);

  const getCurrentAppointment = () => {
    if (selectedAppointmentId) {
      return appointments.find(apt => apt.id === selectedAppointmentId);
    }
    return null;
  };

  const handleStartPrescription = (appointment: Appointment) => {
    // Reset form and start fresh
    resetForm();
    setEditingPrescription({ appointmentId: appointment.id, prescription: appointment.prescription! });
    
    if (appointment.prescription) {
      // Pre-fill form with existing prescription data
      setPrescriptionData({
        diagnosis: appointment.prescription.diagnosis,
        symptoms: appointment.prescription.symptoms,
        vitalSigns: { ...appointment.prescription.vitalSigns },
        followUpDate: appointment.prescription.followUpDate || '',
        additionalNotes: appointment.prescription.additionalNotes
      });
      setMedicines([...appointment.prescription.medicines]);
    }
    
    setShowForm(true);
  };

  const CustomSelect = ({ value, onChange, options, placeholder, className = "" }: any) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-3 border-0 bg-blue-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-700 ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option: any, index: any) => (
        <option key={index} value={option}>{option}</option>
      ))}
    </select>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-600 font-medium">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(apt => !apt.prescription);
  const completedPrescriptions = appointments.filter(apt => apt.prescription);
  const currentAppointment = getCurrentAppointment();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">
            Prescription Management Dashboard
          </h1>
          <p className="text-blue-600">Create and manage medical prescriptions for completed appointments</p>
          {selectedAppointmentId && currentAppointment && (
            <div className="mt-4 bg-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-center gap-2 text-blue-800">
                <FileText className="w-5 h-5" />
                <span className="font-medium">
                  Working on prescription for: {getUserName(currentAppointment.userId)}
                </span>
                <span className="text-blue-600">
                  ({new Date(currentAppointment.date).toLocaleDateString()} at {currentAppointment.time})
                </span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Prescription View Modal */}
        {showPrescriptionView && viewingAppointment && (
          <PrescriptionView
            appointment={viewingAppointment}
            user={getUser(viewingAppointment.userId)}
            onClose={() => {
              setShowPrescriptionView(false);
              setViewingAppointment(null);
            }}
          />
        )}

        {/* Prescription Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">
                  {editingPrescription ? 'Edit Prescription' : 'Create New Prescription'}
                </h3>
                <button 
                  onClick={resetForm} 
                  className="text-blue-100 hover:text-white p-2 rounded-lg hover:bg-blue-500 transition-colors"
                  disabled={saving}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {currentAppointment && (
                <div className="mt-2 text-blue-100">
                  Patient: {getUserName(currentAppointment.userId)} | 
                  Date: {new Date(currentAppointment.date).toLocaleDateString()} | 
                  Time: {currentAppointment.time}
                </div>
              )}
            </div>

            <div className="p-6 space-y-8">
              {/* Patient & Diagnosis Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Diagnosis *
                  </label>
                  <input
                    type="text"
                    value={prescriptionData.diagnosis}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="Enter primary diagnosis"
                    className="w-full p-3 border-0 bg-blue-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Symptoms</label>
                  <input
                    type="text"
                    value={prescriptionData.symptoms}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, symptoms: e.target.value }))}
                    placeholder="Enter observed symptoms"
                    className="w-full p-3 border-0 bg-blue-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Vital Signs */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Vital Signs
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      value={prescriptionData.vitalSigns.bloodPressure}
                      onChange={(e) => setPrescriptionData(prev => ({ 
                        ...prev, 
                        vitalSigns: { ...prev.vitalSigns, bloodPressure: e.target.value }
                      }))}
                      placeholder="120/80"
                      className="w-full p-2 text-sm border-0 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Heart Rate</label>
                    <input
                      type="text"
                      value={prescriptionData.vitalSigns.heartRate}
                      onChange={(e) => setPrescriptionData(prev => ({ 
                        ...prev, 
                        vitalSigns: { ...prev.vitalSigns, heartRate: e.target.value }
                      }))}
                      placeholder="72"
                      className="w-full p-2 text-sm border-0 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Temperature</label>
                    <input
                      type="text"
                      value={prescriptionData.vitalSigns.temperature}
                      onChange={(e) => setPrescriptionData(prev => ({ 
                        ...prev, 
                        vitalSigns: { ...prev.vitalSigns, temperature: e.target.value }
                      }))}
                      placeholder="98.6"
                      className="w-full p-2 text-sm border-0 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Weight (kg)</label>
                    <input
                      type="text"
                      value={prescriptionData.vitalSigns.weight}
                      onChange={(e) => setPrescriptionData(prev => ({ 
                        ...prev, 
                        vitalSigns: { ...prev.vitalSigns, weight: e.target.value }
                      }))}
                      placeholder="70"
                      className="w-full p-2 text-sm border-0 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>

              {/* Medicine Management */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-blue-600" />
                    Medicines ({medicines.length})
                  </h4>
                </div>

                {/* Medicine Form */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-4">
                  <h5 className="font-semibold text-blue-800 mb-4">
                    {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                      <CustomSelect
                        value={medicineForm.name}
                        onChange={(value: string) => setMedicineForm(prev => ({ ...prev, name: value }))}
                        options={medicineOptions}
                        placeholder="Select medicine"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
                      <CustomSelect
                        value={medicineForm.dosage}
                        onChange={(value: string) => setMedicineForm(prev => ({ ...prev, dosage: value }))}
                        options={dosageOptions}
                        placeholder="Select dosage"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                      <CustomSelect
                        value={medicineForm.frequency}
                        onChange={(value: string) => setMedicineForm(prev => ({ ...prev, frequency: value }))}
                        options={frequencyOptions}
                        placeholder="Select frequency"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                      <CustomSelect
                        value={medicineForm.duration}
                        onChange={(value: string) => setMedicineForm(prev => ({ ...prev, duration: value }))}
                        options={durationOptions}
                        placeholder="Select duration"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Food Timing</label>
                      <CustomSelect
                        value={medicineForm.beforeAfterFood}
                        onChange={(value: string) => setMedicineForm(prev => ({ ...prev, beforeAfterFood: value }))}
                        options={foodOptions}
                        placeholder="Select timing"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                      <CustomSelect
                        value={medicineForm.instructions}
                        onChange={(value: string) => setMedicineForm(prev => ({ ...prev, instructions: value }))}
                        options={instructionOptions}
                        placeholder="Select instructions"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={addMedicine}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingMedicine ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                      {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                    </button>
                    {editingMedicine && (
                      <button
                        onClick={() => {
                          setEditingMedicine(null);
                          setMedicineForm({ name: '', dosage: '', frequency: '', duration: '', instructions: '', beforeAfterFood: '' });
                        }}
                        disabled={saving}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>

                {/* Medicines List */}
                {medicines.length > 0 ? (
                  <div className="grid gap-3">
                    {medicines.map(medicine => (
                      <MedicineCard
                        key={medicine.id}
                        medicine={medicine}
                        onEdit={() => editMedicine(medicine)}
                        onDelete={() => deleteMedicine(medicine.id)}
                        isEditing={editingMedicine?.id === medicine.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Pill className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No medicines added yet</p>
                    <p className="text-sm text-gray-400">Add medicines using the form above</p>
                  </div>
                )}
              </div>

              {/* Follow-up & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Follow-up Date</label>
                  <input
                    type="date"
                    value={prescriptionData.followUpDate}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="w-full p-3 border-0 bg-blue-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    value={prescriptionData.additionalNotes}
                    onChange={(e) => setPrescriptionData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    placeholder="Any additional instructions or observations..."
                    className="w-full p-3 border-0 bg-blue-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 resize-none"
                    rows={3}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={createPrescription}
                  disabled={medicines.length === 0 || saving || !prescriptionData.diagnosis.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingPrescription ? 'Update Prescription' : 'Create Prescription'}
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    if (onPrescriptionComplete) {
                      onPrescriptionComplete();
                    }
                  }}
                  disabled={saving}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content - only show when not in form mode or when selectedAppointmentId is not provided */}
        {!showForm && (
          <>
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Pending Prescriptions</h3>
                    <p className="text-green-100">Awaiting prescription</p>
                  </div>
                  <FileText className="w-10 h-10 text-green-100" />
                </div>
                <div className="text-3xl font-bold mb-2">{upcomingAppointments.length}</div>
                <p className="text-green-100 text-sm">
                  {upcomingAppointments.length > 0 ? 'Ready to prescribe!' : 'All caught up!'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Completed</h3>
                    <p className="text-blue-100">Prescriptions issued</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-blue-100" />
                </div>
                <div className="text-3xl font-bold mb-2">{completedPrescriptions.length}</div>
                <p className="text-blue-100 text-sm">Total prescriptions</p>
              </div>

              <div className="bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Total Patients</h3>
                    <p className="text-purple-100">Under care</p>
                  </div>
                  <User className="w-10 h-10 text-purple-100" />
                </div>
                <div className="text-3xl font-bold mb-2">{appointments.length}</div>
                <p className="text-purple-100 text-sm">Managed appointments</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Stethoscope className="w-4 h-4" />
                <span>{appointments.length} total appointments</span>
              </div>
              
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* No Appointments State */}
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">No completed appointments found</h3>
                <p className="text-blue-600 mb-6">Completed appointments will appear here for prescription management.</p>
              </div>
            ) : (
              <>
                {/* Pending Prescriptions */}
                {upcomingAppointments.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-red-600 rounded-full"></div>
                      <h2 className="text-2xl font-bold text-red-800">Pending Prescriptions</h2>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        {upcomingAppointments.length}
                      </span>
                    </div>
                    <div className="grid gap-4 md:gap-6">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="bg-white rounded-xl shadow-md border-l-4 border-red-500 p-6 hover:shadow-lg transition-all duration-200">
                          <div className="flex flex-col lg:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Stethoscope className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold text-blue-800">
                                      {getUserName(appointment.userId)}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{appointment.time}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStartPrescription(appointment)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                              >
                                <Plus className="w-4 h-4" />
                                <span className="text-sm font-medium">Create Prescription</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Prescriptions */}
                {completedPrescriptions.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                      <h2 className="text-2xl font-bold text-blue-800">Completed Prescriptions</h2>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {completedPrescriptions.length}
                      </span>
                    </div>
                    <div className="grid gap-4 md:gap-6">
                      {completedPrescriptions.map((appointment) => (
                        <div key={appointment.id} className="bg-white rounded-xl shadow-md border-l-4 border-blue-500 p-6 hover:shadow-lg transition-all duration-200">
                          <div className="flex flex-col lg:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Stethoscope className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold text-blue-800">
                                      {getUserName(appointment.userId)}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{appointment.time}</span>
                                    </div>
                                  </div>
                                  {appointment.prescription && (
                                    <div className="text-sm text-green-600">
                                      <span className="font-medium">{appointment.prescription.medicines.length} medicines prescribed</span>
                                      {appointment.prescription.diagnosis && (
                                        <span className="ml-3">• {appointment.prescription.diagnosis}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setViewingAppointment(appointment);
                                  setShowPrescriptionView(true);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors duration-200"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="text-sm font-medium">View</span>
                              </button>
                              <button
                                onClick={() => handleStartPrescription(appointment)}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 border border-orange-200 rounded-lg transition-colors duration-200"
                              >
                                <Edit className="w-4 h-4" />
                                <span className="text-sm font-medium">Edit</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PrescriptionManager;