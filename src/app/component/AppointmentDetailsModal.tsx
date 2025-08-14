/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatTime, getStatusIcon } from '@/app/component/utils';

interface AppointmentDetailsModalProps {
  selectedEvent: any;
  onClose: () => void;
  onCancel: (appointmentId: string) => void;
}

export const AppointmentDetailsModal = ({ 
  selectedEvent, 
  onClose, 
  onCancel 
}: AppointmentDetailsModalProps) => {
  if (!selectedEvent) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">📋 Appointment Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-2xl">👤</span>
            <div>
              <p className="font-semibold text-gray-800">{selectedEvent.user?.name || 'Unknown'}</p>
              <p className="text-sm text-gray-600">{selectedEvent.user?.email || 'No email'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-xl">{getStatusIcon(selectedEvent.appointment.status)}</span>
            <div>
              <p className="font-semibold text-gray-800 capitalize">Status: {selectedEvent.appointment.status}</p>
              <p className="text-sm text-gray-600">
                📅 {selectedEvent.appointment.date} • ⏰ {formatTime(selectedEvent.appointment.time)}
              </p>
              {selectedEvent.appointment.rescheduleCount > 0 && (
                <p className="text-xs text-purple-600 font-medium">
                  🔄 Rescheduled {selectedEvent.appointment.rescheduleCount} time(s)
                </p>
              )}
            </div>
          </div>

          {selectedEvent.appointment.originalDate && (
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-xl">📅</span>
              <div>
                <p className="font-semibold text-purple-800">Originally Scheduled:</p>
                <p className="text-sm text-purple-700">
                  {selectedEvent.appointment.originalDate} • {formatTime(selectedEvent.appointment.originalTime)}
                </p>
              </div>
            </div>
          )}
          
          {selectedEvent.appointment.paymentMethod && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <span className="text-xl">💳</span>
              <div>
                <p className="font-semibold text-gray-800">
                  Payment: {selectedEvent.appointment.paymentMethod || 'Not specified'}
                </p>
                {selectedEvent.appointment.paymentStatus && (
                  <p className="text-sm text-gray-600 capitalize">
                    Status: {selectedEvent.appointment.paymentStatus}
                  </p>
                )}
                {selectedEvent.appointment.amount && (
                  <p className="text-sm text-gray-600">Amount: ₹{selectedEvent.appointment.amount}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-medium transition-all duration-200"
          >
            Close
          </button>
          {selectedEvent.appointment.status !== 'cancelled' && (
            <button
              onClick={() => {
                onCancel(selectedEvent.appointment.id);
                onClose();
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              🚫 Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};