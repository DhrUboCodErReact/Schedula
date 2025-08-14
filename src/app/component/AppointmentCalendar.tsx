/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { parseISO, isBefore } from 'date-fns';
import { ToastContainer, ToastNotification } from './ToastNotification';
import { ConfirmationModal } from './ConfirmationModal';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';
import { AppointmentTooltip } from './AppointmentTooltip'; // Add this import
import { StatisticsGrid } from './StatisticsGrid';
import { CalendarInstructions } from './CalendarInstructions';
import { formatTime, getStatusIcon } from './utils';

const COLORS = {
  completed: '#059669',
  confirmed: '#2563eb',
  pending: '#d97706',
  missed: '#dc2626',
  cancelled: '#6b7280',
  rescheduled: '#8b5cf6',
  Missed: '#dc2626',
};

const STATUS_GRADIENTS = {
  completed: 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200',
  confirmed: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200',
  pending: 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200',
  missed: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200',
  cancelled: 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200',
  rescheduled: 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200',
  Missed: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200',
};

interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  userId: string;
  status?: 'pending' | 'completed' | 'confirmed' | 'cancelled' | 'missed' | 'rescheduled' | 'Missed';
  paymentMethod?: string;
  paymentStatus?: string;
  amount?: number | string;
  originalDate?: string;
  originalTime?: string;
  rescheduleCount?: number;
}

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  age?: string;
  gender?: string;
  bloodGroup?: string;
  medicalConditions?: string[];
  allergies?: string[];
}

