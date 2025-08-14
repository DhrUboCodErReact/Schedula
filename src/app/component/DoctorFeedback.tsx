/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  StarIcon,
  Filter,
  Calendar,
  User,
  MessageSquare,
  TrendingUp,
  Clock,
  Search,
  ChevronDown,
  Award,
  Users,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Review {
  id: string;
  userId: string;
  appointmentId: string;
  rating: number;
  review: string;
  createdAt: string;
  patientName: string;
  updatedAt?: string;
}

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  location: string;
  price: number;
  rating: number;
  experience: number;
  reviewCount?: number;
  reviews?: Review[];
}

interface Appointment {
  id: string;
  doctorId: string;
  userId?: string;
  date: string;
  time: string;
  status?: string;
}

interface DoctorFeedbackProps {
  doctorId: string; // Current logged-in doctor's ID
}

const DoctorFeedback: React.FC<DoctorFeedbackProps> = ({ doctorId }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [doctorId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [doctorResponse, usersResponse, appointmentsResponse] = await Promise.all([
        fetch(`http://localhost:3001/doctors/${doctorId}`),
        fetch("http://localhost:3001/users"),
        fetch("http://localhost:3001/appointments")
      ]);

      if (!doctorResponse.ok) throw new Error("Failed to fetch doctor data");
      if (!usersResponse.ok) throw new Error("Failed to fetch users data");
      if (!appointmentsResponse.ok) throw new Error("Failed to fetch appointments data");

      const doctorData = await doctorResponse.json();
      const usersData = await usersResponse.json();
      const appointmentsData = await appointmentsResponse.json();

      setDoctor(doctorData);
      setUsers(usersData);
      setAppointments(appointmentsData);
      
      // Process reviews with actual patient names
      const reviewsWithNames = (doctorData.reviews || []).map((review: Review) => {
        const appointment = appointmentsData.find((apt: Appointment) => apt.id === review.appointmentId);
        const user = usersData.find((u: User) => u.id === appointment?.userId || u.id === review.userId);
        
        return {
          ...review,
          patientName: user?.name || `Patient-${review.userId?.slice(-4) || "Unknown"}`
        };
      });
      
      setReviews(reviewsWithNames);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load feedback data");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort reviews
  const filteredAndSortedReviews = React.useMemo(() => {
    let filtered = reviews;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.review.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rating filter
    if (selectedRating !== null) {
      filtered = filtered.filter((review) => review.rating === selectedRating);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [reviews, searchTerm, selectedRating, sortBy]);

  // Calculate rating statistics
  const ratingStats = React.useMemo(() => {
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      stats[review.rating as keyof typeof stats]++;
    });
    return stats;
  }, [reviews]);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingBgColor = (rating: number): string => {
    if (rating >= 4.5) return "bg-green-100";
    if (rating >= 3.5) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-600">
        <MessageSquare className="w-8 h-8 mr-2" />
        {error}
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-600">
        <User className="w-8 h-8 mr-2" />
        Doctor not found
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Patient Feedback</h1>
              <p className="text-gray-600">Reviews for Dr. {doctor.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Overall Rating */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-3xl font-bold ${getRatingColor(doctor.rating)}`}>
                  {doctor.rating?.toFixed(1) || "0.0"}
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-5 h-5 ${
                        star <= (doctor.rating || 0)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {reviews.length}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {reviews.filter(review => {
                  const reviewDate = new Date(review.createdAt);
                  const now = new Date();
                  return reviewDate.getMonth() === now.getMonth() && 
                         reviewDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Average This Week */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week Avg</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {(() => {
                  const weekReviews = reviews.filter(review => {
                    const reviewDate = new Date(review.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return reviewDate >= weekAgo;
                  });
                  const avg = weekReviews.length > 0 
                    ? weekReviews.reduce((sum, r) => sum + r.rating, 0) / weekReviews.length 
                    : 0;
                  return avg.toFixed(1);
                })()}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="w-4 text-sm font-medium">{rating}</span>
              <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${reviews.length > 0 ? (ratingStats[rating as keyof typeof ratingStats] / reviews.length) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-8">
                {ratingStats[rating as keyof typeof ratingStats]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reviews or patient names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Rating
                </label>
                <select
                  value={selectedRating || ""}
                  onChange={(e) => setSelectedRating(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredAndSortedReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {reviews.length === 0 ? "No Reviews Yet" : "No Reviews Match Your Filters"}
            </h3>
            <p className="text-gray-500">
              {reviews.length === 0 
                ? "You haven't received any patient reviews yet." 
                : "Try adjusting your search terms or filters."}
            </p>
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{review.patientName}</h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                      {review.updatedAt && (
                        <span className="ml-2 text-xs text-blue-600">
                          • Edited {formatDate(review.updatedAt)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getRatingBgColor(review.rating)}`}>
                  <StarIcon className={`w-4 h-4 ${getRatingColor(review.rating)} fill-current`} />
                  <span className={`text-sm font-semibold ${getRatingColor(review.rating)}`}>
                    {review.rating}.0
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">{review.review}</p>
              </div>

              <div className="flex items-center text-xs text-gray-500">
                <Users className="w-3 h-3 mr-1" />
                Appointment ID: {review.appointmentId}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show results count */}
      {filteredAndSortedReviews.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredAndSortedReviews.length} of {reviews.length} reviews
        </div>
      )}
    </div>
  );
};

export default DoctorFeedback;