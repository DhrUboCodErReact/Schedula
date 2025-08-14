/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, X, Clock, AlertCircle, Pill, Calendar, User, Loader2 } from 'lucide-react';

// Type definitions based on your database structure
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  age: string;
  gender: string;
  bloodGroup: string;
  medicalConditions: string[];
  allergies: string[];
  prescriptions: any[];
}

interface Doctor {
  id: string;
  name: string;
  email?: string;
  speciality: string;
  location: string;
  price: number | string;
  rating?: number;
  experience: number | string;
  availableDates: string[];
  availableTimes: string[];
  image?: string;
  qualification?: string;
  phone?: string;
  appointmentSlots?: AppointmentSlot[];
  defaultStartTime?: string;
  defaultEndTime?: string;
  defaultSlotDuration?: number;
  defaultSlotType?: string;
  defaultMaxPatients?: number;
  availableEndTimes?: string[];
  slotDurations?: number[];
  bookedSlots?: any[][];
  slotTypes?: SlotType[];
}

interface SlotType {
  type: string;
  expected: number;
  booked: number;
  max?: number;
}

interface AppointmentSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  totalSlots: number;
  bookedSlots: any[];
  slotType: string;
  maxPatients?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  dayOfWeek: string;
  availableSlots: string[];
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  beforeAfterFood: string;
}

interface VitalSigns {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  weight: string;
}

interface Prescription {
  id: string;
  medicines: Medicine[];
  diagnosis: string;
  symptoms: string;
  vitalSigns: VitalSigns;
  followUpDate: string;
  additionalNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'Missed';
  prescriptions?: Medicine[];
  prescription?: Prescription;
  rescheduleCount?: number;
  originalDate?: string;
  originalTime?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  amount?: number | string;
}

interface NotificationDetails {
  medicines?: Medicine[];
  diagnosis?: string;
  followUpDate?: string;
  originalDate?: string;
  originalTime?: string;
  newDate?: string;
  newTime?: string;
}

interface Notification {
  id: string;
  type: 'prescription_updated' | 'appointment_rescheduled' | 'appointment_completed' | 'appointment_missed' | 'appointment_cancelled';
  title: string;
  message: string;
  timestamp: Date;
  appointmentId: string;
  doctorName: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  details?: NotificationDetails;
}

interface NotificationSystemProps {
  currentUserId: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ currentUserId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // API base URL - adjust according to your setup
  const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || 'https://mock-api-schedula-1-xzbk.onrender.com';

  // Fetch data from API endpoints with proper error handling
  const fetchAppointments = async (): Promise<Appointment[]> => {
    const response = await fetch(`${API_BASE_URL}/appointments`);
    if (!response.ok) throw new Error('Failed to fetch appointments');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };

  const fetchDoctors = async (): Promise<Doctor[]> => {
    const response = await fetch(`${API_BASE_URL}/doctors`);
    if (!response.ok) throw new Error('Failed to fetch doctors');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };

