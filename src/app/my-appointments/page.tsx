/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarCheck2,
  Clock3,
  Stethoscope,
  Trash2,
  PhoneCall,
  Mail,
  Info,
  MapPin,
  User,
  AlertCircle,
  RefreshCw,
  Calendar,
  Plus,
  ArrowRight,
  CheckCircle,
  XCircle,
  RotateCcw,
  FileText,
  Download,
  Eye,
  X,
  Pill,
  Activity,
  ClipboardList,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useBookingStore } from "@/context/useBookingStore";
import NotificationSystem from "@/app/component/NotificationSystem";
import BotpressChat from "@/app/component/BotpressChat";
import ReviewModal from "../component/ReviewModal";

interface Prescription {
  id: string;
  medicines: {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    beforeAfterFood: string;
  }[];
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
  prescriptions?: any[]; // Legacy field
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
  reviews?: {
    id: string;
    userId: string;
    appointmentId: string;
    rating: number;
    review: string;
    createdAt: string;
    patientName: string;
  }[];
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

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorData, setDoctorData] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<{
    prescription: Prescription;
    doctor: Doctor;
    appointment: Appointment;
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  // Add state for current user ID for notifications
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const router = useRouter();
  const { setDoctor } = useBookingStore();

  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    appointment: null as Appointment | null,
    doctor: null as Doctor | null,
  });

  // Check authentication and redirect if not logged in
  useEffect(() => {
    const checkAuthentication = () => {
      const isLoggedIn = localStorage.getItem("loggedIn");
      const userId = localStorage.getItem("userId");

      if (!isLoggedIn || isLoggedIn !== "true" || !userId) {
        window.location.href = "/login";
        return;
      }

      // Set the current user ID for notifications
      setCurrentUserId(userId);
      setIsCheckingAuth(false);
    };

    checkAuthentication();
  }, []);

  const fetchData = React.useCallback(async () => {
    if (isCheckingAuth) return;

    setIsLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        window.location.href = "/login";
        return;
      }

      const [appointmentsRes, doctorsRes] = await Promise.all([
        fetch("http://localhost:3001/appointments"),
        fetch("http://localhost:3001/doctors"),
      ]);

      if (!appointmentsRes.ok || !doctorsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const appointmentsData = await appointmentsRes.json();
      const doctorsData = await doctorsRes.json();

      const normalizedDoctors = doctorsData.map((doctor: any) => ({
        ...doctor,
        id: doctor.id.toString(),
        price:
          typeof doctor.price === "string"
            ? parseInt(doctor.price)
            : doctor.price,
        experience:
          typeof doctor.experience === "string"
            ? parseInt(doctor.experience)
            : doctor.experience,
        availableDates: doctor.availableDates || [],
        availableTimes: doctor.availableTimes || [],
      }));

      const userAppointments = appointmentsData.filter(
        (apt: Appointment) => apt.userId === userId
      );

      const sortedAppointments = userAppointments.sort(
        (a: Appointment, b: Appointment) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateA.getTime() - dateB.getTime();
        }
      );

      setAppointments(sortedAppointments);
      setDoctorData(normalizedDoctors);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load appointments. Please try again.");
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  }, [isCheckingAuth]);

  useEffect(() => {
    if (!isCheckingAuth) {
      fetchData();
    }
  }, [isCheckingAuth, fetchData]);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setCancellingId(id);

    try {
      const response = await fetch(`http://localhost:3001/appointments/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      setAppointments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Appointment cancelled successfully");
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      toast.error("Failed to cancel appointment. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleRebook = (doctorId: string) => {
    const selectedDoctor = doctorData.find((doc) => doc.id === doctorId);

    if (selectedDoctor) {
      const doctorForStore = {
        id: selectedDoctor.id,
        name: selectedDoctor.name,
        speciality: selectedDoctor.speciality,
        location: selectedDoctor.location,
        price: selectedDoctor.price,
        rating: selectedDoctor.rating || 0,
        experience: selectedDoctor.experience || 0,
        availableDates: selectedDoctor.availableDates || [],
        availableTimes: selectedDoctor.availableTimes || [],
      };

      setDoctor(doctorForStore);

      setTimeout(() => {
        router.push("/booking");
        toast.success(`Rebooking appointment with ${selectedDoctor.name}`);
      }, 100);
    } else {
      toast.error("Doctor information not found. Please try again.");
    }
  };

  const handleViewPrescription = (appointment: Appointment) => {
    const doctor = getDoctor(appointment.doctorId);

    if (!appointment.prescription) {
      toast.error("No prescription found for this appointment");
      return;
    }

    if (!doctor) {
      toast.error("Doctor information not found");
      return;
    }

    setSelectedPrescription({
      prescription: appointment.prescription,
      doctor,
      appointment,
    });
  };

  const handleDownloadPrescription = async (appointment: Appointment) => {
    const doctor = getDoctor(appointment.doctorId);

    if (!appointment.prescription || !doctor) {
      toast.error("Prescription or doctor information not found");
      return;
    }

    setIsDownloading(appointment.id);

    try {
      // Generate PDF content
      const prescriptionHTML = generateProfessionalPrescriptionHTML(
        appointment.prescription,
        doctor,
        appointment
      );

      // Create a new window for printing/PDF generation
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Failed to open print window");
      }

      printWindow.document.write(prescriptionHTML);
      printWindow.document.close();

      // Wait for content to load then trigger print
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);

      toast.success(
        'Prescription ready for download. Choose "Save as PDF" in the print dialog.'
      );
    } catch (err) {
      console.error("Error generating prescription PDF:", err);
      toast.error("Failed to generate prescription PDF");
    } finally {
      setIsDownloading(null);
    }
  };

  const generateProfessionalPrescriptionHTML = (
    prescription: Prescription,
    doctor: Doctor,
    appointment: Appointment
  ): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Medical Prescription - Dr. ${doctor.name}</title>
        <style>
          @page {
            size: A4;
            margin: 0.5in;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white;
            width: 8.5in;
            margin: 0 auto;
            padding: 20px;
          }
          
          .prescription-header {
            border: 3px solid #2563eb;
            padding: 15px;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #f8faff 0%, #e6f0ff 100%);
          }
          
          .clinic-name {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
            font-family: 'Georgia', serif;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .clinic-tagline {
            text-align: center;
            font-size: 14px;
            color: #2563eb;
            font-style: italic;
            margin-bottom: 15px;
          }
          
          .doctor-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-top: 1px solid #2563eb;
            padding-top: 10px;
          }
          
          .doctor-details {
            flex: 1;
          }
          
          .doctor-name {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 3px;
          }
          
          .doctor-qualification {
            font-size: 12px;
            color: #4b5563;
            margin-bottom: 2px;
          }
          
          .doctor-speciality {
            font-size: 13px;
            color: #2563eb;
            font-weight: 600;
            margin-bottom: 5px;
          }
          
          .contact-info {
            font-size: 11px;
            color: #6b7280;
            line-height: 1.3;
          }
          
          .prescription-date {
            text-align: right;
            font-size: 11px;
            color: #374151;
          }
          
          .prescription-number {
            background: #2563eb;
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            font-weight: bold;
            margin-bottom: 5px;
            display: inline-block;
          }
          
          .patient-info {
            background: #f9fafb;
            border: 1px solid #d1d5db;
            padding: 15px;
            margin: 20px 0;
          }
          
          .patient-info h3 {
            font-size: 14px;
            color: #1f2937;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          
          .patient-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 12px;
          }
          
          .rx-symbol {
            font-size: 48px;
            color: #2563eb;
            font-weight: bold;
            margin: 20px 0 10px 0;
            font-family: 'Times New Roman', serif;
          }
          
          .medicines-section {
            margin: 20px 0;
          }
          
          .medicine-item {
            border-left: 3px solid #2563eb;
            padding: 15px;
            margin-bottom: 15px;
            background: #fafbff;
            border-bottom: 1px dotted #9ca3af;
          }
          
          .medicine-name {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
            text-decoration: underline;
          }
          
          .medicine-instructions {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            font-size: 12px;
            margin-bottom: 8px;
          }
          
          .instruction-item {
            display: flex;
          }
          
          .instruction-label {
            font-weight: 600;
            color: #374151;
            min-width: 70px;
          }
          
          .instruction-value {
            color: #1f2937;
          }
          
          .special-instructions {
            font-style: italic;
            color: #4b5563;
            background: #f3f4f6;
            padding: 5px 8px;
            border-radius: 3px;
            margin-top: 5px;
          }
          
          .diagnosis-section {
            margin: 20px 0;
            padding: 15px;
            background: #fff7ed;
            border-left: 4px solid #f97316;
          }
          
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .vital-signs {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin: 15px 0;
          }
          
          .vital-item {
            text-align: center;
            background: #ecfdf5;
            padding: 10px;
            border: 1px solid #10b981;
            border-radius: 5px;
          }
          
          .vital-label {
            font-size: 10px;
            color: #065f46;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 3px;
          }
          
          .vital-value {
            font-size: 14px;
            font-weight: bold;
            color: #047857;
          }
          
          .notes-section {
            margin: 20px 0;
            padding: 15px;
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
          }
          
          .follow-up {
            margin: 20px 0;
            padding: 15px;
            background: #ede9fe;
            border-left: 4px solid #8b5cf6;
          }
          
          .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          
          .signature-box {
            text-align: center;
            width: 200px;
          }
          
          .signature-line {
            border-bottom: 1px solid #000;
            height: 60px;
            margin-bottom: 5px;
            position: relative;
          }
          
          .signature-text {
            font-family: 'Brush Script MT', cursive;
            font-size: 24px;
            color: #2563eb;
            position: absolute;
            bottom: 10px;
            left: 20px;
            transform: rotate(-5deg);
          }
          
          .signature-label {
            font-size: 11px;
            color: #6b7280;
            font-weight: 600;
          }
          
          .stamp-area {
            width: 100px;
            height: 100px;
            border: 2px dashed #9ca3af;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #9ca3af;
            text-align: center;
            position: relative;
          }
          
          .medical-stamp {
            position: absolute;
            width: 90px;
            height: 90px;
            border: 3px solid #2563eb;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(37, 99, 235, 0.1);
            font-size: 8px;
            color: #2563eb;
            font-weight: bold;
            text-align: center;
            line-height: 1.2;
          }
          
          .footer-info {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          
          .warning-text {
            color: #dc2626;
            font-weight: 600;
            margin-top: 10px;
          }
          
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            .prescription-header {
              break-inside: avoid;
            }
            
            .medicine-item {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header Section -->
        <div class="prescription-header">
          <div class="clinic-name">Schedula Health</div>
          <div class="clinic-tagline">Advanced Healthcare Solutions • Your Health, Our Priority</div>
          
          <div class="doctor-info">
            <div class="doctor-details">
              <div class="doctor-name">Dr. ${doctor.name}</div>
              <div class="doctor-qualification">${
                doctor.qualification || "MBBS, MD"
              }</div>
              <div class="doctor-speciality">${doctor.speciality}</div>
              <div class="contact-info">
                ${doctor.location}<br>
                ${
                  doctor.phone ? `Tel: ${doctor.phone}` : "Tel: +91-XXXXX-XXXXX"
                }<br>
                ${
                  doctor.email
                    ? `Email: ${doctor.email}`
                    : "Email: contact@schedulahealth.com"
                }
              </div>
            </div>
            
            <div class="prescription-date">
              <div class="prescription-number">Rx #${appointment.id}</div>
              <strong>Date:</strong> ${formatPrescriptionDate(
                appointment.date
              )}<br>
              <strong>Time:</strong> ${formatTime(appointment.time)}
            </div>
          </div>
        </div>

        <!-- Patient Information -->
        <div class="patient-info">
          <h3>PATIENT INFORMATION</h3>
          <div class="patient-details">
            <div><strong>Patient ID:</strong> ${
              appointment.userId || "N/A"
            }</div>
            <div><strong>Appointment ID:</strong> ${appointment.id}</div>
            <div><strong>Consultation Date:</strong> ${formatPrescriptionDate(
              appointment.date
            )}</div>
            <div><strong>Consultation Time:</strong> ${formatTime(
              appointment.time
            )}</div>
          </div>
        </div>

        ${
          prescription.symptoms
            ? `
        <!-- Chief Complaints -->
        <div class="diagnosis-section">
          <div class="section-title">Chief Complaints</div>
          <p>${prescription.symptoms}</p>
        </div>
        `
            : ""
        }

        ${
          prescription.diagnosis
            ? `
        <!-- Diagnosis -->
        <div class="diagnosis-section">
          <div class="section-title">Clinical Diagnosis</div>
          <p>${prescription.diagnosis}</p>
        </div>
        `
            : ""
        }

        ${
          prescription.vitalSigns &&
          Object.values(prescription.vitalSigns).some((val) => val)
            ? `
        <!-- Vital Signs -->
        <div class="section-title" style="margin-top: 20px;">Vital Signs</div>
        <div class="vital-signs">
          ${
            prescription.vitalSigns.bloodPressure
              ? `
          <div class="vital-item">
            <div class="vital-label">Blood Pressure</div>
            <div class="vital-value">${prescription.vitalSigns.bloodPressure}</div>
          </div>
          `
              : ""
          }
          ${
            prescription.vitalSigns.heartRate
              ? `
          <div class="vital-item">
            <div class="vital-label">Heart Rate</div>
            <div class="vital-value">${prescription.vitalSigns.heartRate} bpm</div>
          </div>
          `
              : ""
          }
          ${
            prescription.vitalSigns.temperature
              ? `
          <div class="vital-item">
            <div class="vital-label">Temperature</div>
            <div class="vital-value">${prescription.vitalSigns.temperature}°F</div>
          </div>
          `
              : ""
          }
          ${
            prescription.vitalSigns.weight
              ? `
          <div class="vital-item">
            <div class="vital-label">Weight</div>
            <div class="vital-value">${prescription.vitalSigns.weight} kg</div>
          </div>
          `
              : ""
          }
        </div>
        `
            : ""
        }

        <!-- Prescription Symbol -->
        <div class="rx-symbol">℞</div>

        ${
          prescription.medicines && prescription.medicines.length > 0
            ? `
        <!-- Medicines -->
        <div class="medicines-section">
          ${prescription.medicines
            .map(
              (medicine, index) => `
          <div class="medicine-item">
            <div class="medicine-name">${index + 1}. ${medicine.name}</div>
            <div class="medicine-instructions">
              <div class="instruction-item">
                <span class="instruction-label">Dosage:</span>
                <span class="instruction-value">${medicine.dosage}</span>
              </div>
              <div class="instruction-item">
                <span class="instruction-label">Frequency:</span>
                <span class="instruction-value">${medicine.frequency}</span>
              </div>
              <div class="instruction-item">
                <span class="instruction-label">Duration:</span>
                <span class="instruction-value">${medicine.duration}</span>
              </div>
              <div class="instruction-item">
                <span class="instruction-label">Timing:</span>
                <span class="instruction-value">${
                  medicine.beforeAfterFood
                }</span>
              </div>
            </div>
            <div class="special-instructions">
              <strong>Instructions:</strong> ${medicine.instructions}
            </div>
          </div>
          `
            )
            .join("")}
        </div>
        `
            : ""
        }

        ${
          prescription.additionalNotes
            ? `
        <!-- Additional Notes -->
        <div class="notes-section">
          <div class="section-title">Additional Notes</div>
          <p>${prescription.additionalNotes}</p>
        </div>
        `
            : ""
        }

        ${
          prescription.followUpDate
            ? `
        <!-- Follow-up -->
        <div class="follow-up">
          <div class="section-title">Follow-up Appointment</div>
          <p><strong>Next Visit:</strong> ${formatPrescriptionDate(
            prescription.followUpDate
          )}</p>
        </div>
        `
            : ""
        }

        <!-- Signature Section -->
        <div class="signature-section">
          <div>
            <div class="stamp-area">
              <div class="medical-stamp">
                <div>SCHEDULA</div>
                <div>HEALTH</div>
                <div style="font-size: 6px;">REG. NO.</div>
                <div style="font-size: 7px;">SH-${doctor.id}</div>
              </div>
            </div>
          </div>
          
          <div class="signature-box">
            <div class="signature-line">
              <div class="signature-text">Dr. ${
                doctor.name.split(" ")[1] || doctor.name
              }</div>
            </div>
            <div class="signature-label">Doctor's Signature</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer-info">
          <p><strong>Schedula Health - Digital Healthcare Platform</strong></p>
          <p>This is a digitally generated prescription. For queries, contact: support@schedulahealth.com</p>
          <div class="warning-text">
            ⚠️ This prescription is valid for 30 days from the date of issue. Do not share with others.
          </div>
          <p style="margin-top: 10px;">Generated on: ${new Date().toLocaleDateString(
            "en-IN",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          )}</p>
        </div>
      </body>
      </html>
    `;
  };

  const handleReviewSubmitted = (updatedDoctor: Doctor) => {
    // Update local state with the updated doctor data
    setDoctorData((prev) =>
      prev.map((doc) => (doc.id === updatedDoctor.id ? updatedDoctor : doc))
    );

    // Close the modal
    setReviewModal({
      isOpen: false,
      appointment: null,
      doctor: null,
    });
  };

  const getDoctor = (id: string): Doctor | undefined => {
    return doctorData.find((doc) => doc.id === id);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

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

  const isUpcoming = (date: string, time: string): boolean => {
    const appointmentDateTime = new Date(`${date} ${time}`);
    const now = new Date();
    return appointmentDateTime > now;
  };

  const isPast = (date: string, time: string): boolean => {
    const appointmentDateTime = new Date(`${date} ${time}`);
    const now = new Date();
    return appointmentDateTime < now;
  };

  // Categorize appointments
  const upcomingAppointments = appointments.filter((apt: Appointment) => {
    if (apt.status === "cancelled") return false;
    return isUpcoming(apt.date, apt.time);
  });

  const completedAppointments = appointments.filter((apt: Appointment) => {
    if (apt.status === "cancelled") return false;
    return apt.status === "completed" || isPast(apt.date, apt.time);
  });

  const cancelledAppointments = appointments.filter(
    (apt: Appointment) => apt.status === "cancelled"
  );

  // Show loading screen while checking authentication or loading data
  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-600 font-medium">
            {isCheckingAuth
              ? "Checking authentication..."
              : "Loading your appointments..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const AppointmentCard = ({
    appointment,
    type,
  }: {
    appointment: Appointment;
    type: "upcoming" | "completed" | "cancelled";
  }) => {
    const doctor = getDoctor(appointment.doctorId);
    const hasPrescription =
      appointment.prescription &&
      appointment.prescription.medicines &&
      appointment.prescription.medicines.length > 0;

    return (
      <div
        className={`bg-white rounded-xl shadow-md border-l-4 p-6 transition-all duration-200 hover:shadow-lg ${
          type === "upcoming"
            ? "border-green-500 hover:bg-green-50"
            : type === "completed"
            ? "border-blue-500 hover:bg-blue-50"
            : "border-red-500 hover:bg-red-50"
        }`}
      >
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          {/* Main Content */}
          <div className="flex-1">
            {/* Doctor Info */}
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                {doctor?.image ? (
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-800">
                    {doctor?.name || "Doctor Not Found"}
                  </h3>
                </div>
                <p className="text-blue-600 font-medium mb-1">
                  {doctor?.speciality || "Speciality not available"}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {doctor?.experience && (
                    <span>{doctor.experience} years experience</span>
                  )}
                  {doctor?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{doctor.location}</span>
                    </div>
                  )}
                  {doctor?.price && (
                    <span className="font-medium text-green-600">
                      ₹{doctor.price}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarCheck2 className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">{formatDate(appointment.date)}</p>
                  <p className="text-sm text-gray-500">Date</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Clock3 className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">{formatTime(appointment.time)}</p>
                  <p className="text-sm text-gray-500">Time</p>
                </div>
              </div>
            </div>

            {/* Prescription Status for Completed Appointments */}
            {type === "completed" && (
              <div className="mb-4">
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    hasPrescription
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {hasPrescription ? (
                    <>
                      <FileText className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        Prescription Available
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        No prescription available
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Notes
                  </span>
                </div>
                <p className="text-sm text-blue-700">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex lg:flex-col gap-2">
            {type === "upcoming" && (
              <button
                onClick={() => handleCancel(appointment.id)}
                disabled={cancellingId === appointment.id}
                className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
                title="Cancel Appointment"
              >
                {cancellingId === appointment.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">Cancel</span>
              </button>
            )}

            {type === "completed" && hasPrescription && (
              <>
                <button
                  onClick={() => handleViewPrescription(appointment)}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-blue-200"
                  title="View Prescription"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">View Prescription</span>
                </button>

                <button
                  onClick={() => handleDownloadPrescription(appointment)}
                  disabled={isDownloading === appointment.id}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-green-200"
                  title="Download Prescription as PDF"
                >
                  {isDownloading === appointment.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Download PDF</span>
                </button>

                <button
                  onClick={() => {
                    const doctor = getDoctor(appointment.doctorId);
                    if (!doctor) {
                      toast.error("Doctor information not found");
                      return;
                    }

                    // Check if user has already reviewed this appointment
                    const existingReview = doctor.reviews?.find(
                      (review) =>
                        review.appointmentId === appointment.id &&
                        review.userId === appointment.userId
                    );

                    // Show modal in all cases (for new or existing review)
                    setReviewModal({
                      isOpen: true,
                      appointment,
                      doctor,
                    });
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors duration-200 border border-amber-200"
                  title="Write a Review"
                >
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">Review</span>
                </button>
              </>
            )}

            {(type === "completed" || type === "cancelled") && (
              <button
                onClick={() => handleRebook(appointment.doctorId)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors duration-200 border border-purple-200"
                title="Book Again with this Doctor"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">Rebook</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Professional Prescription Modal Component with Real Medical Design
  const PrescriptionModal = () => {
    if (!selectedPrescription) return null;

    const { prescription, doctor, appointment } = selectedPrescription;

    return (
      <div className="fixed inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <div className="relative">
                  <Activity className="w-6 h-6 text-white" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-blue-800">
                  Medical Diagnosis Report
                </h2>
                <p className="text-blue-600 text-sm">
                  Patient: {appointment.userId} • Dr. {doctor.name} •{" "}
                  {formatPrescriptionDate(appointment.date)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPrescription(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Professional Prescription Content */}
          <div
            className="p-6 bg-white"
            style={{ fontFamily: "Times New Roman, serif" }}
          >
            {/* Header with Clinic Branding */}
            <div className="border-4 border-blue-600 p-6 mb-6 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <div className="relative">
                      <Activity className="w-4 h-4 text-white" />
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <h1
                    className="text-3xl font-bold text-blue-800 tracking-wider"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    SCHEDULA HEALTH
                  </h1>
                </div>
                <p className="text-blue-600 italic text-sm mt-1">
                  Advanced Healthcare Solutions • Your Health, Our Priority
                </p>
              </div>

              <div className="border-t-2 border-blue-600 pt-4 flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-blue-800 mb-1">
                    Dr. {doctor.name}
                  </h2>
                  <p className="text-gray-700 text-sm">
                    {doctor.qualification || "MBBS, MD"}
                  </p>
                  <p className="text-blue-600 font-semibold">
                    {doctor.speciality}
                  </p>
                  <div className="text-gray-600 text-xs mt-2">
                    <p>{doctor.location}</p>
                    <p>Tel: {doctor.phone || "+91-XXXXX-XXXXX"}</p>
                    <p>Email: {doctor.email || "contact@schedulahealth.com"}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded font-bold text-sm mb-2">
                    ID #{appointment.id}
                  </div>
                  <p className="text-xs">
                    <strong>Date:</strong>{" "}
                    {formatPrescriptionDate(appointment.date)}
                  </p>
                  <p className="text-xs">
                    <strong>Time:</strong> {formatTime(appointment.time)}
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="bg-gray-50 border p-4 mb-6">
              <h3 className="font-bold text-gray-800 text-sm mb-3 border-b border-gray-300 pb-2">
                PATIENT INFORMATION
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <strong>Patient ID:</strong> {appointment.userId || "N/A"}
                </div>
                <div>
                  <strong>Appointment ID:</strong> {appointment.id}
                </div>
                <div>
                  <strong>Consultation Date:</strong>{" "}
                  {formatPrescriptionDate(appointment.date)}
                </div>
                <div>
                  <strong>Consultation Time:</strong>{" "}
                  {formatTime(appointment.time)}
                </div>
              </div>
            </div>

            {/* Clinical Information */}
            {prescription.symptoms && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
                <h3 className="font-bold text-gray-800 text-sm mb-2">
                  CHIEF COMPLAINTS
                </h3>
                <p className="text-sm">{prescription.symptoms}</p>
              </div>
            )}

            {prescription.diagnosis && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
                <h3 className="font-bold text-gray-800 text-sm mb-2">
                  CLINICAL DIAGNOSIS
                </h3>
                <p className="text-sm">{prescription.diagnosis}</p>
              </div>
            )}

            {/* Vital Signs */}
            {prescription.vitalSigns &&
              Object.values(prescription.vitalSigns).some((val) => val) && (
                <div className="mb-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">
                    VITAL SIGNS
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {prescription.vitalSigns.bloodPressure && (
                      <div className="bg-green-50 border border-green-300 p-3 text-center rounded">
                        <div className="text-xs text-green-700 font-bold">
                          BLOOD PRESSURE
                        </div>
                        <div className="text-sm font-bold text-green-800">
                          {prescription.vitalSigns.bloodPressure}
                        </div>
                        <div className="text-xs text-green-600">mmHg</div>
                      </div>
                    )}
                    {prescription.vitalSigns.heartRate && (
                      <div className="bg-green-50 border border-green-300 p-3 text-center rounded">
                        <div className="text-xs text-green-700 font-bold">
                          HEART RATE
                        </div>
                        <div className="text-sm font-bold text-green-800">
                          {prescription.vitalSigns.heartRate}
                        </div>
                        <div className="text-xs text-green-600">bpm</div>
                      </div>
                    )}
                    {prescription.vitalSigns.temperature && (
                      <div className="bg-green-50 border border-green-300 p-3 text-center rounded">
                        <div className="text-xs text-green-700 font-bold">
                          TEMPERATURE
                        </div>
                        <div className="text-sm font-bold text-green-800">
                          {prescription.vitalSigns.temperature}
                        </div>
                        <div className="text-xs text-green-600">°F</div>
                      </div>
                    )}
                    {prescription.vitalSigns.weight && (
                      <div className="bg-green-50 border border-green-300 p-3 text-center rounded">
                        <div className="text-xs text-green-700 font-bold">
                          WEIGHT
                        </div>
                        <div className="text-sm font-bold text-green-800">
                          {prescription.vitalSigns.weight}
                        </div>
                        <div className="text-xs text-green-600">kg</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Prescription Symbol and Medicines */}
            <div
              className="text-5xl text-blue-600 font-bold my-6"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              ℞
            </div>

            {prescription.medicines && prescription.medicines.length > 0 && (
              <div className="mb-6">
                {prescription.medicines.map((medicine, index) => (
                  <div
                    key={medicine.id}
                    className="border-l-4 border-blue-600 bg-blue-50 p-4 mb-4"
                  >
                    <div className="text-lg font-bold text-gray-800 mb-2 underline">
                      {index + 1}. {medicine.name}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                      <div>
                        <span className="font-semibold">Dosage:</span>{" "}
                        {medicine.dosage}
                      </div>
                      <div>
                        <span className="font-semibold">Frequency:</span>{" "}
                        {medicine.frequency}
                      </div>
                      <div>
                        <span className="font-semibold">Duration:</span>{" "}
                        {medicine.duration}
                      </div>
                      <div>
                        <span className="font-semibold">Timing:</span>{" "}
                        {medicine.beforeAfterFood}
                      </div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded italic text-sm">
                      <strong>Instructions:</strong> {medicine.instructions}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Additional Notes */}
            {prescription.additionalNotes && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <h3 className="font-bold text-gray-800 text-sm mb-2">
                  ADDITIONAL NOTES
                </h3>
                <p className="text-sm">{prescription.additionalNotes}</p>
              </div>
            )}

            {/* Follow-up */}
            {prescription.followUpDate && (
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
                <h3 className="font-bold text-gray-800 text-sm mb-2">
                  FOLLOW-UP APPOINTMENT
                </h3>
                <p className="text-sm">
                  <strong>Next Visit:</strong>{" "}
                  {formatPrescriptionDate(prescription.followUpDate)}
                </p>
              </div>
            )}

            {/* Signature Section */}
            <div className="flex justify-between items-end mt-12 pt-6 border-t border-gray-300">
              <div className="text-center">
                <div className="w-24 h-24 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-2 border-2 border-blue-600 rounded-full flex flex-col items-center justify-center text-blue-600 text-xs font-bold">
                    <div>SCHEDULA</div>
                    <div>HEALTH</div>
                    <div className="text-[8px]">REG. NO.</div>
                    <div className="text-[9px]">SH-{doctor.id}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Medical Stamp</p>
              </div>

              <div className="text-center">
                <div className="w-48 border-b-2 border-gray-800 h-16 relative mb-2">
                  <div
                    className="absolute bottom-2 left-4 text-blue-600 text-2xl transform -rotate-3"
                    style={{ fontFamily: "Brush Script MT, cursive" }}
                  >
                    Dr. {doctor.name.split(" ")[1] || doctor.name}
                  </div>
                </div>
                <p className="text-xs text-gray-600">Doctor's Signature</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
              <p className="font-semibold">
                Schedula Health - Digital Healthcare Platform
              </p>
              <p>
                This is a digitally generated prescription. For queries,
                contact: support@schedulahealth.com
              </p>
              <div className="text-red-600 font-semibold mt-2">
                ⚠️ This prescription is valid for 30 days from the date of
                issue. Do not share with others.
              </div>
              <p className="mt-2">
                Generated on:{" "}
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              <p>
                Created: {new Date(prescription.createdAt).toLocaleDateString()}
              </p>
              {prescription.updatedAt !== prescription.createdAt && (
                <p>
                  Updated:{" "}
                  {new Date(prescription.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDownloadPrescription(appointment)}
              disabled={isDownloading === appointment.id}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading === appointment.id ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download Professional PDF
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header with Notifications */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">
              My Appointments Dashboard
            </h1>
            <BotpressChat />
            <p className="text-blue-600">
              Manage your healthcare appointments efficiently
            </p>
          </div>

          {/* Notification System */}
          {currentUserId && (
            <div className="flex-shrink-0">
              <NotificationSystem currentUserId={currentUserId} />
            </div>
          )}
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Upcoming Appointments */}
          <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Upcoming</h3>
                <p className="text-green-100">Next appointments</p>
              </div>
              <Calendar className="w-10 h-10 text-green-100" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {upcomingAppointments.length}
            </div>
            <p className="text-green-100 text-sm">
              {upcomingAppointments.length > 0
                ? "Stay prepared!"
                : "No upcoming appointments"}
            </p>
          </div>

          {/* Completed Appointments */}
          <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Completed</h3>
                <p className="text-blue-100">Past appointments</p>
              </div>
              <CheckCircle className="w-10 h-10 text-blue-100" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {completedAppointments.length}
            </div>
            <p className="text-blue-100 text-sm">
              {completedAppointments.length > 0
                ? "Healthcare journey"
                : "No completed appointments"}
            </p>
          </div>

          {/* Cancelled Appointments */}
          <div className="bg-gradient-to-br from-red-400 via-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Cancelled</h3>
                <p className="text-red-100">Cancelled appointments</p>
              </div>
              <XCircle className="w-10 h-10 text-red-100" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {cancelledAppointments.length}
            </div>
            <p className="text-red-100 text-sm">
              {cancelledAppointments.length > 0
                ? "Rebook if needed"
                : "No cancelled appointments"}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Calendar className="w-4 h-4" />
            <span>{appointments.length} total appointments</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                const isLoggedIn = localStorage.getItem("loggedIn");
                const userId = localStorage.getItem("userId");

                if (!isLoggedIn || isLoggedIn !== "true" || !userId) {
                  window.location.href = "/login";
                  return;
                }

                fetchData();
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              Book New
            </Link>
          </div>
        </div>

        {/* No Appointments State */}
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              No appointments found
            </h3>
            <p className="text-blue-600 mb-6">
              You haven't booked any appointments yet.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-5 h-5" />
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <>
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Upcoming Appointments
                  </h2>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {upcomingAppointments.length}
                  </span>
                </div>
                <div className="grid gap-4 md:gap-6">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      type="upcoming"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Appointments */}
            {completedAppointments.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Completed Appointments
                  </h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {completedAppointments.length}
                  </span>
                </div>
                <div className="grid gap-4 md:gap-6">
                  {completedAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      type="completed"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled Appointments */}
            {cancelledAppointments.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-red-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Cancelled Appointments
                  </h2>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {cancelledAppointments.length}
                  </span>
                </div>
                <div className="grid gap-4 md:gap-6">
                  {cancelledAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      type="cancelled"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Professional Prescription Modal */}
      <PrescriptionModal />
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() =>
          setReviewModal({ isOpen: false, appointment: null, doctor: null })
        }
        appointment={reviewModal.appointment}
        doctor={reviewModal.doctor}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
