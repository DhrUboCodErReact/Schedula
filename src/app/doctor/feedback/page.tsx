"use client";

import React, { useState } from "react";
import DoctorFeedback from "@/app/component/DoctorFeedback";
import AnalyticsModal from "@/app/component/AnalyticsModal";

const ReviewPage: React.FC = () => {
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  const doctorId = localStorage.getItem("doctorId") || "default-doctor-id";

  const handleExportReviews = () => {
    console.log("Exporting reviews for doctor:", doctorId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-8">
      {/* Main Content */}
      <DoctorFeedback doctorId={doctorId} />

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleExportReviews}
          className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200"
        >
          Export Reviews
        </button>
        <button
          onClick={() => setIsAnalyticsOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          View Analytics
        </button>
      </div>

      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        doctorId={doctorId}
      />
    </div>
  );
};

export default ReviewPage;