  const fetchUsers = async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };

  // Generate notifications based on data changes
  const generateNotifications = useCallback((appointmentsData: Appointment[], doctorsData: Doctor[]): void => {
    const newNotifications: Notification[] = [];
    const now = new Date();
    
    // Filter appointments for current user
    const userAppointments = appointmentsData.filter((apt: Appointment) => apt.userId === currentUserId);
    
    userAppointments.forEach((appointment: Appointment) => {
      const doctor = doctorsData.find((d: Doctor) => d.id === appointment.doctorId);
      const doctorName = doctor ? doctor.name : 'Unknown Doctor';
      
      // Check for prescription updates (last 24 hours)
      if (appointment.prescription && appointment.prescription.updatedAt) {
        const updatedAt = new Date(appointment.prescription.updatedAt);
        const timeDiff = now.getTime() - updatedAt.getTime();
        
        if (timeDiff < 24 * 60 * 60 * 1000) { // Last 24 hours
          newNotifications.push({
            id: `prescription-${appointment.id}-${appointment.prescription.updatedAt}`,
            type: 'prescription_updated',
            title: 'Prescription Updated',
            message: `Dr. ${doctorName} has updated your prescription for appointment on ${appointment.date}`,
            timestamp: updatedAt,
            appointmentId: appointment.id,
            doctorName,
            isRead: false,
            priority: 'high',
            icon: <Pill className="w-5 h-5 text-green-500" />,
            details: {
              medicines: appointment.prescription.medicines || [],
              diagnosis: appointment.prescription.diagnosis,
              followUpDate: appointment.prescription.followUpDate
            }
          });
        }
      }
      
      // Check for appointment rescheduling
      if (appointment.status === 'rescheduled' && appointment.rescheduleCount && appointment.rescheduleCount > 0) {
        newNotifications.push({
          id: `reschedule-${appointment.id}-${appointment.rescheduleCount}`,
          type: 'appointment_rescheduled',
          title: 'Appointment Rescheduled',
          message: `Your appointment with Dr. ${doctorName} has been rescheduled`,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Simulate recent timestamp
          appointmentId: appointment.id,
          doctorName,
          isRead: false,
          priority: 'medium',
          icon: <Calendar className="w-5 h-5 text-blue-500" />,
          details: {
            originalDate: appointment.originalDate,
            originalTime: appointment.originalTime,
            newDate: appointment.date,
            newTime: appointment.time
          }
        });
      }
      
      // Check for appointment status changes
      if (appointment.status === 'completed') {
        const appointmentDate = new Date(appointment.date);
        const timeSinceAppointment = now.getTime() - appointmentDate.getTime();
        
        if (timeSinceAppointment < 7 * 24 * 60 * 60 * 1000) { // Last 7 days
          newNotifications.push({
            id: `completed-${appointment.id}`,
            type: 'appointment_completed',
            title: 'Appointment Completed',
            message: `Your appointment with Dr. ${doctorName} has been completed`,
            timestamp: appointmentDate,
            appointmentId: appointment.id,
            doctorName,
            isRead: false,
            priority: 'low',
            icon: <Check className="w-5 h-5 text-green-500" />
          });
        }
      }
      
      // Check for missed appointments
      if (appointment.status === 'Missed') {
        newNotifications.push({
          id: `missed-${appointment.id}`,
          type: 'appointment_missed',
          title: 'Appointment Missed',
          message: `You missed your appointment with Dr. ${doctorName} on ${appointment.date}`,
          timestamp: new Date(appointment.date),
          appointmentId: appointment.id,
          doctorName,
          isRead: false,
          priority: 'high',
          icon: <AlertCircle className="w-5 h-5 text-red-500" />
        });
      }

      // Check for cancelled appointments
      if (appointment.status === 'cancelled') {
        const appointmentDate = new Date(appointment.date);
        const timeSinceCancel = now.getTime() - appointmentDate.getTime();
        
        if (timeSinceCancel < 7 * 24 * 60 * 60 * 1000) { // Last 7 days
          newNotifications.push({
            id: `cancelled-${appointment.id}`,
            type: 'appointment_cancelled',
            title: 'Appointment Cancelled',
            message: `Your appointment with Dr. ${doctorName} on ${appointment.date} has been cancelled`,
            timestamp: appointmentDate,
            appointmentId: appointment.id,
            doctorName,
            isRead: false,
            priority: 'medium',
            icon: <X className="w-5 h-5 text-red-500" />
          });
        }
      }
    });
    
    // Sort notifications by timestamp (newest first)
    newNotifications.sort((a: Notification, b: Notification) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter((n: Notification) => !n.isRead).length);
  }, [currentUserId]);

  // Fetch all data
  const fetchData = async (): Promise<void> => {
    if (!currentUserId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [appointmentsData, doctorsData] = await Promise.all([
        fetchAppointments(),
        fetchDoctors()
      ]);
      
      setAppointments(appointmentsData);
      setDoctors(doctorsData);
      
      generateNotifications(appointmentsData, doctorsData);
      setLastFetch(new Date());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching notification data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [currentUserId, generateNotifications]);

  // Mark notification as read
  const markAsRead = (notificationId: string): void => {
    setNotifications(prev => 
      prev.map((n: Notification) => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = (): void => {
    setNotifications(prev => prev.map((n: Notification) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // Clear notification
  const clearNotification = (notificationId: string): void => {
    setNotifications(prev => prev.filter((n: Notification) => n.id !== notificationId));
    const notification = notifications.find((n: Notification) => n.id === notificationId);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Get priority color
  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  if (!currentUserId) {
    return (
      <div className="text-sm text-gray-500">
        Please log in to view notifications
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-500">Loading notifications...</span>
              </div>
            )}

            {error && (
              <div className="p-4 text-red-600 text-sm">
                Error: {error}
                <button 
                  onClick={fetchData}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            )}

            {!loading && !error && notifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {notification.icon}
                      <h4 className="font-medium text-gray-900 text-sm">
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    
                    {/* Additional Details */}
                    {notification.details && (
                      <div className="text-xs text-gray-500 space-y-1">
                        {notification.details.originalDate && (
                          <div>
                            From: {notification.details.originalDate} {notification.details.originalTime} → {notification.details.newDate} {notification.details.newTime}
                          </div>
                        )}
                        {notification.details.diagnosis && (
                          <div>Diagnosis: {notification.details.diagnosis}</div>
                        )}
                        {notification.details.medicines && notification.details.medicines.length > 0 && (
                          <div>Medicines: {notification.details.medicines.length} prescribed</div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-400 mt-2">
                      {formatTimestamp(notification.timestamp)}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 ml-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3 text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={() => clearNotification(notification.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Clear notification"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {lastFetch && (
            <div className="p-2 bg-gray-50 text-xs text-gray-500 text-center border-t">
              Last updated: {formatTimestamp(lastFetch)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;