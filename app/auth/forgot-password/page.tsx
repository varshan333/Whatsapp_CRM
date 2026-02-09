'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with your actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Password reset requested for:', { email });
      setIsSubmitted(true);
    } catch (error) {
      setErrors({ email: 'Failed to send reset link. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (field: 'email') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const hasEmailError = touched.email && errors.email;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10">
          {!isSubmitted ? (
            <>
              {/* Form header */}
              <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                  Reset your password
                </h1>
                <p className="text-slate-600">
                  Enter your email address and we'll send you a link to reset your
                  password.
                </p>
              </div>

              {/* Recovery form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email input */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="you@company.com"
                      className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-lg transition-all duration-200 font-medium placeholder:text-slate-400 focus:outline-none ${
                        hasEmailError
                          ? 'border-red-300 bg-red-50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-slate-200 focus:bg-white focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]/20'
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {hasEmailError && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0F9D58] hover:bg-[#0D7F48] active:bg-[#0A5C36] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>

              {/* Back to login */}
              <Link
                href="/auth/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#0F9D58] hover:text-[#0D7F48] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-[#0F9D58]/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#0F9D58]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Check your email
                  </h2>
                  <p className="text-slate-600">
                    We've sent a password reset link to{' '}
                    <span className="font-medium text-slate-900">{email}</span>
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-2">
                  <p className="text-sm font-medium text-blue-900">
                    What to expect:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Check your inbox in the next few minutes</li>
                    <li>• The link expires in 24 hours</li>
                    <li>• If you don't see the email, check your spam folder</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setEmail('');
                    setIsSubmitted(false);
                    setErrors({});
                    setTouched({});
                  }}
                  className="w-full text-[#0F9D58] hover:text-[#0D7F48] font-semibold py-3 px-4 rounded-lg transition-colors border border-[#0F9D58] hover:bg-[#0F9D58]/5"
                >
                  Send another email
                </button>

                <Link
                  href="/auth/login"
                  className="block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </>
          )}

          {/* Footer text */}
          <p className="text-center text-xs text-slate-500 mt-8">
            Need help?{' '}
            <Link
              href="/support"
              className="text-[#0F9D58] hover:underline font-medium"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
