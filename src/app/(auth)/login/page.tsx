"use client";

import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      // Call backend API
      // const res = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password }),
      // });

      // if (!res.ok) {
      //   const errorData = await res.json().catch(() => ({}));
      //   throw new Error(errorData.message || res.statusText || "Login failed");
      // }
      // Redirect to dashboard after login
      window.location.href = "/dashboard";
    } catch (error) {
      setErrors({
        email: String(
          (error as Error).message || "Login failed. Please try again.",
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const hasEmailError = touched.email && errors.email;
  const hasPasswordError = touched.password && errors.password;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl">
        {/* Main container with two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left column - Brand section */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-6">
              {/* Logo/Brand */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0F9D58] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  WhatsApp CRM
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  Automate Your Customer Conversations
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Manage all your WhatsApp communications in one powerful
                  platform. Streamline workflows, enhance customer
                  relationships, and scale your business with enterprise-grade
                  automation.
                </p>
              </div>

              {/* Feature highlights */}
              <div className="space-y-4 pt-6">
                {[
                  {
                    title: "Unified Dashboard",
                    desc: "Monitor all conversations at a glance",
                  },
                  {
                    title: "Smart Automation",
                    desc: "Set up workflows without any coding",
                  },
                  {
                    title: "Team Collaboration",
                    desc: "Assign chats and manage your team",
                  },
                  {
                    title: "Advanced Analytics",
                    desc: "Gain insights into customer interactions",
                  },
                ].map((feature) => (
                  <div key={feature.title} className="flex gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0F9D58]/10 flex items-center justify-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-[#0F9D58]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer text */}
            <div className="pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Trusted by 500+ businesses worldwide to deliver exceptional
                customer experiences.
              </p>
            </div>
          </div>

          {/* Right column - Login form */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-10">
              {/* Form header */}
              <div className="space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-slate-900">
                  Welcome back
                </h2>
                <p className="text-slate-600">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Login form */}
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
                      onBlur={() => handleBlur("email")}
                      placeholder="you@company.com"
                      className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-lg transition-all duration-200 font-medium placeholder:text-slate-400 focus:outline-none ${
                        hasEmailError
                          ? "border-red-300 bg-red-50 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-slate-200 focus:bg-white focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58]/20"
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {hasEmailError && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-900"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-[#0F9D58] hover:text-[#0F9D58]/80 transition-colors"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlur("password")}
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-12 py-3 bg-slate-50 border rounded-lg transition-all duration-200 font-medium placeholder:text-slate-400 focus:outline-none ${
                        hasPasswordError
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
                  {hasPasswordError && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0F9D58] hover:bg-[#0D7F48] active:bg-[#0A5C36] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">
                      New to WhatsApp CRM?
                    </span>
                  </div>
                </div>

                {/* Sign up link */}
                <Link
                  href="/signup"
                  className="w-full border border-slate-300 hover:border-[#0F9D58] text-slate-700 hover:text-[#0F9D58] font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Create an account
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </form>

              {/* Footer text */}
              <p className="text-center text-xs text-slate-500 mt-8">
                By signing in, you agree to our{" "}
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
              </p>
            </div>

            {/* Mobile brand info */}
            <div className="lg:hidden mt-8 text-center space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  WhatsApp CRM
                </h3>
                <p className="text-xs text-slate-600">
                  Enterprise automation platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