export default function AppointmentCalendar({
  onClose,
  doctorId,
}: {
  onClose: () => void;
  doctorId: string;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'danger' | 'info';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Toast management
  const addToast = useCallback((type: ToastNotification['type'], title: string, message: string) => {
    const id = Date.now() + Math.random(); // More unique ID
    const newToast: ToastNotification = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const [appointmentsRes, usersRes] = await Promise.all([
          fetch('http://localhost:3001/appointments'),
          fetch('http://localhost:3001/users'),
        ]);

        const appointmentsData = await appointmentsRes.json();
        const usersData = await usersRes.json();

        const doctorAppointments = appointmentsData
          .filter((a: Appointment) => a.doctorId === doctorId)
          .map((a: Appointment) => ({
            ...a,
            status: a.status ?? 'pending',
            rescheduleCount: a.rescheduleCount ?? 0,
            amount: a.amount ? (typeof a.amount === 'string' ? a.amount : a.amount.toString()) : '',
            normalizedStatus: a.status ? a.status.toLowerCase() : 'pending'
          }));

        if (isMounted) {
          setAppointments(doctorAppointments);
          setUsers(usersData);
          setLoading(false);
          // Only show toast after everything is set
          setTimeout(() => {
            if (isMounted && doctorAppointments.length > 0) {
              addToast('success', 'Calendar Loaded', `Successfully loaded ${doctorAppointments.length} appointments`);
            }
          }, 100);
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
          addToast('error', 'Loading Failed', 'Failed to load appointment data. Please try again.');
        }
      }
    };

    if (doctorId && loading) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [doctorId, addToast]);

  const handleEventDrop = async (info: any) => {
    const appointment = info.event.extendedProps.appointment;
    const newDateTimeObj = info.event.start;

    if (!appointment || !appointment.id) {
      addToast('error', 'Invalid Appointment', 'Unable to reschedule this appointment');
      info.revert();
      return;
    }

    const newDate = newDateTimeObj.toISOString().split('T')[0];
    const hours = newDateTimeObj.getHours();
    const minutes = newDateTimeObj.getMinutes();
    const newTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const displayTime = newDateTimeObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    const displayDate = newDateTimeObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    setConfirmModal({
      isOpen: true,
      title: 'Reschedule Appointment',
      message: `Reschedule this appointment to ${displayDate} at ${displayTime}? This will mark the appointment as "Rescheduled".`,
      type: 'info',
      onConfirm: async () => {
        try {
          const updateData: any = { 
            date: newDate, 
            time: newTime,
            status: 'rescheduled',
            rescheduleCount: (appointment.rescheduleCount || 0) + 1
          };

          if (!appointment.originalDate) {
            updateData.originalDate = appointment.date;
            updateData.originalTime = appointment.time;
          }

          const res = await fetch(
            `http://localhost:3001/appointments/${appointment.id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updateData),
            }
          );

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to update appointment: ${errorText}`);
          }

          setAppointments(prev =>
            prev.map(a =>
              a.id === appointment.id 
                ? { 
                    ...a, 
                    date: newDate, 
                    time: newTime,
                    status: 'rescheduled' as const,
                    rescheduleCount: (a.rescheduleCount || 0) + 1,
                    originalDate: a.originalDate || a.date,
                    originalTime: a.originalTime || a.time
                  } 
                : a
            )
          );

          addToast('success', 'Appointment Rescheduled', `Successfully moved to ${displayDate} at ${displayTime}`);

        } catch (error: any) {
          addToast('error', 'Reschedule Failed', error.message || 'Failed to reschedule appointment');
          info.revert();
        }
      }
    });
  };

  const handleCancel = async (appointmentId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Appointment',
      message: 'Are you sure you want to cancel this appointment? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:3001/appointments/${appointmentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' }),
          });

          if (!res.ok) throw new Error('Failed to cancel appointment');

          setAppointments(prev =>
            prev.map(a =>
              a.id === appointmentId ? { ...a, status: 'cancelled' } : a
            )
          );

          addToast('success', 'Appointment Cancelled', 'The appointment has been successfully cancelled');
        } catch (err) {
          addToast('error', 'Cancellation Failed', 'Failed to cancel the appointment. Please try again.');
        }
      }
    });
  };

  const handleEventClick = (info: any) => {
    const { appointment, user } = info.event.extendedProps;
    setSelectedEvent({ appointment, user });
  };

  // Modified render function with tooltip wrapper
  const renderEventContent = (eventInfo: any) => {
    const { appointment, user } = eventInfo.event.extendedProps;

    return (
      <AppointmentTooltip appointment={appointment}>
        <div className="flex justify-between items-center px-3 py-1 text-sm w-full text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs">{getStatusIcon(appointment.status)}</span>
            <span className="truncate font-semibold">{user?.name || 'Unknown'}</span>
            {appointment.rescheduleCount > 0 && (
              <span className="text-xs bg-white/20 px-1 rounded-full">
                R{appointment.rescheduleCount}
              </span>
            )}
          </div>
          {appointment.status !== 'cancelled' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCancel(appointment.id);
              }}
              className="ml-2 text-white/80 hover:text-red-200 hover:bg-red-500/20 w-6 h-6 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 hover:scale-110"
              title="Cancel Appointment"
            >
              ×
            </button>
          )}
        </div>
      </AppointmentTooltip>
    );
  };

  const events = appointments.map((a) => {
    const user = users.find((u) => u.id === a.userId);
    let color = COLORS.pending;
    
    const normalizedStatus = a.status?.toLowerCase() || 'pending';

    if (normalizedStatus === 'completed') color = COLORS.completed;
    else if (normalizedStatus === 'confirmed') color = COLORS.confirmed;
    else if (normalizedStatus === 'cancelled') color = COLORS.cancelled;
    else if (normalizedStatus === 'rescheduled') color = COLORS.rescheduled;
    else if (normalizedStatus === 'missed') color = COLORS.missed;
    else {
      try {
        const aptDate = parseISO(`${a.date}T${a.time}`);
        if (isBefore(aptDate, today) && normalizedStatus === 'pending') {
          color = COLORS.missed;
        } else {
          color = COLORS.pending;
        }
      } catch (error) {
        color = COLORS.pending;
      }
    }

    const displayTime = formatTime(a.time);
    const timeParts = a.time.split(':');
    const properTime = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
    
    return {
      id: a.id,
      title: `${displayTime} - ${user?.name || 'Unknown'}`,
      start: `${a.date}T${properTime}`,
      backgroundColor: color,
      borderColor: color,
      extendedProps: { appointment: a, user },
    };
  });

  const getAppointmentStats = () => {
    const stats = appointments.reduce((acc, apt) => {
      const status = apt.status?.toLowerCase() || 'pending';
      const normalizedStatus = status === 'missed' ? 'missed' : status;
      acc[normalizedStatus] = (acc[normalizedStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  const stats = getAppointmentStats();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex items-center gap-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <p className="text-gray-700 font-medium text-lg">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmationModal {...confirmModal} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
      <AppointmentDetailsModal 
        selectedEvent={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        onCancel={handleCancel} 
      />
      
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 animate-fadeIn">
        <div className="relative bg-white rounded-3xl p-8 w-full max-w-7xl shadow-2xl overflow-y-auto max-h-[95vh] font-sans animate-slideUp">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                📅 Appointment Calendar
              </h2>
              <p className="text-gray-600 mt-2">Manage your appointments with ease - Hover for quick info, Click for details, Drag & drop to reschedule</p>
            </div>
            <button
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-200 hover:scale-105"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* Statistics */}
          <StatisticsGrid 
            stats={stats} 
            colors={COLORS} 
            gradients={STATUS_GRADIENTS} 
          />

          {/* Instructions */}
          <CalendarInstructions />

          {/* Calendar */}
          <div className="rounded-2xl border-2 border-gray-100 shadow-lg p-6 bg-gradient-to-br from-gray-50 to-white">
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              height="auto"
              editable={true}
              selectable={false}
              events={events}
              eventDrop={handleEventDrop}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              eventStartEditable={true}
              eventDurationEditable={false}
              slotMinTime="00:00:00"
              slotMaxTime="23:59:59"
              slotDuration="00:30:00"
              snapDuration="00:15:00"
              allDaySlot={false}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridDay,timeGridWeek',
              }}
              buttonText={{
                today: '🏠 Today',
                timeGridDay: '📋 Day',
                timeGridWeek: '📅 Week',
              }}
              dayHeaderClassNames={() =>
                'bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-800 text-sm font-semibold py-3 border-b-2 border-indigo-100'
              }
              slotLabelClassNames={() => 'text-xs text-gray-500 font-medium'}
              eventClassNames={() => 'hover:scale-105 transition-transform duration-200 cursor-pointer shadow-md'}
              businessHours={false}
            />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        .fc-event {
          border-radius: 8px !important;
          border: none !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          cursor: grab !important;
        }
        
        .fc-event:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
          transform: scale(1.02) !important;
        }
        
        .fc-event.fc-event-dragging {
          cursor: grabbing !important;
          transform: rotate(5deg) scale(1.05) !important;
          box-shadow: 0 8px 16px rgba(0,0,0,0.2) !important;
          z-index: 1000 !important;
        }
        
        .fc-button {
          border-radius: 10px !important;
          border: none !important;
          padding: 8px 16px !important;
          font-weight: 600 !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          transition: all 0.2s ease !important;
        }
        
        .fc-button:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
        }
        
        .fc-toolbar-title {
          font-size: 1.5rem !important;
          font-weight: bold !important;
          color: #374151 !important;
        }
        
        .fc-timegrid-slot {
          border-color: #f3f4f6 !important;
        }
        
        .fc-timegrid-slot:hover {
          background-color: #f8fafc !important;
        }
        
        .fc-col-header-cell {
          background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%) !important;
        }
      `}</style>
    </>
  );
}