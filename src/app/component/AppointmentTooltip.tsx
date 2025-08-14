/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import { formatTime } from './utils';

interface TooltipProps {
  appointment: any;
  children: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  bloodGroup: string;
  medicalConditions: string[];
  allergies: string[];
}

export const AppointmentTooltip: React.FC<TooltipProps> = ({ 
  appointment, 
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch user data
  const fetchUserData = async (userId: string) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://mock-api-schedula-1-xzbk.onrender.com/users`);
      if (response.ok) {
        const users = await response.json();
        const foundUser = users.find((u: User) => u.id === userId);
        setUser(foundUser || null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    setIsVisible(true);
    const userId = appointment?.userId || appointment?.patientId || appointment?.user_id;
    if (userId) {
      fetchUserData(userId);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setUser(null);
    }, 150); // Small delay to prevent flickering
  };

  const handleTooltipEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleTooltipLeave = () => {
    setIsVisible(false);
    setUser(null);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'rescheduled': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  if (!isVisible) {
    return (
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full"
      >
        {children}
      </div>
    );
  }

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full"
      >
        {children}
      </div>

      {/* Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-50" />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        onMouseEnter={handleTooltipEnter}
        onMouseLeave={handleTooltipLeave}
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-3" />
            <span className="text-gray-600">Loading...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {user?.name || 'Unknown Patient'}
                </h3>
                <p className="text-sm text-gray-500">
                  ID: {appointment?.userId || appointment?.patientId || appointment?.user_id || 'N/A'}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment?.status)}`}>
                {appointment?.status || 'Pending'}
              </span>
            </div>

            {/* Appointment Info */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center text-sm">
                <span className="text-gray-500 w-16">Date:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(appointment?.date || 'N/A')}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-500 w-16">Time:</span>
                <span className="font-medium text-gray-900">
                  {formatTime(appointment?.time || 'N/A')}
                </span>
              </div>
              {appointment?.amount && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 w-16">Amount:</span>
                  <span className="font-medium text-gray-900">₹{appointment.amount}</span>
                </div>
              )}
            </div>

            {/* Patient Details */}
            {user && (
              <div className="space-y-3">
                {/* Contact */}
                {(user.phone || user.email) && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Contact
                    </h4>
                    {user.phone && (
                      <p className="text-sm text-gray-600">📞 {user.phone}</p>
                    )}
                    {user.email && (
                      <p className="text-sm text-gray-600 truncate">✉️ {user.email}</p>
                    )}
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {user.age && (
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-medium text-blue-900">{user.age}y</div>
                      <div className="text-xs text-blue-600">Age</div>
                    </div>
                  )}
                  {user.gender && (
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-medium text-purple-900 capitalize">{user.gender}</div>
                      <div className="text-xs text-purple-600">Gender</div>
                    </div>
                  )}
                  {user.bloodGroup && (
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="font-medium text-red-900">{user.bloodGroup}</div>
                      <div className="text-xs text-red-600">Blood</div>
                    </div>
                  )}
                </div>

                {/* Medical Alerts */}
                {((user.medicalConditions && user.medicalConditions.length > 0) || 
                  (user.allergies && user.allergies.length > 0)) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-red-700 mb-2 flex items-center">
                      🏥 Medical Alerts
                    </h4>
                    {user.medicalConditions && user.medicalConditions.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-red-600 mb-1">Conditions:</p>
                        <div className="flex flex-wrap gap-1">
                          {user.medicalConditions.slice(0, 3).map((condition, index) => (
                            <span key={index} className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">
                              {condition}
                            </span>
                          ))}
                          {user.medicalConditions.length > 3 && (
                            <span className="text-xs text-red-600">+{user.medicalConditions.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                    {user.allergies && user.allergies.length > 0 && (
                      <div>
                        <p className="text-xs text-red-600 mb-1">Allergies:</p>
                        <div className="flex flex-wrap gap-1">
                          {user.allergies.slice(0, 2).map((allergy, index) => (
                            <span key={index} className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs">
                              ⚠️ {allergy}
                            </span>
                          ))}
                          {user.allergies.length > 2 && (
                            <span className="text-xs text-orange-600">+{user.allergies.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
              Click appointment for more options
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .animate-in {
          animation: animate-in 0.2s ease-out;
        }

        .fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .slide-in-from-bottom-2 {
          animation: slide-in-from-bottom-2 0.2s ease-out;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-in-from-bottom-2 {
          from { transform: translate(-50%, -50%) translateY(8px); }
          to { transform: translate(-50%, -50%) translateY(0); }
        }
      `}</style>
    </>
  );
};