'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PrescriptionManager from '@/app/component/PrescriptionManager';

// You might want to get this from authentication context or session
// This is just an example - replace with your actual doctor ID logic
const getDoctorId = (): string => {
  // Option 1: From localStorage/sessionStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('doctorId') || 'default-doctor-id';
  }
  
  // Option 2: From URL params, cookies, or authentication context
  // return params.doctorId or session.user.id, etc.
  
  return 'default-doctor-id';
};

export default function PrescriptionManagerPage() {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get doctor ID from your preferred source
    const id = getDoctorId();
    
    // You might want to validate the doctor ID or check authentication here
    if (!id) {
      // Redirect to login or dashboard if no doctor ID
      router.push('/login');
      return;
    }

    setDoctorId(id);
    setIsLoading(false);
  }, [router]);

  // Show loading state while determining doctor ID
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* You can add any page-specific wrapper elements here */}
      <PrescriptionManager doctorId={doctorId} />
    </div>
  );
}