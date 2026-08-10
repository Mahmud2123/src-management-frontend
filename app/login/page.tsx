// app/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/auth';
import { Button } from '@/components/Button';
import { UniversityBranding } from '@/components/UniversityBranding';
import { toast } from 'sonner';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, XCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const redirect = searchParams.get('redirect') || '/dashboard';
  const sessionExpired = searchParams.get('session') === 'expired';
  const unauthorized = searchParams.get('unauthorized') === 'true';

  useEffect(() => {
    if (sessionExpired) {
      toast.error('Session Expired', {
        description: 'Please log in again to continue.',
        duration: 4000,
      });
    }
    if (unauthorized) {
      toast.error('Unauthorized Access', {
        description: 'Please log in to access this page.',
        duration: 4000,
      });
    }
  }, [sessionExpired, unauthorized]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, loading, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setFieldErrors({});
    
    if (!email.trim()) {
      const msg = 'Please enter your email address.';
      setFieldErrors({ email: msg });
      toast.error('Validation Error', { description: msg, duration: 3000 });
      return;
    }
    
    if (!password) {
      const msg = 'Please enter your password.';
      setFieldErrors({ password: msg });
      toast.error('Validation Error', { description: msg, duration: 3000 });
      return;
    }
    
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Login successful - toast is handled in auth provider
    } catch (err: any) {
      // ✅ Get the error message from the thrown error
      const errorMessage = err?.message || 'Invalid email or password. Please try again.';
      
      // ✅ Show toast error
      toast.error('Login Failed', {
        description: errorMessage,
        duration: 5000,
        icon: <XCircle className="w-5 h-5 text-red-500" />,
      });
      
      // ✅ Set inline error
      setError(errorMessage);
      
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-950">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto" />
          <p className="text-green-200 mt-4 font-medium text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-950">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-80 sm:h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:w-80 sm:h-80 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-green-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden mb-6 sm:mb-10 text-center">
            <UniversityBranding variant="compact" className="justify-center text-white" />
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 md:p-12">
            {/* Branding Icon */}
            <div className="mb-6 sm:mb-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg shadow-green-500/30">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 sm:mb-2">Welcome Back</h3>
              <p className="text-sm sm:text-lg text-gray-600 font-medium">Sign in to your account</p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-2">
                Sa'adu Zungur University • Bauchi, Nigeria
              </p>
            </div>

           
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Email Input */}
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none z-10" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="name@student.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors({ ...fieldErrors, email: undefined });
                        setError('');
                      }
                    }}
                    required
                    className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50 border-2 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all duration-200 text-gray-900 text-sm sm:text-base font-medium placeholder:text-gray-400 ${
                      fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none z-10" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors({ ...fieldErrors, password: undefined });
                        setError('');
                      }
                    }}
                    required
                    className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-gray-50 border-2 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all duration-200 text-gray-900 text-sm sm:text-base font-medium placeholder:text-gray-400 ${
                      fieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Remember & Forgot Password */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pt-1 sm:pt-2">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-gray-600 font-medium group-hover:text-gray-900">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/auth/forgot-password')}
                  className="text-xs sm:text-sm font-bold text-green-700 hover:text-green-800 hover:underline transition-all"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3.5 sm:py-4 rounded-xl shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm sm:text-base">Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm sm:text-base">Sign In</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
              <p className="text-center text-xs sm:text-sm text-gray-500">
                <span className="inline-block mr-1 text-green-600">©</span>
                {new Date().getFullYear()} Sa'adu Zungur University
              </p>
              <p className="text-center text-[10px] sm:text-xs text-gray-400 mt-1">
                Official SAZU-SRC Portal
              </p>
            </div>
          </div>

          {/* Mobile Footer */}
          <p className="text-center mt-4 sm:mt-6 text-[10px] sm:text-xs text-green-200/70 font-medium">
            PMB 0698, Bauchi, Bauchi State, Nigeria
          </p>
        </div>
      </div>
    </div>
  );
}