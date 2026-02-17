"use client";

import {
  BarChart3,
  Home,
  Lightbulb,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { type UserRole, useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { role, userName, isAdmin, isAgent, setRole } = useAuth();

  /**
   * Menu items configuration based on role
   * Admin: Full access to all features
   * Agent: Limited access to inbox and basic stats only
   */
  const navigationItems: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    allowedRoles: UserRole[];
  }> = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Home,
      allowedRoles: ["Admin", "Agent"],
    },
    {
      label: "Team Inbox",
      href: "/inbox",
      icon: MessageSquare,
      allowedRoles: ["Admin", "Agent"],
    },
    {
      label: "Campaigns",
      href: "/campaigns",
      icon: Zap,
      allowedRoles: ["Admin"],
    },
    {
      label: "Bot Configuration",
      href: "/bot-config",
      icon: Settings,
      allowedRoles: ["Admin"],
    },
    {
      label: "AI Suggestions",
      href: "/ai-suggestions",
      icon: Lightbulb,
      allowedRoles: ["Admin"],
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      allowedRoles: ["Admin"],
    },
  ];

  // Filter menu items based on user role
  const visibleItems = navigationItems.filter((item) =>
    item.allowedRoles.includes(role),
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-lg border border-slate-200 p-2 hover:bg-slate-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-slate-900" />
        ) : (
          <Menu className="w-5 h-5 text-slate-900" />
        )}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative
          left-0 top-0
          h-screen
          w-64
          z-40
          bg-white
          border-r border-slate-200
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F9D58] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-900">WhatsApp CRM</h1>
              <p className="text-xs text-slate-500 capitalize">{role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="
                    flex items-center gap-3
                    px-4 py-3
                    rounded-lg
                    text-slate-700
                    hover:bg-[#0F9D58]/10
                    hover:text-[#0F9D58]
                    transition-colors duration-200
                    group
                  "
                >
                  <Icon className="w-5 h-5 group-hover:text-[#0F9D58]" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Role Badge with Toggle */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-3 px-4">Switch Role</p>
            <div className="px-2 space-y-2">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => setRole("Admin")}
                className={`
                  w-full px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${
                    isAdmin
                      ? "bg-[#0F9D58] text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }
                `}
              >
                👤 Admin
              </button>

              {/* Agent Button */}
              <button
                type="button"
                onClick={() => setRole("Agent")}
                className={`
                  w-full px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${
                    isAgent
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }
                `}
              >
                🕵️ Agent
              </button>
            </div>

            {/* Current Role Indicator */}
            <div className="mt-3 px-4 py-2 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Active Role</p>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isAdmin ? "bg-[#0F9D58]" : "bg-blue-500"
                  }`}
                />
                <span className="font-semibold text-slate-900 capitalize">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-200">
          <div className="px-4 py-3 bg-slate-50 rounded-lg mb-3">
            <p className="text-xs text-slate-500 mb-1">Logged In As</p>
            <p className="font-medium text-slate-900 text-sm">{userName}</p>
          </div>
          <button
            type="button"
            className="
              w-full
              flex items-center justify-center gap-2
              px-4 py-2
              rounded-lg
              border border-slate-200
              text-slate-700
              hover:bg-slate-50
              transition-colors
              font-medium
            "
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
