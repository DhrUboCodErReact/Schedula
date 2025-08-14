/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
'use client'
import { useState, useEffect, JSX } from 'react'
import { CalendarCheck2, Clock3, Stethoscope, Users, Hospital, ShieldCheck, Star, Phone, Mail, MapPin, ChevronDown, Menu, X, Play, Award, Globe, Smartphone, Heart, Brain, Eye, Bone, Baby, UserCheck, AlertCircle, CheckCircle, ArrowRight, Download, CreditCard, Lock, Zap, MessageCircle, Video, FileText, Calendar, Shield, Headphones, Search, Filter, MapPin as Location } from 'lucide-react'

// Type definitions
interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  text: string;
  rating: number;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular: boolean;
  color: string;
}

interface Specialty {
  id: string;
  name: string;
  icon: JSX.Element;
  doctorCount: number;
  description: string;
}

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon: JSX.Element;
}

interface Stats {
  doctors: number;
  patients: number;
  appointments: number;
  hospitals: number;
}

export default function SchedulaHealthLanding() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState('premium')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [isVisible, setIsVisible] = useState(false)

  // Dynamic stats - these would come from API
  const [stats, setStats] = useState<Stats>({
    doctors: 0,
    patients: 0,
    appointments: 0,
    hospitals: 0
  })

  // Dynamic testimonials - these would come from API
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  // Dynamic pricing plans - these would come from API
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])

  // Dynamic specialties - these would come from API
  const [specialties, setSpecialties] = useState<Specialty[]>([])

  // Dynamic features - these would come from API
  const [features, setFeatures] = useState<Feature[]>([])

  // Dynamic FAQ data - these would come from API
  const [faqData, setFaqData] = useState<FAQ[]>([])

  // Dynamic team members - these would come from API
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  // Dynamic process steps - these would come from API
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([])

  useEffect(() => {
    setIsVisible(true)
    
    // Simulate API calls to load dynamic data
    loadDynamicData()
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      if (testimonials.length > 0) {
        setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  const loadDynamicData = async () => {
    // In a real app, these would be API calls
    // For now, we'll simulate loading data

    // Load stats
    setStats({
      doctors: 2500,
      patients: 1200000,
      appointments: 150000,
      hospitals: 150
    })

    // Load testimonials
    setTestimonials([
      {
        id: 1,
        name: "Dr. Anjali Sharma",
        role: "Cardiologist at AIIMS Delhi",
        image: "https://tse3.mm.bing.net/th/id/OIP.6lC6Yk0OD4Kw8otd01kzyQHaFF?pid=Api&P=0&h=180",
        text: "Schedula Health has completely transformed how I manage my practice. The scheduling system is incredibly intuitive, and my patients love the convenience of booking online.",
        rating: 5
      },
      {
        id: 2,
        name: "Rahul Gupta",
        role: "Software Engineer, Patient",
        image: "https://images.unsplash.com/photo-1557862921-37829c790f19?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFufGVufDB8fDB8fHww",
        text: "As someone with a busy schedule, Schedula Health has been a lifesaver. I can book appointments at odd hours and get reminders.",
        rating: 5
      },
      {
        id: 3,
        name: "Dr. Priya Patel",
        role: "Pediatrician",
        image: "https://tse3.mm.bing.net/th/id/OIP.os7uM5TJXlUufJbHt9t7UAHaHa?pid=Api&P=0&h=180",
        text: "The security features give me complete confidence when handling patient data. The platform is HIPAA compliant and the support team is always responsive.",
        rating: 5
      },
      {
        id: 4,
        name: "Meera Singh",
        role: "Working Mother",
        image: "https://tse3.mm.bing.net/th/id/OIP.7HrgLEYmiAmdp_KoUmg7jwHaHa?pid=Api&P=0&h=180",
        text: "Managing my family's health appointments used to be chaotic. Now with the family plan, I can track everyone's health and book appointments for my kids.",
        rating: 5
      }
    ])

    // Load pricing plans
    setPricingPlans([
      {
        id: 'basic',
        name: "Basic",
        price: "₹0",
        period: "Free Forever",
        features: [
          "Book up to 3 appointments per month",
          "Basic health reminders",
          "Access to general physicians",
          "Standard email support",
          "Basic prescription management"
        ],
        popular: false,
        color: "gray"
      },
      {
        id: 'premium',
        name: "Premium",
        price: "₹299",
        period: "/month",
        features: [
          "Unlimited appointments",
          "Priority booking (24/7)",
          "Access to all specialists",
          "Advanced health tracking tools",
          "Video consultations",
          "Prescription management & delivery",
          "Health reports & analytics",
          "24/7 phone & chat support"
        ],
        popular: true,
        color: "blue"
      },
      {
        id: 'family',
        name: "Family Plus",
        price: "₹499",
        period: "/month",
        features: [
          "Everything in Premium",
          "Up to 6 family members",
          "Family health dashboard",
          "Dedicated pediatric specialists",
          "Emergency consultations",
          "Health insurance integration",
          "Annual health checkup reminders",
          "Dedicated account manager"
        ],
        popular: false,
        color: "purple"
      }
    ])

    // Load specialties
    setSpecialties([
      { id: 'cardiology', name: "Cardiology", icon: <Heart />, doctorCount: 85, description: "Heart and cardiovascular care" },
      { id: 'neurology', name: "Neurology", icon: <Brain />, doctorCount: 62, description: "Brain and nervous system" },
      { id: 'orthopedics', name: "Orthopedics", icon: <Bone />, doctorCount: 94, description: "Bone, joint, and muscle care" },
      { id: 'pediatrics', name: "Pediatrics", icon: <Baby />, doctorCount: 78, description: "Specialized care for children" },
      { id: 'ophthalmology', name: "Ophthalmology", icon: <Eye />, doctorCount: 45, description: "Eye care and vision health" },
      { id: 'dermatology', name: "Dermatology", icon: <UserCheck />, doctorCount: 67, description: "Skin, hair, and nail care" },
      { id: 'psychiatry', name: "Psychiatry", icon: <MessageCircle />, doctorCount: 38, description: "Mental health and wellness" },
      { id: 'gynecology', name: "Gynecology", icon: <Users />, doctorCount: 72, description: "Women's health and care" }
    ])

    // Load features
    setFeatures([
      {
        icon: <CalendarCheck2 size={40} />,
        title: "Instant Booking",
        description: "Book appointments with any doctor in just a few clicks, 24/7 availability"
      },
      {
        icon: <Video size={40} />,
        title: "Video Consultations",
        description: "Consult with doctors from the comfort of your home via secure video calls"
      },
      {
        icon: <ShieldCheck size={40} />,
        title: "Secure & Private",
        description: "Bank-level encryption ensures your medical data is always safe and private"
      },
      {
        icon: <Clock3 size={40} />,
        title: "24/7 Support",
        description: "Round-the-clock customer support and emergency consultation availability"
      },
      {
        icon: <FileText size={40} />,
        title: "Digital Prescriptions",
        description: "Get digital prescriptions with medicine delivery right to your doorstep"
      },
      {
        icon: <Users size={40} />,
        title: "Family Management",
        description: "Manage health records and appointments for your entire family in one place"
      },
      {
        icon: <Hospital size={40} />,
        title: "Top Hospitals",
        description: "Connected with India's leading hospitals and healthcare providers"
      },
      {
        icon: <Headphones size={40} />,
        title: "Multi-language Support",
        description: "Available in 15+ Indian languages for better accessibility"
      }
    ])

    // Load FAQ data
    setFaqData([
      {
        question: "How do I book an appointment?",
        answer: "Simply select your preferred doctor, choose an available time slot, and confirm your booking. You'll receive instant confirmation via SMS and email."
      },
      {
        question: "Are video consultations secure?",
        answer: "Yes, all video consultations use end-to-end encryption and are HIPAA compliant. Your privacy and data security are our top priorities."
      },
      {
        question: "Can I cancel or reschedule appointments?",
        answer: "You can cancel or reschedule appointments up to 2 hours before the scheduled time through the app or website without any charges."
      },
      {
        question: "Do you accept health insurance?",
        answer: "We work with most major health insurance providers. You can check if your insurance is accepted during the booking process."
      },
      {
        question: "What if I need emergency care?",
        answer: "For medical emergencies, please call 102 or visit your nearest emergency room. Our platform is designed for scheduled consultations and non-emergency care."
      },
      {
        question: "How do I get my prescriptions?",
        answer: "Digital prescriptions are automatically generated after your consultation. You can choose to have medicines delivered to your home or pick them up from partner pharmacies."
      }
    ])

    // Load team members
    setTeamMembers([
      {
        name: "Dr. Rajesh Kumar",
        role: "Chief Medical Officer",
        image: "https://img.freepik.com/premium-photo/happy-man-ai-generated-portrait-user-profile_1119669-1.jpg?w=2000",
        bio: "20+ years in healthcare management"
      },
      {
        name: "Priya Sharma",
        role: "Head of Technology",
        image: "https://img.freepik.com/premium-photo/young-smart-indian-businesswoman-smiling-face-standing-blur-background-creative-colorful-office-interior-design-generative-ai-aig20_31965-142318.jpg",
        bio: "Former Google engineer, health tech expert"
      },
      {
        name: "Dr. Amit Verma",
        role: "Head of Medical Affairs",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1hbGUlMjBwcm9maWxlfGVufDB8fDB8fHww",
        bio: "Specialized in telemedicine and digital health"
      },
      {
        name: "Sneha Patel",
        role: "VP of Operations",
        image: "https://static.vecteezy.com/system/resources/previews/024/354/297/non_2x/business-woman-isolated-illustration-ai-generative-free-photo.jpg",
        bio: "Healthcare operations and patient experience"
      }
    ])

    // Load process steps
    setProcessSteps([
      {
        step: 1,
        title: "Choose Your Doctor",
        description: "Browse through our verified doctors and select based on specialty, ratings, and availability",
        icon: <Search />
      },
      {
        step: 2,
        title: "Book Appointment",
        description: "Select your preferred time slot and book instantly with just a few clicks",
        icon: <Calendar />
      },
      {
        step: 3,
        title: "Attend Consultation",
        description: "Join your video call or visit the clinic at your scheduled time",
        icon: <Video />
      },
      {
        step: 4,
        title: "Get Treatment",
        description: "Receive digital prescriptions and follow-up care recommendations",
        icon: <FileText />
      }
    ])
  }

  const handleBookAppointment = () => {
    window.location.href = 'http://localhost:3000/register'
  }

  const handleSubscribe = (planId: string) => {
    // For now, just show an alert - in a real app, this would handle plan selection
    alert(`Plan ${planId} selected! This would normally redirect to payment or account setup.`)
    setSelectedPlan(planId)
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star size={16} />
                Trusted by {stats.patients > 0 ? (stats.patients/1000000).toFixed(1) : '1'}M+ Indians
              </div>
              <h1 className="text-5xl font-bold text-blue-800 mb-6 leading-tight">
                Your Health, <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Our Priority</span>
              </h1>
              <p className="text-xl mb-8 text-gray-600 leading-relaxed">
                Book appointments with India's top doctors instantly. Get quality healthcare from the comfort of your home with our secure, user-friendly platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={handleBookAppointment}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-lg shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-[1.02] transform group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                  <CalendarCheck2 size={20} className="relative z-10" />
                  <span className="relative z-10">Book Appointment Now</span>
                </button>
                <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 text-lg flex items-center gap-2 hover:scale-[1.02] transform group relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-600/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                  <Play size={20} className="relative z-10" />
                  <span className="relative z-10">Watch Demo</span>
                </button>
              </div>
              
              {/* Login CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a 
                  href="http://localhost:3000/login"
                  className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transform overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                  <div className="relative z-10 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <UserCheck size={18} />
                  </div>
                  <div className="relative z-10 text-left">
                    <div className="text-sm font-medium opacity-90">Patient Portal</div>
                    <div className="text-lg font-bold">Login as User</div>
                  </div>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
                
                <a 
                  href="http://localhost:3000/doctor/login"
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transform overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                  <div className="relative z-10 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Stethoscope size={18} />
                  </div>
                  <div className="relative z-10 text-left">
                    <div className="text-sm font-medium opacity-90">Medical Portal</div>
                    <div className="text-lg font-bold">Login as Doctor</div>
                  </div>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </div>
              
              <div className="grid grid-cols-4 gap-4 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 hover:scale-110 transition-transform cursor-pointer">{stats.doctors > 0 ? stats.doctors.toLocaleString() : '0'}+</div>
                  <div className="text-gray-600 text-sm">Doctors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 hover:scale-110 transition-transform cursor-pointer">{stats.patients > 0 ? (stats.patients / 1000000).toFixed(1) : '0'}M+</div>
                  <div className="text-gray-600 text-sm">Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 hover:scale-110 transition-transform cursor-pointer">{stats.appointments > 0 ? (stats.appointments / 1000).toFixed(0) : '0'}K+</div>
                  <div className="text-gray-600 text-sm">Appointments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 hover:scale-110 transition-transform cursor-pointer">{stats.hospitals}+</div>
                  <div className="text-gray-600 text-sm">Hospitals</div>
                </div>
              </div>
            </div>
            
            <div className={`flex justify-center relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-shadow duration-500">
                  <div className="w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl flex items-center justify-center hover:rotate-3 transition-transform duration-500">
                    <Hospital size={100} className="text-blue-700" />
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-xl border-4 border-blue-100 hover:scale-110 transition-transform duration-300">
                  <Stethoscope size={32} className="text-blue-600" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-4 shadow-xl border-4 border-blue-100 hover:scale-110 transition-transform duration-300">
                  <CalendarCheck2 size={32} className="text-blue-600" />
                </div>
                <div className="absolute top-1/2 -left-8 bg-white rounded-full p-3 shadow-xl border-4 border-green-100 hover:scale-110 transition-transform duration-300">
                  <Video size={24} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-800 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting healthcare has never been easier. Follow these simple steps to book your appointment.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center group hover:scale-108 transition-all duration-300 relative">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto group-hover:bg-blue-700 transition-colors duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                    {step.step}
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className=""></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-blue-700 mb-3 group-hover:text-blue-800 transition-colors">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-800 mb-4">Why Choose Schedula Health?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive healthcare solutions with cutting-edge technology and compassionate care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
                <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-blue-700 mb-3 group-hover:text-blue-800 transition-colors">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-800 mb-4">Medical Specialties</h2>
            <p className="text-xl text-gray-600 mb-8">
              Access specialists across all major medical fields with verified credentials
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button 
                onClick={() => setSelectedSpecialty('all')}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                  selectedSpecialty === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Specialties
              </button>
              {specialties.slice(0, 4).map((specialty) => (
                <button 
                  key={specialty.id}
                  onClick={() => setSelectedSpecialty(specialty.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                    selectedSpecialty === specialty.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {specialties.map((specialty, index) => (
              <div key={specialty.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
                <div className="text-blue-600 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">{specialty.icon}</div>
                <h3 className="text-lg font-semibold text-blue-700 mb-2 group-hover:text-blue-800 transition-colors">{specialty.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{specialty.description}</p>
                <div className="text-blue-600 font-medium text-sm">{specialty.doctorCount} doctors available</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-blue-800 mb-4">What Our Users Say</h2>
              <p className="text-xl text-gray-600">
                Real experiences from doctors and patients who trust us with their healthcare needs
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonials[activeTestimonial]?.rating || 5)].map((_, i) => (
                      <Star key={i} size={24} className="text-yellow-400 fill-current hover:scale-110 transition-transform duration-300" />
                    ))}
                  </div>
                  <blockquote className="text-xl text-gray-700 mb-8 italic transition-all duration-500">
                    "{testimonials[activeTestimonial]?.text}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={testimonials[activeTestimonial]?.image}
                      alt={testimonials[activeTestimonial]?.name}
                      className="w-16 h-16 rounded-full border-4 border-blue-100 hover:scale-110 transition-transform duration-300"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-blue-800 text-lg">
                        {testimonials[activeTestimonial]?.name}
                      </div>
                      <div className="text-gray-600">
                        {testimonials[activeTestimonial]?.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8 gap-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 hover:scale-125 ${
                      index === activeTestimonial ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      {pricingPlans.length > 0 && (
        <section id="pricing" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-blue-800 mb-4">Choose Your Plan</h2>
              <p className="text-xl text-gray-600 mb-8">
                Flexible pricing options designed to suit your healthcare needs and budget
              </p>
              <div className="inline-flex items-center bg-blue-50 rounded-lg p-1">
                <button className="px-6 py-2 bg-white rounded-md shadow-sm font-medium text-blue-700 hover:scale-105 transition-transform duration-300">Monthly</button>
                <button className="px-6 py-2 font-medium text-gray-700 hover:scale-105 transition-transform duration-300">Yearly (Save 20%)</button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <div 
                  key={plan.id} 
                  className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group ${
                    plan.popular ? 'border-blue-500 scale-105' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-blue-800 mb-2 group-hover:text-blue-900 transition-colors">{plan.name}</h3>
                    <div className="text-4xl font-bold text-blue-700 mb-1 group-hover:scale-110 transition-transform duration-300">{plan.price}</div>
                    <div className="text-gray-600">{plan.period}</div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 transform ${
                      plan.popular 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' 
                        : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:shadow-md'
                    }`}
                  >
                    {plan.price === "₹0" ? "Get Started Free" : `Choose ${plan.name} Plan`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {teamMembers.length > 0 && (
        <section id="about" className="py-20 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-blue-800 mb-4">Meet Our Leadership Team</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our diverse team of healthcare professionals and technology experts is dedicated to revolutionizing healthcare delivery in India.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                  <div className="overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-blue-800 mb-1 group-hover:text-blue-900 transition-colors">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqData.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-blue-800 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">
                Get answers to the most common questions about our platform and services
              </p>
            </div>

            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-all duration-300 group"
                  >
                    <span className="font-semibold text-blue-800 group-hover:text-blue-900">{faq.question}</span>
                    <ChevronDown 
                      size={20} 
                      className={`text-blue-600 transition-all duration-300 group-hover:scale-110 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 animate-fadeInDown">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Download App Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Download Our Mobile App</h2>
              <p className="text-xl mb-8 text-blue-100">
                Take your healthcare on the go. Book appointments, consult doctors, and manage your health records from anywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105 group">
                  <Smartphone size={24} />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </button>
                <button className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105 group">
                  <Download size={24} />
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-block bg-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                <Smartphone size={120} className="text-blue-600 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-800 mb-4">Trusted by Millions</h2>
            <p className="text-xl text-gray-600">
              Join the growing community of satisfied users who trust us with their healthcare
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-bold text-blue-700 mb-2">{stats.doctors > 0 ? stats.doctors.toLocaleString() : '0'}+</div>
              <div className="text-gray-600 text-lg">Verified Doctors</div>
              <div className="text-sm text-gray-500 mt-1">Across 50+ specialties</div>
            </div>
            <div className="text-center group hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-bold text-blue-700 mb-2">{stats.patients > 0 ? (stats.patients / 1000000).toFixed(1) : '0'}M+</div>
              <div className="text-gray-600 text-lg">Happy Patients</div>
              <div className="text-sm text-gray-500 mt-1">4.8/5 average rating</div>
            </div>
            <div className="text-center group hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-bold text-blue-700 mb-2">{stats.appointments > 0 ? (stats.appointments / 1000).toFixed(0) : '0'}K+</div>
              <div className="text-gray-600 text-lg">Appointments Booked</div>
              <div className="text-sm text-gray-500 mt-1">This month alone</div>
            </div>
            <div className="text-center group hover:scale-105 transition-all duration-300">
              <div className="text-5xl font-bold text-blue-700 mb-2">{stats.hospitals}+</div>
              <div className="text-gray-600 text-lg">Partner Hospitals</div>
              <div className="text-sm text-gray-500 mt-1">Across major cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-blue-800 mb-4">Stay Updated on Health Tips</h2>
          <p className="text-xl text-gray-600 mb-8">
            Subscribe to our newsletter for the latest health tips, medical insights, and platform updates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
            />
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No spam, unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-800 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600">
              Have questions? Our support team is here to help you 24/7
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-blue-700 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <Phone className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-700">24/7 Support Helpline</div>
                    <div className="text-gray-600">+91-1800-123-4567</div>
                    <div className="text-sm text-gray-500">Toll-free across India</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <Mail className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-700">Email Support</div>
                    <div className="text-gray-600">support@schedulahealth.com</div>
                    <div className="text-sm text-gray-500">Response within 2 hours</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <MapPin className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-700">Headquarters</div>
                    <div className="text-gray-600">Bangalore, Karnataka, India</div>
                    <div className="text-sm text-gray-500">Serving pan-India</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 group hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                    <MessageCircle className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-700">Live Chat</div>
                    <div className="text-gray-600">Available on website & app</div>
                    <div className="text-sm text-gray-500">Instant responses</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-500">
              <h3 className="text-2xl font-bold text-blue-700 mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                />
                <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md">
                  <option>Select Inquiry Type</option>
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Billing Question</option>
                  <option>Doctor Partnership</option>
                  <option>Hospital Partnership</option>
                </select>
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-md"
                ></textarea>
                <button className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}