/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Doctor, useDoctorStore, AppointmentSlot } from "@/context/doctorStore";
import {
  Pencil,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Star,
  Users,
  Calendar,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
} from "lucide-react";
import toast from "react-hot-toast";
import DoctorBasicInfo from "@/app/component/DoctorBasicInfo";
import AppointmentSlotsManager from "@/app/component/AppointmentSlotsManager";

interface Review {
  id: string;
  userId: string;
  appointmentId: string;
  rating: number;
  review: string;
  createdAt: string;
  patientName: string;
}

// Extended Doctor interface to include review properties
interface ExtendedDoctor extends Doctor {
  reviewCount?: number;
  rating?: number;
  reviews?: Review[];
}

export default function DoctorProfilePage() {
  const { doctor, setDoctor, updateDoctor } = useDoctorStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ExtendedDoctor | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Fetch appointments data
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("http://localhost:3001/appointments");
        if (response.ok) {
          const appointmentsData = await response.json();
          setAppointments(appointmentsData);
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        setAppointments([]);
      }
    };

    fetchAppointments();
  }, []);

  // Generate unique ID for new slots
  const generateSlotId = (): string => {
    return `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Helper function to get next occurrence of a day
  const getNextOccurrence = (
    dayName: string,
    weeksAhead: number = 0
  ): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const targetDay = days.indexOf(dayName);

    const today = new Date();
    const currentDay = today.getDay();

    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget + weeksAhead * 7);

    return targetDate.toISOString().split("T")[0];
  };

  // Generate time slots based on start/end time and duration
  const generateTimeSlots = (
    startTime: string,
    endTime: string,
    duration: number
  ): string[] => {
    const slots: string[] = [];
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);

    const current = new Date(start);
    while (current < end) {
      const timeString = current.toTimeString().substring(0, 5);
      slots.push(timeString);
      current.setMinutes(current.getMinutes() + duration);
    }

    return slots;
  };

  // Calculate total slots based on time range and duration
  const calculateTotalSlots = (
    startTime: string,
    endTime: string,
    duration: number
  ): number => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return Math.floor(diffInMinutes / duration);
  };

  // Initialize form data when doctor data is available
  useEffect(() => {
    if (doctor) {
      // Convert legacy data to new appointment slots format if needed
      let appointmentSlots: AppointmentSlot[] = [];

      if (doctor.appointmentSlots) {
        appointmentSlots = doctor.appointmentSlots;
      } else if (doctor.availableDates && doctor.availableTimes) {
        // Legacy conversion
        appointmentSlots = doctor.availableDates.map((date, index) => ({
          id: generateSlotId(),
          date,
          startTime:
            doctor.availableTimes?.[index] ||
            doctor.defaultStartTime ||
            "09:00",
          endTime:
            doctor.availableEndTimes?.[index] ||
            doctor.defaultEndTime ||
            "17:00",
          slotDuration:
            doctor.slotDurations?.[index] || doctor.defaultSlotDuration || 30,
          totalSlots: calculateTotalSlots(
            doctor.availableTimes?.[index] || "09:00",
            doctor.availableEndTimes?.[index] || "17:00",
            doctor.slotDurations?.[index] || 30
          ),
          bookedSlots: doctor.bookedSlots?.[index] || [],
          slotType:
            doctor.slotTypes?.[index]?.type ||
            doctor.defaultSlotType ||
            "stream",
          maxPatients:
            doctor.slotTypes?.[index]?.max || doctor.defaultMaxPatients,
          dayOfWeek: new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
          }),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }

      setFormData({
        ...doctor,
        appointmentSlots,
        // Set defaults if not present
        defaultStartTime: doctor.defaultStartTime || "09:00",
        defaultEndTime: doctor.defaultEndTime || "17:00",
        defaultSlotDuration: doctor.defaultSlotDuration || 30,
        defaultSlotType: doctor.defaultSlotType || "stream",
        defaultMaxPatients: doctor.defaultMaxPatients || 1,
      });
    }
  }, [doctor]);

  // Handle basic info updates
  const handleBasicInfoUpdate = (updates: Partial<ExtendedDoctor>) => {
    if (formData) {
      setFormData({ ...formData, ...updates });
      setHasChanges(true);
    }
  };

  // Add new appointment slot
  const handleAddSlot = () => {
    if (!formData) return;

    const newSlot: AppointmentSlot = {
      id: generateSlotId(),
      date: "",
      startTime: formData.defaultStartTime || "09:00",
      endTime: formData.defaultEndTime || "17:00",
      slotDuration: formData.defaultSlotDuration || 30,
      totalSlots: calculateTotalSlots(
        formData.defaultStartTime || "09:00",
        formData.defaultEndTime || "17:00",
        formData.defaultSlotDuration || 30
      ),
      bookedSlots: [],
      slotType: formData.defaultSlotType || "stream",
      maxPatients: formData.defaultMaxPatients || 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFormData({
      ...formData,
      appointmentSlots: [...(formData.appointmentSlots || []), newSlot],
    });
    setHasChanges(true);
  };

  // Update appointment slot
  const handleUpdateSlot = (
    slotId: string,
    updates: Partial<AppointmentSlot>
  ) => {
    if (!formData?.appointmentSlots) return;

    const updatedSlots = formData.appointmentSlots.map((slot) =>
      slot.id === slotId
        ? {
            ...slot,
            ...updates,
            availableSlots:
              updates.startTime || updates.endTime || updates.slotDuration
                ? generateTimeSlots(
                    updates.startTime || slot.startTime,
                    updates.endTime || slot.endTime,
                    updates.slotDuration || slot.slotDuration
                  ).filter(
                    (timeSlot) =>
                      !(updates.bookedSlots || slot.bookedSlots).includes(
                        timeSlot
                      )
                  )
                : slot.availableSlots,
            updatedAt: new Date().toISOString(),
          }
        : slot
    );

    setFormData({ ...formData, appointmentSlots: updatedSlots });
    setHasChanges(true);
  };

  // Delete appointment slot
  const handleDeleteSlot = (slotId: string) => {
    if (!formData?.appointmentSlots) return;

    const updatedSlots = formData.appointmentSlots.filter(
      (slot) => slot.id !== slotId
    );
    setFormData({ ...formData, appointmentSlots: updatedSlots });
    setHasChanges(true);
  };

  // Generate recurring appointments
  const handleGenerateRecurring = (slotId: string, weeks: number) => {
    if (!formData?.appointmentSlots) return;

    const baseSlot = formData.appointmentSlots.find(
      (slot) => slot.id === slotId
    );
    if (!baseSlot || !baseSlot.dayOfWeek) return;

    const newSlots: AppointmentSlot[] = [];

    for (let week = 1; week < weeks; week++) {
      const newDate = getNextOccurrence(baseSlot.dayOfWeek, week);
      const newSlot: AppointmentSlot = {
        ...baseSlot,
        id: generateSlotId(),
        date: newDate,
        bookedSlots: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newSlots.push(newSlot);
    }

    setFormData({
      ...formData,
      appointmentSlots: [...formData.appointmentSlots, ...newSlots],
    });
    setHasChanges(true);
    toast.success(`Generated ${newSlots.length} recurring appointments`);
  };

  // Save changes
  const handleSave = async () => {
    if (!formData?.id) return;

    setIsLoading(true);
    try {
      // Prepare comprehensive data structure
      const updateData = {
        ...formData,
        // Legacy format for backward compatibility
        availableDates:
          formData.appointmentSlots?.map((slot) => slot.date) || [],
        availableTimes:
          formData.appointmentSlots?.map((slot) => slot.startTime) || [],
        availableEndTimes:
          formData.appointmentSlots?.map((slot) => slot.endTime) || [],
        slotDurations:
          formData.appointmentSlots?.map((slot) => slot.slotDuration) || [],
        bookedSlots:
          formData.appointmentSlots?.map((slot) => slot.bookedSlots) || [],
        slotTypes:
          formData.appointmentSlots?.map((slot) => ({
            type: slot.slotType,
            expected: slot.totalSlots,
            booked: slot.bookedSlots.length,
            max: slot.maxPatients,
          })) || [],
        // Enhanced appointment slots with all metadata
        appointmentSlots:
          formData.appointmentSlots?.map((slot) => ({
            ...slot,
            availableSlots: generateTimeSlots(
              slot.startTime,
              slot.endTime,
              slot.slotDuration
            ).filter((timeSlot) => !slot.bookedSlots.includes(timeSlot)),
            dayOfWeek: slot.date
              ? new Date(slot.date).toLocaleDateString("en-US", {
                  weekday: "long",
                })
              : slot.dayOfWeek,
          })) || [],
      };

      console.log(
        "💾 Saving doctor profile:",
        JSON.stringify(updateData, null, 2)
      );

      const res = await fetch(`http://localhost:3001/doctors/${formData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();

      console.log(
        "✅ Profile updated successfully:",
        JSON.stringify(updated, null, 2)
      );

      setDoctor(updated);
      setHasChanges(false);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("❌ Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (hasChanges) {
      if (
        confirm("You have unsaved changes. Are you sure you want to cancel?")
      ) {
        setFormData(doctor);
        setEditing(false);
        setHasChanges(false);
      }
    } else {
      setEditing(false);
    }
  };

  // Star Rating Component
  const StarRating = ({
    rating,
    size = "sm",
  }: {
    rating: number;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Truncate text helper
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Calculate completed appointments for this doctor
  const getCompletedAppointmentsCount = () => {
    if (!formData?.id) return 0;

    // Count completed appointments for this doctor from the appointments data
    const completedAppointments = appointments.filter(
      (appointment) =>
        appointment.doctorId === formData.id &&
        appointment.status === "completed"
    ).length;

    return completedAppointments;
  };

  if (!formData) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto pt-20 pb-16 px-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-10 text-center">
            <div className="animate-pulse">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-6"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-32 mx-auto mb-2"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-40 mx-auto"></div>
            </div>
            <p className="text-gray-600 mt-6 text-lg">
              Loading your premium profile...
            </p>
          </div>
        </div>
      </section>
    );
  }

  const totalReviews = formData.reviewCount || 0;
  const averageRating = formData.rating || 0;
  const reviews = formData.reviews || [];
  const completedAppointments = getCompletedAppointmentsCount();

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto pt-20 pb-16 px-6">
        {/* Premium Header Card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {formData.name?.charAt(0) || "D"}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent">
                  {formData.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  <span className="text-lg text-blue-700 font-medium">
                    {formData.speciality}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {formData.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {formData.experience} years exp.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {hasChanges && editing && (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-full border border-amber-200">
                  <AlertCircle className="w-4 h-4" />
                  Unsaved changes
                </div>
              )}

              <div className="flex gap-3">
                {editing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading || !hasChanges}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <StarRating rating={averageRating} size="sm" />
                <span className="text-sm font-medium text-gray-700">
                  ({averageRating.toFixed(1)})
                </span>
              </div>
              <p className="text-xs text-gray-500">{totalReviews} Reviews</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {completedAppointments}
                </span>
              </div>
              <p className="text-xs text-gray-500">Patients Treated</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  {formData.appointmentSlots?.length || 0}
                </span>
              </div>
              <p className="text-xs text-gray-500">Available Slots</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  ₹{formData.price}
                </span>
              </div>
              <p className="text-xs text-gray-500">Consultation Fee</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Professional Information
              </h2>
              <DoctorBasicInfo
                doctor={formData}
                isEditing={editing}
                onUpdate={handleBasicInfoUpdate}
              />
            </div>

            {/* Appointment Slots */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
              <AppointmentSlotsManager
                appointmentSlots={formData.appointmentSlots || []}
                isEditing={editing}
                onAddSlot={handleAddSlot}
                onUpdateSlot={handleUpdateSlot}
                onDeleteSlot={handleDeleteSlot}
                onGenerateRecurring={handleGenerateRecurring}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Reviews & Ratings */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Reviews & Ratings
                </h2>
                <div className="flex items-center gap-2">
                  <StarRating rating={averageRating} size="md" />
                  <span className="text-lg font-semibold text-gray-900">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Rating Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-900 mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    <StarRating rating={averageRating} size="lg" />
                  </div>
                  <p className="text-gray-600">
                    Based on {totalReviews} patient{" "}
                    {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reviews.length > 0 ? (
                  reviews.map((review: Review, index: number) => (
                    <div
                      key={review.id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              P
                            </div>
                            <span className="font-medium text-gray-900">
                              Anonymous Patient
                            </span>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {truncateText(review.review, 150)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No reviews yet</p>
                    <p className="text-sm mt-1">
                      Patient reviews will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Contact Information
              </h3>
              <div className="space-y-4">
                {formData.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">{formData.email}</span>
                  </div>
                )}
                {formData.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">{formData.phone}</span>
                  </div>
                )}
                {formData.qualification && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Award className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">
                      {formData.qualification}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {!editing &&
          !hasChanges &&
          formData.appointmentSlots &&
          formData.appointmentSlots.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Profile Complete</p>
                  <p className="text-green-700 text-sm">
                    Your profile is up to date with{" "}
                    {formData.appointmentSlots.length} appointment slots
                    configured
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </section>
  );
}
