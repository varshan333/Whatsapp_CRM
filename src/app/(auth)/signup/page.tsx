"use client";

import {
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeToTerms?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, _setIsSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          agreeToTerms: formData.agreeToTerms,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || res.statusText || "Signup failed");
      }
      // On success redirect to dashboard
      window.location.href = "/dashboard";
    } catch (_error) {
      setErrors({ email: "Signup failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (field: string) => {
    return touched[field] ? errors[field as keyof typeof errors] : undefined;
  };

  const passwordStrength = (() => {
    if (!formData.password) return 0;
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(formData.password)) strength++;
    if (/(?=.*[A-Z])/.test(formData.password)) strength++;
    if (/(?=.*\d)/.test(formData.password)) strength++;
    return strength;
  })();

  const passwordStrengthText = [
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Very Strong",
  ];
  const passwordStrengthColor = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-[#0F9D58]",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10">
          {!isSubmitted ? (
            <>
              {/* Form header */}
              <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                  Get started
                </h1>
                <p className="text-slate-600">
                  Create your WhatsApp CRM account and start automating today
                </p>
              </div>

              {/* Signup form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full name input */}
                <div className="space-y-2">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={() => handleBlur("fullName")}
                      placeholder="John Doe"
                      className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-lg transition-all duration-200 font-medium placeholder:text-slate-400 focus:outline-none ${
                        getFieldError("fullName")
                          ? "border-red-300 bg-red-50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-slate-200 focus:bg-white focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]/20"
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {getFieldError("fullName") && (
                    <p className="text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

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
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur("email")}
                      placeholder="you@company.com"
                      className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-lg transition-all duration-200 font-medium placeholder:text-slate-400 focus:outline-none ${
                        getFieldError("email")
                          ? "border-red-300 bg-red-50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-slate-200 focus:bg-white focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]/20"
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {getFieldError("email") && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password input */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur("password")}
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-12 py-3 bg-slate-50 border rounded-lg transition-all duration-200 font-medium placeholder:text-slate-400 focus:outline-none ${
                        getFieldError("password")
                          ? "border-red-300 bg-red-50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-slate-200 focus:bg-white focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]/20"
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      disabled={isLoading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            // biome-ignore lint/suspicious/noArrayIndexKey: <fast refactor - can be implemented later>
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i < passwordStrength
                                ? passwordStrengthColor[passwordStrength - 1]
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600">
                        Strength:{" "}
                        <span className="font-medium">
                          {passwordStrengthText[passwordStrength - 1]}
                        </span>
                      </p>
                    </div>
                  )}

                  {getFieldError("password") && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm password input */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => handleBlur("confirmPassword")}
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-12 py-3 bg-slate-50 border rounded-lg transition-all duration-200 font-medium placeholder:text-slate-400 focus:outline-none ${
                        getFieldError("confirmPassword")
                          ? "border-red-300 bg-red-50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-slate-200 focus:bg-white focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]/20"
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      disabled={isLoading}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {getFieldError("confirmPassword") && (
                    <p className="text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Terms checkbox */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <input
                      id="agreeToTerms"
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      onBlur={() => handleBlur("agreeToTerms")}
                      className={`mt-1 w-5 h-5 rounded border-2 transition-colors cursor-pointer ${
                        getFieldError("agreeToTerms")
                          ? "border-red-500 bg-red-50"
                          : "border-slate-300 checked:bg-[#0F9D58] checked:border-[#0F9D58]"
                      }`}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="text-sm text-slate-600 cursor-pointer"
                    >
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-[#0F9D58] hover:underline font-medium"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-[#0F9D58] hover:underline font-medium"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {getFieldError("agreeToTerms") && (
                    <p className="text-sm text-red-600">
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0F9D58] hover:bg-[#0D7F48] active:bg-[#0A5C36] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed mt-6"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Login link */}
              <p className="text-center text-sm text-slate-600 mt-6">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-[#0F9D58] hover:text-[#0D7F48] font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
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
                    Welcome, {formData.fullName}!
                  </h2>
                  <p className="text-slate-600">
                    Your account has been created successfully. We've sent a
                    confirmation email to{" "}
                    <span className="font-medium text-slate-900">
                      {formData.email}
                    </span>
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-2">
                  <p className="text-sm font-medium text-blue-900">
                    Next steps:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Check your email and confirm your account</li>
                    <li>• Set up your first WhatsApp connection</li>
                    <li>• Invite your team members</li>
                  </ul>
                </div>

                <Link
                  href="/auth/login"
                  className="inline-flex w-full items-center justify-center gap-2 bg-[#0F9D58] hover:bg-[#0D7F48] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Go to sign in
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          )}

          {/* Footer text */}
          <p className="text-center text-xs text-slate-500 mt-8">
            Need help?{" "}
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
