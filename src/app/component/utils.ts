/* eslint-disable @typescript-eslint/no-unused-vars */
import { parseISO } from 'date-fns';

export const formatTime = (timeString: string) => {
  try {
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const timeObj = parseISO(`2000-01-01T${timeFormatted}`);
    return timeObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  } catch (error) {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (hours === 0) return `12:${minutes.toString().padStart(2, '0')} AM`;
    else if (hours < 12) return `${hours}:${minutes.toString().padStart(2, '0')} AM`;
    else if (hours === 12) return `12:${minutes.toString().padStart(2, '0')} PM`;
    else return `${hours - 12}:${minutes.toString().padStart(2, '0')} PM`;
  }
};

export const getStatusIcon = (status: string) => {
  const normalizedStatus = status?.toLowerCase();
  switch (normalizedStatus) {
    case 'completed': return '✅';
    case 'confirmed': return '📅';
    case 'pending': return '⏳';
    case 'missed': return '❌';
    case 'cancelled': return '🚫';
    case 'rescheduled': return '🔄';
    default: return '📋';
  }
};
