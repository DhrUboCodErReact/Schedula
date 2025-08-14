/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Target,
  Lightbulb,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  Download,
  Zap,
  Heart,
  UserCheck,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface Review {
  id: string;
  userId: string;
  appointmentId: string;
  rating: number;
  review: string;
  createdAt: string;
  patientName: string;
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

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
}

interface AnalyticsData {
  overallRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  recentReviews: Review[];
  monthlyTrends: { month: string; rating: number; count: number }[];
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keyInsights: string[];
  competitorComparison: {
    yourRating: number;
    averageInSpecialty: number;
    averageInLocation: number;
  };
  conversionOpportunities: {
    followUpNeeded: Review[];
    improvementAreas: string[];
    strengths: string[];
  };
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  doctorId,
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'opportunities' | 'trends'>('overview');
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    if (isOpen && doctorId) {
      fetchAnalyticsData();
    }
  }, [isOpen, doctorId, dateFilter]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch current doctor data
      const doctorResponse = await fetch(`https://mock-api-schedula-1-xzbk.onrender.com/doctors/${doctorId}`);
      if (!doctorResponse.ok) {
        throw new Error("Failed to fetch doctor data");
      }
      const doctor: Doctor = await doctorResponse.json();

      // Fetch all doctors for comparison
      const allDoctorsResponse = await fetch("https://mock-api-schedula-1-xzbk.onrender.com/doctors");
      if (!allDoctorsResponse.ok) {
        throw new Error("Failed to fetch comparison data");
      }
      const allDoctors: Doctor[] = await allDoctorsResponse.json();

      // Process analytics data
      const processedData = processAnalyticsData(doctor, allDoctors);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (doctor: Doctor, allDoctors: Doctor[]): AnalyticsData => {
    const reviews = doctor.reviews || [];
    
    // Filter reviews based on date filter
    const cutoffDate = new Date();
    if (dateFilter === '7d') cutoffDate.setDate(cutoffDate.getDate() - 7);
    else if (dateFilter === '30d') cutoffDate.setDate(cutoffDate.getDate() - 30);
    else if (dateFilter === '90d') cutoffDate.setDate(cutoffDate.getDate() - 90);
    
    const filteredReviews = dateFilter === 'all' ? reviews : 
      reviews.filter(review => new Date(review.createdAt) >= cutoffDate);

    // Rating distribution
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredReviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    // Monthly trends (last 6 months)
    const monthlyTrends = generateMonthlyTrends(reviews);

    // Sentiment analysis
    const sentimentAnalysis = {
      positive: ratingDistribution[4] + ratingDistribution[5],
      neutral: ratingDistribution[3],
      negative: ratingDistribution[1] + ratingDistribution[2]
    };

    // Competitor comparison
    const specialtyDoctors = allDoctors.filter(d => d.speciality === doctor.speciality && d.id !== doctor.id);
    const locationDoctors = allDoctors.filter(d => d.location === doctor.location && d.id !== doctor.id);
    
    const averageInSpecialty = specialtyDoctors.length > 0 ? 
      specialtyDoctors.reduce((sum, d) => sum + (d.rating || 0), 0) / specialtyDoctors.length : 0;
    
    const averageInLocation = locationDoctors.length > 0 ? 
      locationDoctors.reduce((sum, d) => sum + (d.rating || 0), 0) / locationDoctors.length : 0;

    // Generate insights
    const keyInsights = generateKeyInsights(doctor, ratingDistribution, sentimentAnalysis);
    
    // Conversion opportunities
    const conversionOpportunities = generateConversionOpportunities(filteredReviews, ratingDistribution);

    return {
      overallRating: doctor.rating || 0,
      totalReviews: filteredReviews.length,
      ratingDistribution,
      recentReviews: filteredReviews.slice(-5),
      monthlyTrends,
      sentimentAnalysis,
      keyInsights,
      competitorComparison: {
        yourRating: doctor.rating || 0,
        averageInSpecialty,
        averageInLocation,
      },
      conversionOpportunities,
    };
  };

  const generateMonthlyTrends = (reviews: Review[]) => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthReviews = reviews.filter(review => {
        const reviewDate = new Date(review.createdAt);
        return reviewDate.getMonth() === date.getMonth() && 
               reviewDate.getFullYear() === date.getFullYear();
      });
      
      const avgRating = monthReviews.length > 0 ? 
        monthReviews.reduce((sum, review) => sum + review.rating, 0) / monthReviews.length : 0;
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        rating: Math.round(avgRating * 10) / 10,
        count: monthReviews.length
      });
    }
    
    return months;
  };

  const generateKeyInsights = (doctor: Doctor, ratingDist: { [key: number]: number }, sentiment: any): string[] => {
    const insights: string[] = [];
    const totalReviews = Object.values(ratingDist).reduce((sum, count) => sum + count, 0);
    
    if (totalReviews === 0) {
      insights.push("No reviews yet - focus on encouraging satisfied patients to leave reviews");
      return insights;
    }

    // Rating performance insights
    const positivePercentage = ((sentiment.positive / totalReviews) * 100);
    const negativePercentage = ((sentiment.negative / totalReviews) * 100);
    
    if (positivePercentage >= 80) {
      insights.push(`Excellent reputation with ${positivePercentage.toFixed(0)}% positive reviews`);
    } else if (positivePercentage >= 60) {
      insights.push(`Good reputation but room for improvement - ${positivePercentage.toFixed(0)}% positive reviews`);
    } else {
      insights.push(`Reputation needs attention - only ${positivePercentage.toFixed(0)}% positive reviews`);
    }

    // Negative review insights
    if (negativePercentage > 20) {
      insights.push(`High negative feedback (${negativePercentage.toFixed(0)}%) - immediate action needed`);
    } else if (negativePercentage > 10) {
      insights.push(`Moderate negative feedback (${negativePercentage.toFixed(0)}%) - monitor closely`);
    }

    // Volume insights
    if (totalReviews < 10) {
      insights.push("Low review volume - implement review collection strategy");
    } else if (totalReviews >= 50) {
      insights.push("Strong review volume - good patient engagement");
    }

    // Most common rating
    const mostCommonRating = Object.entries(ratingDist).reduce((a, b) => 
      ratingDist[parseInt(a[0])] > ratingDist[parseInt(b[0])] ? a : b
    )[0];
    
    if (parseInt(mostCommonRating) === 5) {
      insights.push("Most patients rate you 5 stars - leverage this in marketing");
    } else if (parseInt(mostCommonRating) <= 2) {
      insights.push("Most common ratings are low - urgent service improvement needed");
    }

    return insights;
  };

  const generateConversionOpportunities = (reviews: Review[], ratingDist: { [key: number]: number }) => {
    const lowRatingReviews = reviews.filter(review => review.rating <= 2);
    const moderateRatingReviews = reviews.filter(review => review.rating === 3);
    
    const followUpNeeded = [...lowRatingReviews, ...moderateRatingReviews];
    
    // Analyze common themes in negative reviews
    const negativeReviews = reviews.filter(review => review.rating <= 2);
    const improvementAreas: string[] = [];
    const strengths: string[] = [];
    
    // Simple keyword analysis for improvement areas
    const commonIssues = [
      { keyword: 'wait', issue: 'Reduce waiting times' },
      { keyword: 'staff', issue: 'Improve staff training and courtesy' },
      { keyword: 'expensive', issue: 'Review pricing strategy' },
      { keyword: 'rush', issue: 'Spend more time with patients' },
      { keyword: 'explain', issue: 'Better communication of treatment plans' },
      { keyword: 'appointment', issue: 'Improve appointment scheduling system' },
    ];
    
    negativeReviews.forEach(review => {
      commonIssues.forEach(issue => {
        if (review.review.toLowerCase().includes(issue.keyword) && !improvementAreas.includes(issue.issue)) {
          improvementAreas.push(issue.issue);
        }
      });
    });
    
    // Analyze positive reviews for strengths
    const positiveReviews = reviews.filter(review => review.rating >= 4);
    const commonStrengths = [
      { keyword: 'kind', strength: 'Compassionate care' },
      { keyword: 'professional', strength: 'Professional demeanor' },
      { keyword: 'thorough', strength: 'Comprehensive examinations' },
      { keyword: 'clean', strength: 'Clean facilities' },
      { keyword: 'knowledgeable', strength: 'Medical expertise' },
      { keyword: 'helpful', strength: 'Helpful staff' },
    ];
    
    positiveReviews.forEach(review => {
      commonStrengths.forEach(strength => {
        if (review.review.toLowerCase().includes(strength.keyword) && !strengths.includes(strength.strength)) {
          strengths.push(strength.strength);
        }
      });
    });
    
    return {
      followUpNeeded,
      improvementAreas: improvementAreas.length > 0 ? improvementAreas : ['Focus on patient communication', 'Reduce waiting times', 'Enhance overall patient experience'],
      strengths: strengths.length > 0 ? strengths : ['Maintain current service quality', 'Continue professional development', 'Leverage patient satisfaction']
    };
  };

  const exportAnalytics = () => {
    if (!analyticsData) return;
    
    const data = {
      exportDate: new Date().toISOString(),
      period: dateFilter,
      analytics: analyticsData
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${doctorId}-${dateFilter}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Analytics exported successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-blue-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
              <p className="text-gray-600 text-sm">Reputation management & growth insights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            
            <button
              onClick={exportAnalytics}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'insights', label: 'Key Insights', icon: Lightbulb },
              { id: 'opportunities', label: 'Growth Opportunities', icon: Target },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-3 text-gray-600">Loading analytics...</span>
            </div>
          ) : analyticsData ? (
            <div>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Overall Rating</p>
                          <p className="text-2xl font-bold text-green-800">{analyticsData.overallRating.toFixed(1)}</p>
                        </div>
                        <Star className="w-8 h-8 text-green-500" />
                      </div>
                      <div className="mt-2 flex items-center text-xs">
                        {analyticsData.competitorComparison.yourRating > analyticsData.competitorComparison.averageInSpecialty ? (
                          <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                        ) : analyticsData.competitorComparison.yourRating < analyticsData.competitorComparison.averageInSpecialty ? (
                          <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                        ) : (
                          <Minus className="w-3 h-3 text-gray-500 mr-1" />
                        )}
                        <span className="text-gray-600">vs specialty avg</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Total Reviews</p>
                          <p className="text-2xl font-bold text-blue-800">{analyticsData.totalReviews}</p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">in selected period</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Positive Reviews</p>
                          <p className="text-2xl font-bold text-purple-800">
                            {analyticsData.totalReviews > 0 ? Math.round((analyticsData.sentimentAnalysis.positive / analyticsData.totalReviews) * 100) : 0}%
                          </p>
                        </div>
                        <ThumbsUp className="w-8 h-8 text-purple-500" />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">4-5 star ratings</p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-600 text-sm font-medium">Needs Follow-up</p>
                          <p className="text-2xl font-bold text-amber-800">
                            {analyticsData.conversionOpportunities.followUpNeeded.length}
                          </p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">reviews ≤ 3 stars</p>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Rating Distribution
                    </h3>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = analyticsData.ratingDistribution[rating];
                        const percentage = analyticsData.totalReviews > 0 ? (count / analyticsData.totalReviews) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-16">
                              <span className="text-sm font-medium">{rating}</span>
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  rating >= 4 ? 'bg-green-500' : rating === 3 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-16 text-right">
                              {count} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Competitor Comparison */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Competitive Position
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Your Rating</p>
                        <p className="text-2xl font-bold text-blue-800">{analyticsData.competitorComparison.yourRating.toFixed(1)}</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Specialty Average</p>
                        <p className="text-2xl font-bold text-gray-800">{analyticsData.competitorComparison.averageInSpecialty.toFixed(1)}</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Location Average</p>
                        <p className="text-2xl font-bold text-gray-800">{analyticsData.competitorComparison.averageInLocation.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Insights Tab */}
              {activeTab === 'insights' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      Key Performance Insights
                    </h3>
                    <div className="space-y-3">
                      {analyticsData.keyInsights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Reviews Analysis */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Reviews Analysis</h3>
                    <div className="space-y-4">
                      {analyticsData.recentReviews.length > 0 ? (
                        analyticsData.recentReviews.map((review) => (
                          <div key={review.id} className="border-l-4 border-blue-500 pl-4 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">
                                by {review.patientName} • {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">"{review.review}"</p>
                            {review.rating <= 3 && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                                <AlertTriangle className="w-3 h-3" />
                                Requires follow-up action
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">No reviews in selected period</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Growth Opportunities Tab */}
              {activeTab === 'opportunities' && (
                <div className="space-y-6">
                  {/* Reputation Recovery */}
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      Reputation Recovery ({analyticsData.conversionOpportunities.followUpNeeded.length} reviews)
                    </h3>
                    <div className="space-y-4">
                      {analyticsData.conversionOpportunities.followUpNeeded.length > 0 ? (
                        analyticsData.conversionOpportunities.followUpNeeded.slice(0, 5).map((review) => (
                          <div key={review.id} className="bg-white rounded-lg p-4 border border-red-200">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">{review.patientName}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">"{review.review}"</p>
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                                Contact Patient
                              </button>
                              <button className="px-3 py-1 text-blue-600 border border-blue-300 text-xs rounded-lg hover:bg-blue-50 transition-colors">
                                Schedule Call
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <UserCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
                          <p className="text-gray-600">No reviews requiring immediate follow-up!</p>
                          <p className="text-gray-500 text-sm">All recent reviews are 4+ stars</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Improvement Areas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        Areas for Improvement
                      </h3>
                      <div className="space-y-3">
                        {analyticsData.conversionOpportunities.improvementAreas.map((area, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-gray-700 font-medium">{area}</p>
                              <div className="mt-2 flex gap-2">
                                <button className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded hover:bg-orange-200 transition-colors">
                                  Create Action Plan
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-green-600" />
                        Your Strengths
                      </h3>
                      <div className="space-y-3">
                        {analyticsData.conversionOpportunities.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-gray-700 font-medium">{strength}</p>
                              <div className="mt-2 flex gap-2">
                                <button className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors">
                                  Leverage in Marketing
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actionable Strategies */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      Growth Strategies
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-800">Review Collection</h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          Implement systematic review requests after positive patient interactions
                        </p>
                        <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                          Setup Automation
                        </button>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-800">Patient Engagement</h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          Create follow-up campaigns for satisfied patients to encourage referrals
                        </p>
                        <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                          Create Campaign
                        </button>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-5 h-5 text-blue-600" />
                          <h4 className="font-semibold text-gray-800">Online Presence</h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          Optimize your profile with positive review highlights and testimonials
                        </p>
                        <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                          Optimize Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trends Tab */}
              {activeTab === 'trends' && (
                <div className="space-y-6">
                  {/* Monthly Trends Chart */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Rating Trends (Last 6 Months)
                    </h3>
                    <div className="space-y-4">
                      {analyticsData.monthlyTrends.map((month, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-12 text-sm font-medium text-gray-600">{month.month}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                            <div
                              className={`h-3 rounded-full ${
                                month.rating >= 4 ? 'bg-green-500' : month.rating >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(month.rating / 5) * 100}%` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center px-2">
                              <span className="text-xs font-medium text-white">
                                {month.rating > 0 ? month.rating.toFixed(1) : 'No reviews'}
                              </span>
                            </div>
                          </div>
                          <div className="w-16 text-sm text-gray-600 text-right">
                            {month.count} reviews
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trend Analysis */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      Trend Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(() => {
                        const recentMonths = analyticsData.monthlyTrends.slice(-3);
                        const olderMonths = analyticsData.monthlyTrends.slice(0, 3);
                        
                        const recentAvg = recentMonths.reduce((sum, m) => sum + m.rating, 0) / recentMonths.length;
                        const olderAvg = olderMonths.reduce((sum, m) => sum + m.rating, 0) / olderMonths.length;
                        
                        const trend = recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable';
                        const trendValue = Math.abs(recentAvg - olderAvg);
                        
                        return (
                          <>
                            <div className="bg-white p-4 rounded-lg text-center">
                              <div className={`flex items-center justify-center gap-1 mb-2 ${
                                trend === 'improving' ? 'text-green-600' : 
                                trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {trend === 'improving' ? <TrendingUp className="w-5 h-5" /> :
                                 trend === 'declining' ? <TrendingDown className="w-5 h-5" /> :
                                 <Minus className="w-5 h-5" />}
                                <span className="font-semibold capitalize">{trend}</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-800">
                                {trendValue.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-600">rating change</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg text-center">
                              <div className="flex items-center justify-center gap-1 mb-2 text-blue-600">
                                <Calendar className="w-5 h-5" />
                                <span className="font-semibold">Recent Period</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-800">
                                {recentAvg.toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-600">avg rating (last 3 months)</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg text-center">
                              <div className="flex items-center justify-center gap-1 mb-2 text-gray-600">
                                <Clock className="w-5 h-5" />
                                <span className="font-semibold">Previous Period</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-800">
                                {olderAvg.toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-600">avg rating (3-6 months ago)</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Predictive Insights */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-cyan-600" />
                      Predictive Insights & Recommendations
                    </h3>
                    <div className="space-y-4">
                      {(() => {
                        const insights = [];
                        const recentTrend = analyticsData.monthlyTrends.slice(-3);
                        const avgRating = recentTrend.reduce((sum, m) => sum + m.rating, 0) / recentTrend.length;
                        
                        if (avgRating >= 4.5) {
                          insights.push({
                            type: 'success',
                            title: 'Excellent Performance',
                            description: 'Your rating trend is exceptional. Focus on maintaining current service quality and leveraging positive reviews for marketing.',
                            action: 'Create testimonial campaigns'
                          });
                        } else if (avgRating >= 4.0) {
                          insights.push({
                            type: 'good',
                            title: 'Strong Performance',
                            description: 'Good ratings with room for improvement. Identify and address minor issues to reach excellence.',
                            action: 'Implement service enhancements'
                          });
                        } else if (avgRating >= 3.0) {
                          insights.push({
                            type: 'warning',
                            title: 'Needs Attention',
                            description: 'Moderate ratings indicate significant improvement opportunities. Focus on patient satisfaction initiatives.',
                            action: 'Urgent service review needed'
                          });
                        } else {
                          insights.push({
                            type: 'danger',
                            title: 'Critical Action Required',
                            description: 'Low ratings require immediate intervention. Consider comprehensive service audit and staff training.',
                            action: 'Emergency improvement plan'
                          });
                        }
                        
                        // Review volume insights
                        const totalReviews = analyticsData.totalReviews;
                        if (totalReviews < 10) {
                          insights.push({
                            type: 'info',
                            title: 'Low Review Volume',
                            description: 'Implement review collection strategies to build credibility and attract more patients.',
                            action: 'Launch review campaign'
                          });
                        } else if (totalReviews >= 50) {
                          insights.push({
                            type: 'success',
                            title: 'Strong Review Engagement',
                            description: 'Excellent review volume demonstrates good patient engagement. Maintain this momentum.',
                            action: 'Continue current strategy'
                          });
                        }
                        
                        return insights.map((insight, index) => (
                          <div key={index} className={`p-4 rounded-lg border-l-4 ${
                            insight.type === 'success' ? 'bg-green-50 border-green-500' :
                            insight.type === 'good' ? 'bg-blue-50 border-blue-500' :
                            insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                            insight.type === 'danger' ? 'bg-red-50 border-red-500' :
                            'bg-gray-50 border-gray-500'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className={`font-semibold mb-1 ${
                                  insight.type === 'success' ? 'text-green-800' :
                                  insight.type === 'good' ? 'text-blue-800' :
                                  insight.type === 'warning' ? 'text-yellow-800' :
                                  insight.type === 'danger' ? 'text-red-800' :
                                  'text-gray-800'
                                }`}>
                                  {insight.title}
                                </h4>
                                <p className="text-gray-700 text-sm mb-2">{insight.description}</p>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                                  insight.type === 'success' ? 'bg-green-100 text-green-800' :
                                  insight.type === 'good' ? 'bg-blue-100 text-blue-800' :
                                  insight.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                  insight.type === 'danger' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {insight.action}
                                </span>
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Analytics Data</h3>
              <p className="text-gray-600">Unable to load analytics data. Please try again later.</p>
              <button
                onClick={fetchAnalyticsData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;