'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Shield, Lock, Mail, GraduationCap, ArrowRight,
  Eye, EyeOff, Award, Users, TrendingUp
} from 'lucide-react';

export default function AuthPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login State
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(loginData.email, loginData.password);
      toast.success('Welcome back!', {
        description: 'Redirecting to your dashboard...',
        duration: 2000,
      });
      router.push('/dashboard');
    } catch (err: any) {
      toast.error('Authentication Failed', {
        description: err.customMessage || err.message || 'Invalid email or password. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-950">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      </div>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-16 py-12">
        <div className="max-w-lg">
          {/* Logo and Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-black/20 transform hover:scale-105 transition-transform duration-300">
                <Shield className="w-11 h-11 text-green-700" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">SRC Portal</h1>
                <p className="text-green-200 font-semibold text-lg">Sa'adu Zungur University</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-black text-white leading-tight">
                Your Voice,<br />
                <span className="text-green-300">Our Priority</span>
              </h2>
              <p className="text-xl text-green-100 leading-relaxed font-medium">
                Official platform for student concerns. Submit, track, and resolve complaints efficiently.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-4 mb-12">
            {[
              { 
                icon: GraduationCap, 
                title: 'For SZU Community',
                description: 'Students & SRC Members'
              },
              { 
                icon: Shield, 
                title: 'Secure Platform',
                description: 'Confidential & Protected'
              },
              { 
                icon: TrendingUp, 
                title: 'Real-time Tracking',
                description: 'Monitor your submissions'
              },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:bg-white/15 transition-all group">
                <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center group-hover:bg-green-400/30 transition-colors shrink-0">
                  <feature.icon className="w-6 h-6 text-green-200" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{feature.title}</h3>
                  <p className="text-green-200 text-sm font-medium">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Help Box */}
          <div className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-200" />
              </div>
              <h3 className="text-white font-bold text-lg">Need Help?</h3>
            </div>
            <p className="text-green-100 text-sm leading-relaxed">
              Contact SRC Office at{' '}
              <a href="mailto:src@szu.edu.ng" className="text-green-300 font-bold hover:text-green-200 underline">
                src@szu.edu.ng
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 text-center">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-black/30">
                <Shield className="w-11 h-11 text-green-700" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">SRC Portal</h1>
                <p className="text-green-200 font-semibold">Sa'adu Zungur University</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 backdrop-blur-xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl mb-4 shadow-lg shadow-green-500/30">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-2">
                Welcome Back
              </h3>
              <p className="text-gray-600 text-lg font-medium">
                Sign in to access your account
              </p>
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  University Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none z-10" />
                  <input
                    type="email"
                    placeholder="name@student.szu.edu.ng"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer" 
                  />
                  <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900">
                    Remember me
                  </span>
                </label>
                <button 
                  type="button" 
                  className="text-sm font-bold text-green-700 hover:text-green-800 hover:underline transition-all"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                <Award className="w-4 h-4 inline mr-1 text-green-600" />
                Official SZU SRC Portal
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center mt-8 text-sm text-green-200 font-medium">
            © 2026 Sa'adu Zungur University SRC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}