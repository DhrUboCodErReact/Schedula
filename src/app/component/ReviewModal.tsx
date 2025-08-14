/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Star,
  StarIcon,
  X,
  User,
  MessageSquare,
  Send,
  RefreshCw,
  Edit3,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

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
  followUpDate: string;
  additionalNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  userId?: string;
  date: string;
  time: string;
  status?: "confirmed" | "pending" | "cancelled" | "completed";
  notes?: string;
  prescription?: Prescription;
  prescriptions?: any[];
}

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  location: string;
  price: number;
  rating: number;
  experience: number;
  availableDates: string[];
  availableTimes: string[];
  phone?: string;
  email?: string;
  address?: string;
  image?: string;
  qualification?: string;
  reviewCount?: number;
  reviews?: Review[];
}

interface Review {
  id: string;
  userId: string;
  appointmentId: string;
  rating: number;
  review: string;
  createdAt: string;
  patientName: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  doctor: Doctor | null;
  onReviewSubmitted: (updatedDoctor: Doctor) => void;
}

interface ReviewData {
  rating: number;
  review: string;
  hoverRating: number;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  appointment,
  doctor,
  onReviewSubmitted,
}) => {
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 0,
    review: "",
    hoverRating: 0,
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper function to format dates
  const formatPrescriptionDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to format time
  const formatTime = (timeString: string): string => {
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  // Helper function to check if review can be edited/deleted (within 24 hours)
  const canEditOrDelete = (createdAt: string): boolean => {
    const reviewDate = new Date(createdAt);
    const now = new Date();
    const timeDiff = now.getTime() - reviewDate.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  const handleSubmitReview = async () => {
    if (!appointment || !doctor) {
      toast.error("Missing appointment or doctor information");
      return;
    }

    if (reviewData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (reviewData.review.trim().length < 10) {
      toast.error("Please write at least 10 characters in your review");
      return;
    }

    setIsSubmittingReview(true);

    try {
      // Get current doctor data to update the rating
      const response = await fetch(
        `http://localhost:3001/doctors/${appointment.doctorId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch doctor data");
      }

      const currentDoctor = await response.json();

      // Calculate new average rating
      const currentRating = currentDoctor.rating || 0;
      const currentReviewCount = currentDoctor.reviewCount || 0;
      const totalCurrentRating = currentRating * currentReviewCount;
      const newReviewCount = currentReviewCount + 1;
      const newAverageRating =
        (totalCurrentRating + reviewData.rating) / newReviewCount;

      // Prepare reviews array
      const currentReviews = currentDoctor.reviews || [];
      const newReview: Review = {
        id: Date.now().toString(),
        userId: appointment.userId || "",
        appointmentId: appointment.id,
        rating: reviewData.rating,
        review: reviewData.review,
        createdAt: new Date().toISOString(),
        patientName: `Patient-${(appointment.userId || "").slice(-4)}`, // Anonymous patient name
      };

      // Update doctor with new review and rating
      const updateResponse = await fetch(
        `http://localhost:3001/doctors/${appointment.doctorId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal place
            reviewCount: newReviewCount,
            reviews: [...currentReviews, newReview],
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to submit review");
      }

      // Create updated doctor object
      const updatedDoctor: Doctor = {
        ...doctor,
        rating: Math.round(newAverageRating * 10) / 10,
        reviewCount: newReviewCount,
        reviews: [...(doctor.reviews || []), newReview],
      };

      // Notify parent component
      onReviewSubmitted(updatedDoctor);

      // Reset form and close modal
      setReviewData({ rating: 0, review: "", hoverRating: 0 });
      onClose();

      toast.success("Review submitted successfully!");
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReview = async (existingReview: Review) => {
    if (!appointment || !doctor) {
      toast.error("Missing appointment or doctor information");
      return;
    }

    if (reviewData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (reviewData.review.trim().length < 10) {
      toast.error("Please write at least 10 characters in your review");
      return;
    }

    setIsSubmittingReview(true);

    try {
      // Get current doctor data
      const response = await fetch(
        `http://localhost:3001/doctors/${appointment.doctorId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch doctor data");
      }

      const currentDoctor = await response.json();
      const currentReviews = currentDoctor.reviews || [];
      
      // Find and update the existing review
      const updatedReviews = currentReviews.map((review: Review) =>
        review.id === existingReview.id
          ? {
              ...review,
              rating: reviewData.rating,
              review: reviewData.review,
              updatedAt: new Date().toISOString(),
            }
          : review
      );

      // Recalculate average rating
      const totalRating = updatedReviews.reduce((sum: number, review: Review) => sum + review.rating, 0);
      const newAverageRating = totalRating / updatedReviews.length;

      // Update doctor with edited review and new rating
      const updateResponse = await fetch(
        `http://localhost:3001/doctors/${appointment.doctorId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: Math.round(newAverageRating * 10) / 10,
            reviews: updatedReviews,
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update review");
      }

      // Create updated doctor object
      const updatedDoctor: Doctor = {
        ...doctor,
        rating: Math.round(newAverageRating * 10) / 10,
        reviews: updatedReviews,
      };

      // Notify parent component
      onReviewSubmitted(updatedDoctor);

      // Reset form and close modal
      setReviewData({ rating: 0, review: "", hoverRating: 0 });
      setIsEditing(false);
      onClose();

      toast.success("Review updated successfully!");
    } catch (err) {
      console.error("Error updating review:", err);
      toast.error("Failed to update review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (existingReview: Review) => {
    if (!appointment || !doctor) {
      toast.error("Missing appointment or doctor information");
      return;
    }

    setIsDeleting(true);

    try {
      // Get current doctor data
      const response = await fetch(
        `http://localhost:3001/doctors/${appointment.doctorId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch doctor data");
      }

      const currentDoctor = await response.json();
      const currentReviews = currentDoctor.reviews || [];
      
      // Remove the review
      const updatedReviews = currentReviews.filter((review: Review) => review.id !== existingReview.id);
      const newReviewCount = updatedReviews.length;

      // Recalculate average rating
      let newAverageRating = 0;
      if (newReviewCount > 0) {
        const totalRating = updatedReviews.reduce((sum: number, review: Review) => sum + review.rating, 0);
        newAverageRating = totalRating / newReviewCount;
      }

      // Update doctor with removed review and new rating
      const updateResponse = await fetch(
        `http://localhost:3001/doctors/${appointment.doctorId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating: Math.round(newAverageRating * 10) / 10,
            reviewCount: newReviewCount,
            reviews: updatedReviews,
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to delete review");
      }

      // Create updated doctor object
      const updatedDoctor: Doctor = {
        ...doctor,
        rating: Math.round(newAverageRating * 10) / 10,
        reviewCount: newReviewCount,
        reviews: updatedReviews,
      };

      // Notify parent component
      onReviewSubmitted(updatedDoctor);

      // Reset form and close modal
      setShowDeleteConfirm(false);
      onClose();

      toast.success("Review deleted successfully!");
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error("Failed to delete review. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (existingReview: Review) => {
    setReviewData({
      rating: existingReview.rating,
      review: existingReview.review,
      hoverRating: 0,
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setReviewData({ rating: 0, review: "", hoverRating: 0 });
    setIsEditing(false);
  };

  const handleClose = () => {
    setReviewData({ rating: 0, review: "", hoverRating: 0 });
    setIsEditing(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !appointment || !doctor) return null;

  // Check if already reviewed
  const existingReview = doctor.reviews?.find(
    (review) =>
      review.appointmentId === appointment.id &&
      review.userId === appointment.userId
  );

  const canEdit = existingReview && canEditOrDelete(existingReview.createdAt);

  return (
    <div className="fixed inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? "Edit Your Review" : existingReview ? "Your Review" : "Review Your Experience"}
              </h2>
              <p className="text-gray-600 text-sm">
                {isEditing ? "Update your feedback" : `Share your feedback about Dr. ${doctor.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {existingReview && !isEditing ? (
            // Show existing review with edit/delete options
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Review Submitted
              </h3>
              <p className="text-gray-600 mb-4">
                Thank you for sharing your feedback!
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-5 h-5 ${
                        star <= existingReview.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {existingReview.rating}/5
                  </span>
                </div>
                <p className="text-gray-700 text-sm">"{existingReview.review}"</p>
                <p className="text-xs text-gray-500 mt-2">
                  Reviewed on{" "}
                  {new Date(existingReview.createdAt).toLocaleDateString()}
                  {(existingReview as any).updatedAt && (
                    <span> • Updated on {new Date((existingReview as any).updatedAt).toLocaleDateString()}</span>
                  )}
                </p>
              </div>

              {/* Edit/Delete buttons - only show if within 24 hours */}
              {canEdit && (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => startEdit(existingReview)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Review
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Review
                  </button>
                </div>
              )}

              {!canEdit && (
                <div className="text-xs text-gray-500 bg-gray-100 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Reviews can only be edited or deleted within 24 hours of submission.
                </div>
              )}
            </div>
          ) : (
            // Show review form (new review or editing)
            <>
              {/* Doctor Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    Dr. {doctor.name}
                  </h3>
                  <p className="text-blue-600">{doctor.speciality}</p>
                  <p className="text-sm text-gray-600">
                    Appointment: {formatPrescriptionDate(appointment.date)} at{" "}
                    {formatTime(appointment.time)}
                  </p>
                </div>
              </div>

              {/* Rating Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Rate your experience *
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewData((prev) => ({ ...prev, rating: star }))
                      }
                      onMouseEnter={() =>
                        setReviewData((prev) => ({ ...prev, hoverRating: star }))
                      }
                      onMouseLeave={() =>
                        setReviewData((prev) => ({ ...prev, hoverRating: 0 }))
                      }
                      className="transition-colors duration-150 hover:scale-110 transform"
                    >
                      <StarIcon
                        className={`w-8 h-8 ${
                          star <= (reviewData.hoverRating || reviewData.rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300 hover:text-amber-300"
                        }`}
                      />
                    </button>
                  ))}
                  {reviewData.rating > 0 && (
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {reviewData.rating === 1
                        ? "Poor"
                        : reviewData.rating === 2
                        ? "Fair"
                        : reviewData.rating === 3
                        ? "Good"
                        : reviewData.rating === 4
                        ? "Very Good"
                        : "Excellent"}
                    </span>
                  )}
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Share your experience *
                </label>
                <textarea
                  value={reviewData.review}
                  onChange={(e) =>
                    setReviewData((prev) => ({ ...prev, review: e.target.value }))
                  }
                  placeholder={`Tell others about your experience with Dr. ${doctor.name}. How was the consultation? Were you satisfied with the treatment? (Minimum 10 characters)`}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none transition-all duration-200"
                  rows={4}
                  maxLength={500}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Minimum 10 characters required</span>
                  <span>{reviewData.review.length}/500</span>
                </div>
              </div>

              {/* Guidelines */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  Review Guidelines:
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Be honest and constructive in your feedback</li>
                  <li>• Focus on your personal experience with the doctor</li>
                  <li>• Avoid sharing personal medical information</li>
                  <li>• Keep your review respectful and professional</li>
                  {isEditing && <li>• You can edit or delete your review within 24 hours</li>}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={isEditing ? cancelEdit : handleClose}
                  className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={isEditing ? () => handleEditReview(existingReview!) : handleSubmitReview}
                  disabled={
                    isSubmittingReview ||
                    reviewData.rating === 0 ||
                    reviewData.review.trim().length < 10
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReview ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isEditing ? "Update Review" : "Submit Review"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Delete Review</h3>
                <p className="text-gray-600 text-sm">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your review? This will permanently remove your feedback and update the doctor's rating.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => existingReview && handleDeleteReview(existingReview)}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewModal;