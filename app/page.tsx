// app/page.tsx - Enhanced Landing Page with Rich Content
'use client';

import { useAuth } from '@/providers/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/Button';
import { UniversityBranding } from '@/components/UniversityBranding';
import { 
  Shield, Users, TrendingUp, ArrowRight, ChevronRight, 
  GraduationCap, MapPin, Mail, Phone, BookOpen, 
  Award, Heart, Sparkles, Building2, Globe
} from 'lucide-react';

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  // If loading or authenticated (redirecting), show nothing
  if (loading || (isAuthenticated && user)) {
    return null;
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-950 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-80 sm:h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:w-80 sm:h-80 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-green-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <UniversityBranding variant="compact" className="text-white" />
          <Button
            onClick={() => router.push('/login')}
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold px-4 sm:px-6 py-2 rounded-xl sm:rounded-2xl border border-white/20 transition-all text-sm sm:text-base"
          >
            Sign In
          </Button>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-6 sm:mb-8">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-400/10 backdrop-blur-sm border border-green-400/20 rounded-full text-green-200 text-xs sm:text-sm font-medium">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                Official SAZU Student Portal
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight mb-4 sm:mb-6">
              Your Voice,{' '}
              <span className="text-green-300">Our Priority</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-green-100 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2">
              The official Student Representative Council portal for Sa'adu Zungur University. 
              Submit, track, and resolve complaints efficiently.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16">
              <Button
                onClick={() => router.push('/login')}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                Get Started
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push('/login')}
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/20 text-base sm:text-lg"
              >
                Login
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto px-2 mb-12 sm:mb-16">
              {[
                { icon: Shield, title: 'Secure & Private', description: 'Your data is protected with enterprise-grade security' },
                { icon: Users, title: 'Community Driven', description: 'Powered by the SRC for student welfare' },
                { icon: TrendingUp, title: 'Real-time Tracking', description: 'Monitor your submissions every step of the way' },
              ].map((feature, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-green-400/30 transition-colors">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-200" />
                  </div>
                  <h3 className="text-white font-bold text-base sm:text-lg mb-1 sm:mb-2">{feature.title}</h3>
                  <p className="text-green-200 text-xs sm:text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Location & Info Cards - New Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto px-2">
              {/* University Location Card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-white/10 text-left hover:bg-white/10 transition-all">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-200" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base sm:text-lg mb-1">📍 Our Location</h3>
                    <p className="text-green-100 text-sm leading-relaxed">
                      Sa'adu Zungur University<br className="hidden sm:block" />
                      PMB 0698, Bauchi,<br />
                      Bauchi State, Nigeria
                    </p>
                    <a 
                      href="https://maps.google.com/?q=Sa'adu+Zungur+University+Bauchi" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-green-300 hover:text-green-200 text-sm font-medium transition-colors"
                    >
                      <Globe className="w-3 h-3" />
                      View on Google Maps
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact & Support Card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-white/10 text-left hover:bg-white/10 transition-all">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-green-200" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base sm:text-lg mb-1">📧 Contact SRC</h3>
                    <p className="text-green-100 text-sm leading-relaxed">
                      For inquiries and support:
                    </p>
                    <a 
                      href="mailto:src@sazu.edu.ng" 
                      className="text-green-300 hover:text-green-200 font-medium text-sm transition-colors block mt-1"
                    >
                      src@sazu.edu.ng
                    </a>
                    <p className="text-green-200/70 text-xs mt-2">
                      <Phone className="w-3 h-3 inline mr-1" />
                      +234 (0) 800 000 0000
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats/Info Banner */}
            <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-4">
              <div className="flex items-center gap-2 text-green-200/80">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-green-300" />
                <span className="text-xs sm:text-sm">Est. 2020</span>
              </div>
              <div className="flex items-center gap-2 text-green-200/80">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-300" />
                <span className="text-xs sm:text-sm">5,000+ Students</span>
              </div>
              <div className="flex items-center gap-2 text-green-200/80">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-300" />
                <span className="text-xs sm:text-sm">9 Faculties</span>
              </div>
              <div className="flex items-center gap-2 text-green-200/80">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-300" />
                <span className="text-xs sm:text-sm">Accredited</span>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 px-4">
              <p className="text-green-200/70 text-xs sm:text-sm">
                <span className="inline-block mr-1">©</span>
                {new Date().getFullYear()} Sa'adu Zungur University, Bauchi, Nigeria
              </p>
              <p className="text-green-200/50 text-[10px] sm:text-xs mt-1">
                PMB 0698, Bauchi, Bauchi State, Nigeria • All Rights Reserved
              </p>
              <div className="flex items-center justify-center gap-4 mt-3 text-green-200/40 text-[10px] sm:text-xs">
                <span>Privacy Policy</span>
                <span className="w-px h-3 bg-green-200/20" />
                <span>Terms of Service</span>
                <span className="w-px h-3 bg-green-200/20" />
                <span>About SAZU</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}