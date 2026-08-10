// app/page.tsx - Enhanced Landing Page with Professional Design
'use client';

import { useAuth } from '@/providers/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { UniversityBranding } from '@/components/UniversityBranding';
import { 
  Shield, Users, TrendingUp, ArrowRight, ChevronRight, 
  GraduationCap, MapPin, Mail, Phone, BookOpen, 
  Award, Heart, Sparkles, Building2, Globe, 
  Clock, CheckCircle, FileText, MessageSquare,
  ChevronDown, Menu, X
} from 'lucide-react';

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading || (isAuthenticated && user)) {
    return null;
  }

  const features = [
    { 
      icon: Shield, 
      title: 'Secure & Private', 
      description: 'Enterprise-grade security protecting your data',
      color: 'from-blue-500/20 to-blue-600/20'
    },
    { 
      icon: Users, 
      title: 'Community Driven', 
      description: 'Powered by SRC for student welfare',
      color: 'from-green-500/20 to-green-600/20'
    },
    { 
      icon: TrendingUp, 
      title: 'Real-time Tracking', 
      description: 'Monitor submissions every step of the way',
      color: 'from-purple-500/20 to-purple-600/20'
    },
  ];

  const stats = [
    { icon: GraduationCap, value: '5,000+', label: 'Students' },
    { icon: BookOpen, value: '9', label: 'Faculties' },
    { icon: CheckCircle, value: '98%', label: 'Satisfaction' },
    { icon: Clock, value: '24/7', label: 'Support' },
  ];

  const quickLinks = [
    { icon: FileText, label: 'Submit Complaint', href: '/login' },
    { icon: MessageSquare, label: 'Track Status', href: '/login' },
    { icon: Users, label: 'SRC Members', href: '/login' },
    { icon: Award, label: 'Achievements', href: '/login' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-900/95 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <UniversityBranding variant="compact" className="text-white" />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
                Features
              </a>
              <a href="#about" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
                About
              </a>
              <a href="#contact" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
                Contact
              </a>
              <Button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/25"
              >
                Sign In
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-white/70 hover:text-white transition-colors py-2">Features</a>
              <a href="#about" className="block text-white/70 hover:text-white transition-colors py-2">About</a>
              <a href="#contact" className="block text-white/70 hover:text-white transition-colors py-2">Contact</a>
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative pt-20 sm:pt-24">
        {/* Hero Section */}
        <section className="min-h-[90vh] flex items-center justify-center px-4 sm:px-6 py-12">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400/10 backdrop-blur-sm border border-emerald-400/20 rounded-full text-emerald-200 text-sm font-medium mb-6 animate-fade-in">
              <Shield className="w-4 h-4" />
              <span>Official SAZU Student Portal</span>
            </div>

            {/* Main Title */}
            <div className="mb-8 animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                <span className="text-white">Your Voice,</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                  Our Priority
                </span>
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-100">
              The official Student Representative Council portal for Sa'adu Zungur University.
              Submit, track, and resolve complaints efficiently.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up delay-200">
              <Button
                onClick={() => router.push('/login')}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl shadow-emerald-500/25 flex items-center justify-center gap-2 text-lg transition-all hover:scale-105"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push('/login')}
                className="w-full sm:w-auto bg-white/5 backdrop-blur-md hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl border border-white/10 text-lg transition-all"
              >
                Learn More
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 hover:border-emerald-400/30"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                  <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <div className="text-white font-bold text-xl sm:text-2xl">{stat.value}</div>
                  <div className="text-white/50 text-xs sm:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section id="features" className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Quick Actions
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Get started with these common tasks
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(link.href)}
                  className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 text-left"
                >
                  <link.icon className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-1">{link.label}</h3>
                  <p className="text-white/40 text-sm">Click to continue →</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* About & Contact Section */}
        <section id="about" className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* About Card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-emerald-400/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-3">About SAZU</h3>
                    <p className="text-white/60 leading-relaxed text-sm mb-4">
                      Sa'adu Zungur University (SAZU) is a premier institution of higher learning 
                      located in Bauchi State, Nigeria, committed to academic excellence and 
                      student welfare.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3 text-white/50">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>PMB 0698, Bauchi, Bauchi State</span>
                      </div>
                      <div className="flex items-center gap-3 text-white/50">
                        <Mail className="w-4 h-4 text-emerald-400" />
                        <a href="mailto:src@sazu.edu.ng" className="hover:text-white transition-colors">
                          src@sazu.edu.ng
                        </a>
                      </div>
                      <div className="flex items-center gap-3 text-white/50">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <span>+234 (0) 800 000 0000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div id="contact" className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-400/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-3">Contact SRC</h3>
                    <p className="text-white/60 leading-relaxed text-sm mb-4">
                      Have questions or need assistance? Reach out to the Student 
                      Representative Council for support.
                    </p>
                    <div className="space-y-3">
                      <Button
                        onClick={() => window.location.href = 'mailto:src@sazu.edu.ng'}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 text-sm"
                      >
                        <Mail className="w-4 h-4 inline mr-2" />
                        Send Email
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => window.open('https://maps.google.com/?q=Sa\'adu+Zungur+University+Bauchi', '_blank')}
                        className="w-full bg-white/5 backdrop-blur-md hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-xl border border-white/10 text-sm"
                      >
                        <Globe className="w-4 h-4 inline mr-2" />
                        View on Map
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-white/50 text-sm">
                  © {new Date().getFullYear()} Sa'adu Zungur University, Bauchi, Nigeria
                </p>
                <p className="text-white/30 text-xs mt-1">
                  PMB 0698, Bauchi, Bauchi State • All Rights Reserved
                </p>
              </div>
              <div className="flex items-center gap-6 text-white/40 text-xs">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <span className="w-px h-4 bg-white/10" />
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <span className="w-px h-4 bg-white/10" />
                <a href="#" className="hover:text-white transition-colors">About SAZU</a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  );
}