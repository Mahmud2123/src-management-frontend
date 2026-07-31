'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  verifyResetTokenAPI, 
  verifyResetCodeAPI, 
  resetPasswordAPI 
} from '@/lib/api';
import { toast } from 'sonner';
import {
  Lock, Eye, EyeOff, Check, X, ArrowLeft, Shield,
  KeyRound, CheckCircle
} from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams?.get('token');

  const [step, setStep] = useState<'verify' | 'reset'>('verify');
  const [method, setMethod] = useState<'link' | 'code'>(tokenFromUrl ? 'link' : 'code');
  
  // Verification step
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  // Reset step
  const [resetToken, setResetToken] = useState(tokenFromUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Auto-verify token from URL
  useEffect(() => {
    if (tokenFromUrl) {
      verifyTokenFromUrl(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const verifyTokenFromUrl = async (token: string) => {
    setVerifying(true);
    try {
      const response = await verifyResetTokenAPI(token);
      setEmail(response.email);
      setResetToken(token);
      setStep('reset');
      toast.success('Token Verified', {
        description: 'You can now set your new password.',
      });
    } catch (err: any) {
      toast.error('Invalid Link', {
        description: err.customMessage || 'This reset link is invalid or has expired.',
      });
      setMethod('code');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);

    try {
      const response = await verifyResetCodeAPI(email, code);
      setResetToken(response.resetToken);
      setStep('reset');
      toast.success('Code Verified!', {
        description: 'You can now set your new password.',
      });
    } catch (err: any) {
      toast.error('Verification Failed', {
        description: err.customMessage || 'Invalid code or email. Please try again.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords Don\'t Match', {
        description: 'Please make sure both passwords are identical.',
      });
      return;
    }

    if (!isPasswordValid) {
      toast.error('Weak Password', {
        description: 'Please meet all password requirements.',
      });
      return;
    }

    setResetting(true);

    try {
      await resetPasswordAPI(resetToken, newPassword);
      toast.success('Password Changed!', {
        description: 'You can now login with your new password.',
        duration: 3000,
      });
      setTimeout(() => router.push('/auth'), 2000);
    } catch (err: any) {
      toast.error('Reset Failed', {
        description: err.customMessage || err.message || 'Unable to reset password. Please try again.',
      });
    } finally {
      setResetting(false);
    }
  };

  // Password validation
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;

  const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${valid ? 'text-green-600' : 'text-gray-400'}`}>
      {valid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      <span className="font-medium">{text}</span>
    </div>
  );

  if (verifying && tokenFromUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-950">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold">Verifying reset link...</p>
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
          onClick={() => step === 'reset' ? setStep('verify') : router.push('/auth')}
          className="mb-6 flex items-center gap-2 text-green-200 hover:text-white font-medium transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>{step === 'reset' ? 'Back to Verification' : 'Back to Login'}</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* STEP 1: VERIFY CODE */}
          {step === 'verify' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
                  <KeyRound className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                  Enter Reset Code
                </h1>
                <p className="text-gray-600 text-lg font-medium">
                  Check your email for the 6-digit code
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@student.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-gray-900 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-gray-900 font-bold text-2xl text-center tracking-widest"
                    style={{ fontFamily: 'monospace' }}
                  />
                  <p className="text-xs text-gray-500 text-center font-medium">
                    Enter the code from your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={verifying || code.length !== 6}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
                >
                  {verifying ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push('/auth/forgot-password')}
                  className="text-sm text-gray-600 hover:text-gray-900 font-semibold"
                >
                  Didn't receive a code? Request new one
                </button>
              </div>
            </>
          )}

          {/* STEP 2: RESET PASSWORD */}
          {step === 'reset' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl mb-4 shadow-lg shadow-green-500/30">
                  <Lock className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                  Create New Password
                </h1>
                <p className="text-gray-600 text-lg font-medium">
                  Choose a strong, secure password
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* New Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-900 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all text-gray-900 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 space-y-2">
                  <p className="text-sm font-bold text-gray-900 mb-3">Password must contain:</p>
                  <ValidationItem valid={hasMinLength} text="At least 8 characters" />
                  <ValidationItem valid={hasUpperCase} text="One uppercase letter (A-Z)" />
                  <ValidationItem valid={hasLowerCase} text="One lowercase letter (a-z)" />
                  <ValidationItem valid={hasNumber} text="One number (0-9)" />
                  <ValidationItem valid={hasSpecial} text="One special character (!@#$%...)" />
                  {confirmPassword && (
                    <ValidationItem valid={passwordsMatch} text="Passwords match" />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={resetting || !isPasswordValid || !passwordsMatch}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-lg"
                >
                  {resetting ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-green-200 font-medium">
          © 2026 Sa'adu Zungur University SRC
        </p>
      </div>
    </div>
  );
}