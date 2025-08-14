/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useEffect } from 'react';
import { 
  Calendar, FileText, Pill, Download, Filter, User, Phone, Mail, Heart, Clock, Activity, 
  AlertCircle, ChevronDown, ChevronUp, Search, TrendingUp, BarChart3, PieChart,
  Stethoscope, CheckCircle, XCircle, Users, MapPin
} from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Pie } from 'recharts';
import jsPDF from 'jspdf';

// Interfaces
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  bloodGroup: string;
  medicalConditions: string[];
  allergies: string[];
  smokingStatus?: string;
  alcoholConsumption?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

interface Doctor {
  id: string;
  name: string;
  speciality: string;
}

interface VitalSigns {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  weight?: string;
}

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  beforeAfterFood?: string;
}

interface Prescription {
  diagnosis?: string;
  symptoms?: string;
  vitalSigns?: VitalSigns;
  followUpDate?: string;
  additionalNotes?: string;
  medicines: Medicine[];
}

interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  userId: string;
  status: string;
  prescription?: Prescription;
  paymentStatus?: string;
  amount?: string | number;
  rescheduleCount?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

// API Service
const apiService = {
  async fetchUsers(): Promise<Patient[]> {
    const response = await fetch('http://localhost:3001/users');
    const data = await response.json();
    return data.users || data;
  },
  async fetchDoctors(): Promise<Doctor[]> {
    const response = await fetch('http://localhost:3001/doctors');
    const data = await response.json();
    return data.doctors || data;
  },
  async fetchAppointments(): Promise<Appointment[]> {
    const response = await fetch('http://localhost:3001/appointments');
    const data = await response.json();
    return data.appointments || data;
  }
};

