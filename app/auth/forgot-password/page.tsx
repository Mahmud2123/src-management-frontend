'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { forgotPasswordAPI } from '@/lib/api';
import { toast } from 'sonner';
import {
  Mail, ArrowLeft, Send, CheckCircle, AlertCircle, Shield, Sparkles
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPasswordAPI(email);
      setEmailSent(true);
      toast.success('Reset Link Sent!', {
        description: 'Check your email for password reset instructions.',
      });
    } catch (err: any) {
      toast.error('Request Failed', {
        description: err.customMessage || err.message || 'Unable to process your request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-950 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              Check Your Email!
            </h2>
            
            <p className="text-gray-600 text-lg mb-2">
              We've sent password reset instructions to:
            </p>
            
            <p className="text-green-700 font-bold text-xl mb-6">
              {email}
            </p>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-6 text-left">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                What's Next?
              </h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600">1.</span>
                  <span>Check your email inbox (and spam folder)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600">2.</span>
                  <span>Click the reset link OR use the 6-digit code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-green-600">3.</span>
                  <span>Create a new strong password</span>
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/auth/reset-password')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/40 transition-all"
              >
                I Have a Reset Code
              </button>
              
              <button
                onClick={() => router.push('/auth')}
                className="w-full text-gray-600 hover:text-gray-900 font-semibold py-3 transition-colors"
              >
                Back to Login
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Didn't receive the email? Check spam or try again in a few minutes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-950 px-4 py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => router.push('/auth')}
          className="mb-6 flex items-center gap-2 text-green-200 hover:text-white font-medium transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Login</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Icon Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl mb-4 shadow-lg shadow-green-500/30">
              <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              No worries! We'll send you reset instructions.
            </p>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">You'll receive two options:</p>
              <ul className="text-xs space-y-1 text-blue-800">
                <li>• A clickable reset link</li>
                <li>• A 6-digit verification code</li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                 Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors pointer-events-none z-10" />
                <input
                  type="email"
                  placeholder="name@student.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                />
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Enter the email address associated with your account
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Reset Instructions</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-900 mb-1">Secure Process</p>
                <p className="text-xs">
                  Reset links expire in 15 minutes for your security. 
                  If you don't receive an email, check your spam folder.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-green-200 font-medium">
          © 2026 Sa'adu Zungur University SRC
        </p>
      </div>
    </div>
  );
}