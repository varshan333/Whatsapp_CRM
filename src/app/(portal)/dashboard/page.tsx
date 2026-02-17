"use client";

import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import type React from "react";
import { MainLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";

/**
 * Dashboard Page - Role-based content rendering
 *
 * Admin sees:
 * - Full overview KPIs (Messages, Response Rate, Active Conversations, Revenue)
 * - Team performance metrics
 * - Campaign analytics
 * - AI suggestions
 *
 * Agent sees:
 * - Limited KPIs (Messages, Response Rate)
 * - Basic stats only
 * - No campaign or analytics data
 */
export default function DashboardPage() {
  const { isAdmin, isAgent } = useAuth();

  return (
    <MainLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">
            {isAdmin
              ? "Complete overview of your WhatsApp CRM operations"
              : "Your inbox and activity overview"}
          </p>
        </div>

        {/* Role-based KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Messages - Visible to both Admin and Agent */}
          <KPICard
            title="Total Messages"
            value="12,453"
            change="+12.5%"
            icon={MessageSquare}
            trend="up"
          />

          {/* Response Rate - Visible to both Admin and Agent */}
          <KPICard
            title="Response Rate"
            value="94.2%"
            change="+2.3%"
            icon={TrendingUp}
            trend="up"
          />

          {/* Admin-only KPIs */}
          {isAdmin && (
            <>
              <KPICard
                title="Active Conversations"
                value="342"
                change="+18.2%"
                icon={Users}
                trend="up"
              />
              <KPICard
                title="Revenue (MTD)"
                value="$24,580"
                change="+8.1%"
                icon={Activity}
                trend="up"
              />
            </>
          )}

          {/* Agent-only simple stats */}
          {isAgent && (
            <>
              <KPICard
                title="Your Conversations"
                value="45"
                change="Today"
                icon={Users}
                trend="neutral"
              />
              <KPICard
                title="Avg Response Time"
                value="2.3m"
                change="Good"
                icon={Clock}
                trend="up"
              />
            </>
          )}
        </div>

        {/* Admin-specific sections */}
        {isAdmin && (
          <>
            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Message Trends */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Message Trends
                  </h2>
                  <BarChart3 className="w-5 h-5 text-[#0F9D58]" />
                </div>
                <div className="h-64 bg-gradient-to-br from-[#0F9D58]/5 to-blue-500/5 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">
                    Chart visualization would go here
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Quick Stats
                </h2>
                <div className="space-y-4">
                  <StatItem label="Active Campaigns" value="12" />
                  <StatItem label="Bot Automations" value="8" />
                  <StatItem label="Team Members" value="15" />
                  <StatItem label="API Calls (Today)" value="45.2K" />
                </div>
              </div>
            </div>

            {/* Recent Activity & Campaigns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  <ActivityItem
                    icon={CheckCircle2}
                    title="Campaign launched"
                    description="Summer promotion campaign"
                    time="2 hours ago"
                    color="green"
                  />
                  <ActivityItem
                    icon={AlertCircle}
                    title="High message volume"
                    description="Peak usage detected"
                    time="4 hours ago"
                    color="yellow"
                  />
                  <ActivityItem
                    icon={Users}
                    title="New team member added"
                    description="John Doe joined the team"
                    time="1 day ago"
                    color="blue"
                  />
                </div>
              </div>

              {/* Performance Overview */}
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Performance Overview
                </h2>
                <div className="space-y-4">
                  <PerformanceBar label="Team Productivity" percentage={85} />
                  <PerformanceBar
                    label="Message Delivery Rate"
                    percentage={98}
                  />
                  <PerformanceBar
                    label="Customer Satisfaction"
                    percentage={92}
                  />
                  <PerformanceBar label="System Uptime" percentage={99.9} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Agent-specific sections */}
        {isAgent && (
          <>
            {/* Simple Agent Dashboard */}
            <div className="grid grid-cols-1 gap-6">
              {/* Inbox Summary */}
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Your Inbox Summary
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Unread</p>
                    <p className="text-2xl font-bold text-blue-600">23</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">156</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">8</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-1">Assigned</p>
                    <p className="text-2xl font-bold text-purple-600">34</p>
                  </div>
                </div>
              </div>

              {/* Today's Activity */}
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Today's Activity
                </h2>
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    • Handled 45 conversations
                  </p>
                  <p className="text-sm text-slate-600">
                    • Average response time: 2.3 minutes
                  </p>
                  <p className="text-sm text-slate-600">
                    • Customer satisfaction: 4.8/5
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

// Helper Components

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: "up" | "down" | "neutral";
}

function KPICard({ title, value, change, icon: Icon, trend }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-[#0F9D58]/10 rounded-lg p-3">
          <Icon className="w-6 h-6 text-[#0F9D58]" />
        </div>
        {trend === "up" && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
            {change}
          </span>
        )}
        {trend === "down" && (
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
            {change}
          </span>
        )}
        {trend === "neutral" && (
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded">
            {change}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

interface ActivityItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  time: string;
  color: "green" | "yellow" | "blue";
}

function ActivityItem({
  icon: Icon,
  title,
  description,
  time,
  color,
}: ActivityItemProps) {
  const colorClasses = {
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="flex gap-3">
      <div className={`${colorClasses[color]} rounded-lg p-2 h-fit`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 text-sm">{title}</p>
        <p className="text-xs text-slate-500 mb-1">{description}</p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
}

interface PerformanceBarProps {
  label: string;
  percentage: number;
}

function PerformanceBar({ label, percentage }: PerformanceBarProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-900">{label}</span>
        <span className="text-sm font-bold text-[#0F9D58]">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#0F9D58] to-green-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