// Analytics Card Component
const AnalyticsCard: React.FC<{title: string, value: string | number, icon: React.ElementType, color: string, bgColor: string, trend?: string}> = 
({ title, value, icon: Icon, color, bgColor, trend }) => (
  <div className={`${bgColor} border-2 border-transparent hover:border-blue-300 p-6 rounded-xl shadow-sm hover:shadow-lg transition group`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        {trend && <p className="text-sm text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{trend}</p>}
      </div>
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center group-hover:scale-110 transition`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

// Diagnosis Analytics Component
const DiagnosisAnalytics: React.FC<{appointments: Appointment[], patientName: string}> = ({ appointments, patientName }) => {
  const diagnosisData = appointments.filter(apt => apt.prescription?.diagnosis)
    .reduce((acc: Record<string, number>, apt) => {
      const diagnosis = apt.prescription!.diagnosis!;
      acc[diagnosis] = (acc[diagnosis] || 0) + 1;
      return acc;
    }, {});

  const pieData = Object.entries(diagnosisData).map(([name, value]) => ({ name, value }));

  const symptomsData = appointments.filter(apt => apt.prescription?.symptoms)
    .reduce((acc: Record<string, number>, apt) => {
      const symptoms = apt.prescription!.symptoms!.split(',').map(s => s.trim());
      symptoms.forEach(symptom => acc[symptom] = (acc[symptom] || 0) + 1);
      return acc;
    }, {});

  const topSymptoms = Object.entries(symptomsData).sort(([,a], [,b]) => b - a).slice(0, 5).map(([name, value]) => ({ name, value }));
  const statusData = appointments.reduce((acc: Record<string, number>, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {});
  const statusPieData = Object.entries(statusData).map(([name, value]) => ({ name, value }));

  const monthlyData = appointments.reduce((acc: Record<string, number>, apt) => {
    const month = new Date(apt.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  const monthlyChartData = Object.entries(monthlyData)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([month, appointments]) => ({ month, appointments }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-800">Medical Analytics Dashboard</h2>
            <p className="text-blue-600">Comprehensive health insights for {patientName}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard title="Total Appointments" value={appointments.length} icon={Calendar} 
          color="bg-gradient-to-br from-blue-500 to-blue-600" bgColor="bg-blue-50" trend="+12% this month" />
        <AnalyticsCard title="Completed Visits" value={appointments.filter(apt => apt.status === 'completed').length} 
          icon={CheckCircle} color="bg-gradient-to-br from-green-500 to-green-600" bgColor="bg-green-50" />
        <AnalyticsCard title="Unique Diagnoses" value={Object.keys(diagnosisData).length} 
          icon={Stethoscope} color="bg-gradient-to-br from-purple-500 to-purple-600" bgColor="bg-purple-50" />
        <AnalyticsCard title="Prescriptions" value={appointments.filter(apt => apt.prescription).length} 
          icon={Pill} color="bg-gradient-to-br from-orange-500 to-orange-600" bgColor="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnosis Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <PieChart className="w-4 h-4 text-white" />
            </div>
            Diagnosis Distribution
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" 
                  label={({ name, percent = 0 }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No diagnosis data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Appointment Status */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            Appointment Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value"
                label={({ name, percent = 0 }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {statusPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Symptoms */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            Common Symptoms
          </h3>
          {topSymptoms.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSymptoms}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No symptoms data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Appointment Trend */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            Appointment Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="appointments" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Health Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          Health Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Most Common Diagnosis</h4>
            <p className="text-blue-700 text-lg font-bold">
              {pieData.length > 0 ? pieData.sort((a, b) => b.value - a.value)[0].name : 'N/A'}
            </p>
            <p className="text-blue-600 text-sm">
              {pieData.length > 0 ? `${pieData.sort((a, b) => b.value - a.value)[0].value} occurrences` : ''}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Health Score</h4>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {Math.round(85 - (appointments.filter(apt => apt.status === 'cancelled').length * 5))}
                </span>
              </div>
              <div>
                <p className="text-green-700 font-semibold">Good</p>
                <p className="text-green-600 text-sm">Based on appointment history</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Last Visit</h4>
            {appointments.filter(apt => apt.status === 'completed').length > 0 && (
              <>
                <p className="text-purple-700 font-semibold">
                  {new Date(appointments.filter(apt => apt.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date).toLocaleDateString()}
                </p>
                <p className="text-purple-600 text-sm">
                  {appointments.filter(apt => apt.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].prescription?.diagnosis || 'Routine checkup'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Patient Basic Info Component
const PatientBasicInfo: React.FC<{patient: Patient}> = ({ patient }) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-md p-6 mb-6">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
        <User className="w-8 h-8 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-blue-800">{patient.name}</h2>
        <p className="text-blue-600">Patient ID: {patient.id}</p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div className="flex items-center gap-2 bg-white/70 rounded-lg p-3">
        <Mail className="w-4 h-4 text-blue-500" />
        <span className="text-sm text-gray-700">{patient.email}</span>
      </div>
      <div className="flex items-center gap-2 bg-white/70 rounded-lg p-3">
        <Phone className="w-4 h-4 text-green-500" />
        <span className="text-sm text-gray-700">{patient.phone}</span>
      </div>
      <div className="flex items-center gap-2 bg-white/70 rounded-lg p-3">
        <Heart className="w-4 h-4 text-red-500" />
        <span className="text-sm text-gray-700">Blood Group: {patient.bloodGroup}</span>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { label: 'Age', value: `${patient.age} years` },
        { label: 'Gender', value: patient.gender },
        { label: 'Smoking', value: patient.smokingStatus || 'Not specified' },
        { label: 'Alcohol', value: patient.alcoholConsumption || 'Not specified' }
      ].map((item, idx) => (
        <div key={idx} className="bg-white/70 rounded-lg p-3">
          <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">{item.label}</span>
          <p className="font-semibold text-gray-800">{item.value}</p>
        </div>
      ))}
    </div>
    
    {patient.medicalConditions && patient.medicalConditions.length > 0 && (
      <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />Medical Conditions:
        </h4>
        <div className="flex flex-wrap gap-2">
          {patient.medicalConditions.map((condition: string, idx: number) => (
            <span key={idx} className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
              {condition}
            </span>
          ))}
        </div>
      </div>
    )}
    
    {patient.allergies && patient.allergies.length > 0 && (
      <div className="mt-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
        <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />Allergies:
        </h4>
        <div className="flex flex-wrap gap-2">
          {patient.allergies.map((allergy: string, idx: number) => (
            <span key={idx} className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium">
              {allergy}
            </span>
          ))}
        </div>
      </div>
    )}
    
    {patient.insuranceProvider && (
      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />Insurance Information:
        </h4>
        <p className="text-sm text-green-700">Provider: {patient.insuranceProvider}</p>
        {patient.insuranceNumber && <p className="text-sm text-green-700">Number: {patient.insuranceNumber}</p>}
      </div>
    )}
  </div>
);

// Appointment Card Component
const AppointmentCard: React.FC<{appointment: Appointment, doctor?: Doctor, isExpanded: boolean, onToggle: () => void}> = 
({ appointment, doctor, isExpanded, onToggle }) => {
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'rescheduled': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Missed': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (date: string): string => 
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {formatDate(appointment.date)} at {appointment.time}
            </h3>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-700">Doctor:</span>
              <span className="text-gray-800">{doctor?.name || 'Unknown Doctor'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-500" />
            <span className="font-medium text-gray-700">Speciality:</span>
            <span className="text-gray-800">{doctor?.speciality || 'General'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${getStatusColor(appointment.status)}`}>
            {appointment.status.toUpperCase()}
          </span>
          <button onClick={onToggle} className="p-2 hover:bg-blue-50 rounded-full transition-colors group-hover:bg-blue-100">
            {isExpanded ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-blue-600" />}
          </button>
        </div>
      </div>

      {isExpanded && appointment.prescription && (
        <div className="border-t-2 border-gray-100 pt-6 mt-4">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Medical Details
          </h4>
          
          {appointment.prescription.diagnosis && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-r-xl">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-blue-800">Diagnosis:</span>
              </div>
              <p className="text-blue-700 font-medium">{appointment.prescription.diagnosis}</p>
            </div>
          )}
          
          {appointment.prescription.symptoms && (
            <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-r-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="font-bold text-yellow-800">Symptoms:</span>
              </div>
              <p className="text-yellow-700 font-medium">{appointment.prescription.symptoms}</p>
            </div>
          )}
          
          {appointment.prescription.vitalSigns && (
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-r-xl">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="font-bold text-green-800">Vital Signs:</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries({
                  bloodPressure: { icon: Heart, label: 'Blood Pressure', color: 'red', unit: '' },
                  heartRate: { icon: Activity, label: 'Heart Rate', color: 'pink', unit: 'bpm' },
                  temperature: { icon: AlertCircle, label: 'Temperature', color: 'orange', unit: '°F' },
                  weight: { icon: User, label: 'Weight', color: 'blue', unit: 'kg' }
                }).map(([key, config]) => {
                  const value = appointment.prescription?.vitalSigns?.[key as keyof VitalSigns];
                  return value ? (
                    <div key={key} className="bg-white/70 rounded-lg p-3 text-center">
                      <config.icon className={`w-5 h-5 text-${config.color}-500 mx-auto mb-1`} />
                      <div className={`text-lg font-bold text-${config.color}-700`}>{value} {config.unit}</div>
                      <div className={`text-xs text-${config.color}-600`}>{config.label}</div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
          
          {appointment.prescription.medicines && appointment.prescription.medicines.length > 0 && (
            <div className="mb-4">
              <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Pill className="w-4 h-4 text-white" />
                </div>
                Prescribed Medications
              </h5>
              <div className="space-y-3">
                {appointment.prescription.medicines.map((medicine: Medicine, idx: number) => (
                  <div key={idx} className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-100 p-4 rounded-xl hover:border-blue-200 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                          <Pill className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-800 text-lg">{medicine.name}</span>
                      </div>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">{medicine.dosage}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: 'Frequency', value: medicine.frequency, color: 'green' },
                        { label: 'Duration', value: medicine.duration, color: 'orange' },
                        { label: 'Instructions', value: medicine.instructions, color: 'blue' },
                        { label: 'Timing', value: medicine.beforeAfterFood, color: 'red' }
                      ].map((item, i) => (
                        <div key={i} className={`bg-${item.color}-50 border border-${item.color}-200 p-3 rounded-lg`}>
                          <span className={`text-xs text-${item.color}-600 font-bold uppercase tracking-wide block mb-1`}>{item.label}</span>
                          <p className={`font-semibold text-${item.color}-800 text-sm`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {appointment.prescription.followUpDate && (
            <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-400 rounded-r-xl">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-indigo-800">Follow-up scheduled:</span>
                <span className="text-indigo-700 font-semibold">{formatDate(appointment.prescription.followUpDate)}</span>
              </div>
            </div>
          )}
          
          {appointment.prescription.additionalNotes && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 rounded-r-xl">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-purple-800">Additional Notes:</span>
              </div>
              <p className="text-purple-700 font-medium">{appointment.prescription.additionalNotes}</p>
            </div>
          )}
          
          {/* Payment and Admin Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 flex flex-wrap gap-4">
              {appointment.paymentStatus && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Payment:</span>
                  <span className={`font-semibold ${appointment.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {appointment.paymentStatus}
                  </span>
                </span>
              )}
              {appointment.amount && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Amount:</span>
                  <span className="font-semibold text-gray-800">₹{appointment.amount}</span>
                </span>
              )}
              {appointment.rescheduleCount && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Rescheduled:</span>
                  <span className="font-semibold text-orange-600">{appointment.rescheduleCount} times</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Summary Stats Component
const SummaryStats: React.FC<{appointments: Appointment[]}> = ({ appointments }) => {
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;
  const totalPrescriptions = appointments.filter(apt => apt.prescription).length;
  const lastAppointment = appointments.filter(apt => apt.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const stats = [
    { value: completedAppointments, label: 'Completed Visits', icon: Calendar, color: 'blue' },
    { value: totalPrescriptions, label: 'Prescriptions', icon: Pill, color: 'green' },
    { value: cancelledAppointments, label: 'Cancelled', icon: XCircle, color: 'red' },
    { value: lastAppointment ? new Date(lastAppointment.date).toLocaleDateString() : 'N/A', label: 'Last Visit', icon: Clock, color: 'purple' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div key={idx} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border border-${stat.color}-200 p-6 rounded-xl shadow-sm hover:shadow-md transition`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-lg flex items-center justify-center`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
              <p className={`text-sm font-medium text-${stat.color}-800`}>{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Date Filter Component
const DateFilter: React.FC<{onDateRangeChange: (start: string, end: string) => void, startDate: string, endDate: string}> = 
({ onDateRangeChange, startDate, endDate }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Filter className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-gray-700">Filter by Date:</span>
      </div>
      <div className="flex items-center gap-3">
        <input type="date" value={startDate} onChange={(e) => onDateRangeChange(e.target.value, endDate)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
        <span className="text-gray-500 font-medium">to</span>
        <input type="date" value={endDate} onChange={(e) => onDateRangeChange(startDate, e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
        <button onClick={() => onDateRangeChange('', '')}
          className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg text-sm hover:from-gray-600 hover:to-gray-700 transition font-medium">
          Clear Filters
        </button>
      </div>
    </div>
  </div>
);

// Patient Selector Component
const PatientSelector: React.FC<{patients: Patient[], selectedPatientId: string, onPatientChange: (patientId: string) => void}> = 
({ patients, selectedPatientId, onPatientChange }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
    <label className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
        <Users className="w-4 h-4 text-white" />
      </div>
      Select Patient:
    </label>
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <select value={selectedPatientId} onChange={(e) => onPatientChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 font-medium transition">
        <option value="">Choose a patient...</option>
        {patients.map((patient: Patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name} - {patient.email}
          </option>
        ))}
      </select>
    </div>
  </div>
);

// Download PDF Component
const DownloadPDF: React.FC<{patient: Patient, appointments: Appointment[], doctors?: Doctor[]}> = ({ patient, appointments, doctors = [] }) => {
  
  const generatePDF = async (): Promise<void> => {
    // Dynamic import for jsPDF to avoid SSR issues
    const { default: jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;
    
    // Helper function to add new page if needed
    const checkPageBreak = (neededHeight: number = 20) => {
      if (yPosition + neededHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };
    
    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return lines.length * (fontSize * 0.35); // Return height used
    };
    
    const getDoctorInfo = (doctorId: string): Doctor | undefined => {
      return doctors.find(doc => doc.id === doctorId);
    };
    
    const completedAppointments = appointments.filter(apt => apt.status === 'completed');
    const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');
    const prescriptionsCount = appointments.filter(apt => apt.prescription && apt.prescription.medicines.length > 0).length;
    
    // Get unique diagnoses and their frequency
    const diagnosisFrequency = appointments
      .filter(apt => apt.prescription?.diagnosis)
      .reduce((acc: Record<string, number>, apt) => {
        const diagnosis = apt.prescription!.diagnosis!;
        acc[diagnosis] = (acc[diagnosis] || 0) + 1;
        return acc;
      }, {});

    // Get all symptoms mentioned
    const allSymptoms = appointments
      .filter(apt => apt.prescription?.symptoms)
      .flatMap(apt => apt.prescription!.symptoms!.split(',').map(s => s.trim()))
      .reduce((acc: Record<string, number>, symptom) => {
        acc[symptom] = (acc[symptom] || 0) + 1;
        return acc;
      }, {});

    // Get all prescribed medications
    const allMedications = appointments
      .filter(apt => apt.prescription?.medicines && apt.prescription.medicines.length > 0)
      .flatMap(apt => apt.prescription!.medicines)
      .reduce((acc: Record<string, { frequency: number }>, med) => {
        const key = `${med.name} (${med.dosage})`;
        if (acc[key]) {
          acc[key].frequency += 1;
        } else {
          acc[key] = { frequency: 1 };
        }
        return acc;
      }, {});

    try {
      // Header
      doc.setFillColor(59, 130, 246); // Blue background
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPREHENSIVE MEDICAL REPORT', pageWidth / 2, 25, { align: 'center' });
      
      yPosition = 50;
      doc.setTextColor(0, 0, 0); // Black text
      
      // Report Info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      doc.text(`Report ID: MR-${patient.id}-${Date.now()}`, pageWidth - margin - 80, yPosition);
      yPosition += 20;
      
      // Patient Information Section
      checkPageBreak(40);
      doc.setFillColor(240, 248, 255);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('PATIENT INFORMATION', margin + 5, yPosition + 10);
      yPosition += 30;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${patient.name}`, margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(`ID: ${patient.id}`, margin + 120, yPosition);
      yPosition += 15;
      
      const patientDetails = [
        `Age: ${patient.age} years | Gender: ${patient.gender} | Blood Group: ${patient.bloodGroup}`,
        `Email: ${patient.email}`,
        `Phone: ${patient.phone}`,
        `Smoking: ${patient.smokingStatus || 'Not specified'} | Alcohol: ${patient.alcoholConsumption || 'Not specified'}`
      ];
      
      patientDetails.forEach(detail => {
        doc.setFontSize(10);
        yPosition += addWrappedText(detail, margin, yPosition, pageWidth - 2 * margin, 10);
        yPosition += 5;
      });
      
      // Medical Conditions
      if (patient.medicalConditions && patient.medicalConditions.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38);
        doc.text('Medical Conditions:', margin, yPosition);
        yPosition += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        patient.medicalConditions.forEach(condition => {
          yPosition += addWrappedText(`• ${condition}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
          yPosition += 3;
        });
        yPosition += 10;
      }
      
      // Allergies
      if (patient.allergies && patient.allergies.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38);
        doc.text('Known Allergies:', margin, yPosition);
        yPosition += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        patient.allergies.forEach(allergy => {
          yPosition += addWrappedText(`⚠ ${allergy}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
          yPosition += 3;
        });
        yPosition += 10;
      }
      
      // Appointment Summary
      checkPageBreak(40);
      doc.setFillColor(240, 248, 255);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text('APPOINTMENT SUMMARY', margin + 5, yPosition + 10);
      yPosition += 30;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const summaryStats = [
        `Total Appointments: ${appointments.length}`,
        `Completed: ${completedAppointments.length}`,
        `Cancelled: ${cancelledAppointments.length}`,
        `With Prescriptions: ${prescriptionsCount}`
      ];
      
      summaryStats.forEach((stat, index) => {
        if (index % 2 === 0) {
          doc.text(stat, margin, yPosition);
        } else {
          doc.text(stat, margin + 100, yPosition);
          yPosition += 12;
        }
      });
      
      if (summaryStats.length % 2 !== 0) yPosition += 12;
      yPosition += 10;
      
      // Diagnostic Overview
      if (Object.keys(diagnosisFrequency).length > 0) {
        checkPageBreak(40);
        doc.setFillColor(240, 248, 255);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text('DIAGNOSTIC OVERVIEW', margin + 5, yPosition + 10);
        yPosition += 30;
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Most Common Diagnoses:', margin, yPosition);
        yPosition += 12;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        Object.entries(diagnosisFrequency)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .forEach(([diagnosis, count], index) => {
            checkPageBreak();
            yPosition += addWrappedText(`${index + 1}. ${diagnosis} (${count} occurrence${count > 1 ? 's' : ''})`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
            yPosition += 5;
          });
        yPosition += 10;
      }
      
      // Medication History
      if (Object.keys(allMedications).length > 0) {
        checkPageBreak(40);
        doc.setFillColor(240, 248, 255);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text('MEDICATION HISTORY', margin + 5, yPosition + 10);
        yPosition += 30;
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        Object.entries(allMedications)
          .sort(([,a], [,b]) => b.frequency - a.frequency)
          .slice(0, 10)
          .forEach(([medication, data], index) => {
            checkPageBreak();
            yPosition += addWrappedText(`${index + 1}. ${medication} (prescribed ${data.frequency} time${data.frequency > 1 ? 's' : ''})`, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
            yPosition += 5;
          });
        yPosition += 15;
      }
      
      // Detailed Appointment History
      if (appointments.length > 0) {
        checkPageBreak(40);
        doc.setFillColor(240, 248, 255);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text('SCHEDULA APPOINTMENT HISTORY', margin + 5, yPosition + 10);
        yPosition += 35;
        
        appointments
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .forEach((appointment, index) => {
            checkPageBreak(60);
            const doctor = getDoctorInfo(appointment.doctorId);
            
            // Appointment header
            doc.setFillColor(249, 250, 251);
            doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 20, 'F');
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Appointment #${index + 1} - ${new Date(appointment.date).toLocaleDateString()}`, margin + 5, yPosition + 8);
            yPosition += 25;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            
            const appointmentDetails = [
              `Date: ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}`,
              `Status: ${appointment.status.toUpperCase()}`,
              `Doctor: ${doctor?.name || 'Unknown Doctor'}`,
              `Speciality: ${doctor?.speciality || 'General Medicine'}`
            ];
            
            if (appointment.paymentStatus) {
              appointmentDetails.push(`Payment: ${appointment.paymentStatus} ${appointment.amount ? `(₹${appointment.amount})` : ''}`);
            }
            
            appointmentDetails.forEach(detail => {
              yPosition += addWrappedText(detail, margin + 5, yPosition, pageWidth - 2 * margin - 5, 10);
              yPosition += 3;
            });
            
            yPosition += 10;
            
            // Prescription details
            if (appointment.prescription) {
              const prescription = appointment.prescription;
              
              if (prescription.diagnosis) {
                checkPageBreak(20);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(16, 185, 129);
                doc.text('DIAGNOSIS:', margin + 10, yPosition);
                yPosition += 12;
                
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                yPosition += addWrappedText(prescription.diagnosis, margin + 15, yPosition, pageWidth - 2 * margin - 15, 10);
                yPosition += 10;
              }
              
              if (prescription.symptoms) {
                checkPageBreak(20);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(245, 158, 11);
                doc.text('SYMPTOMS:', margin + 10, yPosition);
                yPosition += 12;
                
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                yPosition += addWrappedText(prescription.symptoms, margin + 15, yPosition, pageWidth - 2 * margin - 15, 10);
                yPosition += 10;
              }
              
              if (prescription.vitalSigns) {
                checkPageBreak(30);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(59, 130, 246);
                doc.text('VITAL SIGNS:', margin + 10, yPosition);
                yPosition += 12;
                
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                const vitals = prescription.vitalSigns;
                
                const vitalsList = [];
                if (vitals.bloodPressure) vitalsList.push(`Blood Pressure: ${vitals.bloodPressure}`);
                if (vitals.heartRate) vitalsList.push(`Heart Rate: ${vitals.heartRate} bpm`);
                if (vitals.temperature) vitalsList.push(`Temperature: ${vitals.temperature}°F`);
                if (vitals.weight) vitalsList.push(`Weight: ${vitals.weight} kg`);
                
                vitalsList.forEach(vital => {
                  yPosition += addWrappedText(`• ${vital}`, margin + 15, yPosition, pageWidth - 2 * margin - 15, 10);
                  yPosition += 3;
                });
                yPosition += 10;
              }
              
              if (prescription.medicines && prescription.medicines.length > 0) {
                checkPageBreak(30);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(139, 92, 246);
                doc.text('PRESCRIBED MEDICATIONS:', margin + 10, yPosition);
                yPosition += 12;
                
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                prescription.medicines.forEach((medicine, medIndex) => {
                  checkPageBreak(25);
                  yPosition += addWrappedText(`${medIndex + 1}. ${medicine.name} - ${medicine.dosage}`, margin + 15, yPosition, pageWidth - 2 * margin - 15, 10);
                  yPosition += 3;
                  yPosition += addWrappedText(`   Frequency: ${medicine.frequency}, Duration: ${medicine.duration}`, margin + 15, yPosition, pageWidth - 2 * margin - 15, 9);
                  yPosition += 3;
                  if (medicine.instructions) {
                    yPosition += addWrappedText(`   Instructions: ${medicine.instructions}`, margin + 15, yPosition, pageWidth - 2 * margin - 15, 9);
                    yPosition += 3;
                  }
                  yPosition += 5;
                });
                yPosition += 5;
              }
              
              if (prescription.followUpDate) {
                checkPageBreak(15);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(16, 185, 129);
                yPosition += addWrappedText(`FOLLOW-UP: ${new Date(prescription.followUpDate).toLocaleDateString()}`, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10);
                yPosition += 10;
              }
              
              if (prescription.additionalNotes) {
                checkPageBreak(20);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(107, 114, 128);
                doc.text('NOTES:', margin + 10, yPosition);
                yPosition += 12;
                
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                yPosition += addWrappedText(prescription.additionalNotes, margin + 15, yPosition, pageWidth - 2 * margin - 15, 10);
                yPosition += 10;
              }
            }
            
            yPosition += 10;
            
            // Draw separator line
            doc.setDrawColor(229, 231, 235);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 15;
          });
      }
      
      // Footer with disclaimer
      checkPageBreak(50);
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 40, 'F');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(107, 114, 128);
      
      const disclaimer = 'This report is generated from recorded medical appointments and prescriptions. This report should not replace professional medical consultation. Always consult with qualified healthcare professionals for medical advice.';
      addWrappedText(disclaimer, margin + 5, yPosition + 10, pageWidth - 2 * margin - 10, 8);
      
      yPosition += 30;
      doc.setFont('helvetica', 'normal');
      doc.text(`Report generated for: ${patient.name} | Patient ID: ${patient.id}`, margin + 5, yPosition);
      
      // Save the PDF
      doc.save(`Medical-Report-${patient.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const handleDownload = async (): Promise<void> => {
    try {
      await generatePDF();
    } catch (error) {
      console.error('Error generating medical report:', error);
      alert('Error generating medical report. Please try again.');
    }
  };

  const hasData = appointments.length > 0 || patient.medicalConditions?.length > 0 || patient.allergies?.length > 0;

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleDownload}
        disabled={!hasData}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 ${
          hasData 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={hasData ? 'Download comprehensive medical report as PDF' : 'No medical data available to download'}
      >
        <Download className="w-5 h-5" />
        Download Medical Report (PDF)
      </button>
      
      {hasData && (
        <div className="text-xs text-gray-500 ml-2">
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {appointments.length} appointments, {appointments.filter(apt => apt.prescription).length} prescriptions
          </div>
        </div>
      )}
    </div>
  );
};
// Main Component
export default function PatientHistoryPage() {
  const [users, setUsers] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const [usersData, doctorsData, appointmentsData] = await Promise.all([
          apiService.fetchUsers(),
          apiService.fetchDoctors(),
          apiService.fetchAppointments()
        ]);
        
        setUsers(usersData);
        setDoctors(doctorsData);
        setAppointments(appointmentsData);
      } catch (err) {
        setError('Failed to fetch data: ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedPatient = users.find((user: Patient) => user.id === selectedPatientId);
  
  const patientAppointments = appointments
    .filter((apt: Appointment) => apt.userId === selectedPatientId)
    .filter((apt: Appointment) => {
      if (!startDate && !endDate) return true;
      const aptDate = new Date(apt.date);
      const start = startDate ? new Date(startDate) : new Date('1900-01-01');
      const end = endDate ? new Date(endDate) : new Date('2100-01-01');
      return aptDate >= start && aptDate <= end;
    })
    .sort((a: Appointment, b: Appointment) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleCard = (appointmentId: string): void => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(appointmentId)) {
      newExpanded.delete(appointmentId);
    } else {
      newExpanded.add(appointmentId);
    }
    setExpandedCards(newExpanded);
  };

  const handleDateRangeChange = (start: string, end: string): void => {
    setStartDate(start);
    setEndDate(end);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading medical history data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-blue-200 rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-800">Patient Medical History</h1>
                <p className="text-blue-600 mt-1">Comprehensive medical records, appointments, and health analytics</p>
              </div>
            </div>
            {selectedPatient && <DownloadPDF patient={selectedPatient} appointments={patientAppointments} />}
          </div>
        </div>

        <PatientSelector patients={users} selectedPatientId={selectedPatientId} onPatientChange={setSelectedPatientId} />

        {selectedPatient && (
          <>
            <PatientBasicInfo patient={selectedPatient} />
            
            {/* Tab Navigation */}
            <div className="bg-white border border-gray-200 rounded-xl mb-6 shadow-sm">
              <div className="flex border-b border-gray-200">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'appointments', label: 'Appointments', icon: Calendar },
                  { id: 'analytics', label: 'Analytics', icon: TrendingUp }
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                      activeTab === tab.id 
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}>
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && <SummaryStats appointments={patientAppointments} />}
            
            {activeTab === 'appointments' && (
              <>
                <DateFilter onDateRangeChange={handleDateRangeChange} startDate={startDate} endDate={endDate} />
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    Appointment History ({patientAppointments.length})
                  </h2>
                  {patientAppointments.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg">No appointments found for the selected criteria</p>
                    </div>
                  ) : (
                    patientAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        doctor={doctors.find(doc => doc.id === appointment.doctorId)}
                        isExpanded={expandedCards.has(appointment.id)}
                        onToggle={() => toggleCard(appointment.id)}
                      />
                    ))
                  )}
                </div>
              </>
            )}
            
            {activeTab === 'analytics' && <DiagnosisAnalytics appointments={patientAppointments} patientName={selectedPatient.name} />}
          </>
        )}
      </div>
    </div>
  );
}