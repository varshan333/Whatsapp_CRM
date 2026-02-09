import Link from "next/link";
import {
  MessageCircle,
  Zap,
  Users,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Unified Dashboard",
    description: "Manage all your WhatsApp conversations in one centralized place",
  },
  {
    icon: Zap,
    title: "Smart Automation",
    description: "Set up powerful workflows without writing a single line of code",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Assign conversations and work seamlessly with your team",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Gain deep insights into customer interactions and performance",
  },
];

const stats = [
  { value: "500+", label: "Active Customers" },
  { value: "100M+", label: "Messages Processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0F9D58] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">
              WhatsApp CRM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="bg-[#0F9D58] hover:bg-[#0D7F48] text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900">
            Automate Your Customer Conversations
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Manage all your WhatsApp communications with our enterprise-grade CRM
            platform. Streamline workflows, enhance customer relationships, and
            scale your business effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/auth/signup"
              aria-label="Get started with WhatsApp CRM"
              className="inline-flex items-center justify-center gap-2 bg-[#0F9D58] hover:bg-[#0D7F48] text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Get started free
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-[#0F9D58] text-slate-700 hover:text-[#0F9D58] font-semibold px-8 py-4 rounded-lg transition-all"
            >
              Sign in
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="text-sm text-slate-600">
            Trusted by 500+ businesses worldwide
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-lg text-slate-600 mt-4">
              Everything you need to manage customer conversations at scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex gap-4 p-6 rounded-xl border border-slate-200 hover:border-[#0F9D58] hover:bg-[#0F9D58]/5 transition"
                >
                  <div className="w-12 h-12 bg-[#0F9D58]/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#0F9D58]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-3xl font-bold text-[#0F9D58]">
                {stat.value}
              </div>
              <div className="text-slate-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Ready to transform your team?
          </h2>
          <p className="text-lg text-slate-600">
            Start managing your WhatsApp conversations more efficiently today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-[#0F9D58] hover:bg-[#0D7F48] text-white font-semibold px-8 py-3 rounded-lg transition-all"
            >
              View Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/inbox"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#0F9D58] text-[#0F9D58] hover:bg-[#0F9D58]/5 font-semibold px-8 py-3 rounded-lg transition-all"
            >
              Team Inbox
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 text-center">
        <p className="text-sm">
          © 2026 WhatsApp CRM. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
