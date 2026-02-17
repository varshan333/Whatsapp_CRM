"use client";

import {
  Archive,
  CheckCircle2,
  Clock,
  MessageCircle,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MainLayout } from "@/components/layout";
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: string;
  sender: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: "unread" | "read" | "resolved";
  starred: boolean;
}

/**
 * Team Inbox Page - Accessible to both Admin and Agent
 *
 * Displays shared conversation inbox with role-based information.
 * Both roles can see and manage inbox items, but may see different
 * team-level insights (Admin) vs. personal stats (Agent).
 */
export default function InboxPage() {
  const { isAdmin } = useAuth();
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "unread" | "read" | "resolved"
  >("all");

  // Mock message data
  const messages: Message[] = [
    {
      id: "1",
      sender: "Acme Corp",
      avatar: "AC",
      lastMessage: "We need urgent support for our account",
      time: "2 mins ago",
      unread: 3,
      status: "unread",
      starred: true,
    },
    {
      id: "2",
      sender: "Sarah Johnson",
      avatar: "SJ",
      lastMessage: "Thank you for resolving our issue!",
      time: "15 mins ago",
      unread: 0,
      status: "resolved",
      starred: false,
    },
    {
      id: "3",
      sender: "Tech Support LLC",
      avatar: "TS",
      lastMessage: "Can you confirm the order details?",
      time: "1 hour ago",
      unread: 2,
      status: "read",
      starred: false,
    },
    {
      id: "4",
      sender: "Mike Chen",
      avatar: "MC",
      lastMessage: "Please provide a quote for bulk orders",
      time: "3 hours ago",
      unread: 1,
      status: "read",
      starred: false,
    },
    {
      id: "5",
      sender: "Global Solutions Inc",
      avatar: "GS",
      lastMessage: "Interested in your enterprise package",
      time: "5 hours ago",
      unread: 0,
      status: "resolved",
      starred: true,
    },
  ];

  // Filter messages based on search and status
  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = msg.sender
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || msg.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const totalConversations = messages.length;

  return (
    <MainLayout>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Team Inbox
              </h1>
              <p className="text-slate-600">
                {isAdmin
                  ? "Manage all team conversations and customer inquiries"
                  : "Your assigned conversations and tasks"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusCard
              label="Total Messages"
              value={`${totalConversations}`}
              icon={MessageCircle}
            />
            <StatusCard
              label="Unread"
              value={`${unreadCount}`}
              icon={Clock}
              highlight
            />
            <StatusCard label="Resolved" value="2" icon={CheckCircle2} />
            {isAdmin && (
              <StatusCard
                label="Team Conversations"
                value="342"
                icon={MessageCircle}
              />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
              {/* Search and Filter */}
              <div className="p-4 border-b border-slate-200">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F9D58] text-sm"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto">
                  {(["all", "unread", "read", "resolved"] as const).map(
                    (status) => (
                      <button
                        type="button"
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`
                          whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize
                          ${
                            filterStatus === status
                              ? "bg-[#0F9D58] text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }
                        `}
                      >
                        {status}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <button
                      type="button"
                      key={message.id}
                      onClick={() => setSelectedMessage(message.id)}
                      className={`
                        w-full px-4 py-4 border-b border-slate-100 text-left transition-colors hover:bg-slate-50
                        ${selectedMessage === message.id ? "bg-[#0F9D58]/5 border-l-4 border-l-[#0F9D58]" : ""}
                        ${message.status === "unread" ? "bg-blue-50/50" : ""}
                      `}
                    >
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-[#0F9D58]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-[#0F9D58]">
                              {message.avatar}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">
                              {message.sender}
                            </p>
                            <p className="text-xs text-slate-500">
                              {message.time}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="text-slate-400 hover:text-yellow-500 transition-colors flex-shrink-0 cursor-pointer p-1 hover:bg-slate-100 rounded border-none bg-transparent"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              message.starred
                                ? "fill-yellow-500 text-yellow-500"
                                : ""
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 truncate mb-2">
                        {message.lastMessage}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          {message.status === "unread" && (
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2" />
                          )}
                          <span
                            className={`text-xs font-medium capitalize ${
                              message.status === "unread"
                                ? "text-blue-600"
                                : message.status === "resolved"
                                  ? "text-green-600"
                                  : "text-slate-600"
                            }`}
                          >
                            {message.status}
                          </span>
                        </div>
                        {message.unread > 0 && (
                          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {message.unread}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <p>No conversations found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conversation Details */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {messages.find((m) => m.id === selectedMessage)?.sender}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {messages.find((m) => m.id === selectedMessage)?.time}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Archive className="w-5 h-5 text-slate-600" />
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Customer Message */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0F9D58]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#0F9D58]">
                        {messages.find((m) => m.id === selectedMessage)
                          ?.avatar || "C"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-slate-100 rounded-lg p-3 mb-1">
                        <p className="text-sm text-slate-900">
                          Hi, I have a question about my recent order. Can you
                          help me?
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">10:30 AM</p>
                    </div>
                  </div>

                  {/* Agent Message */}
                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 text-right">
                      <div className="bg-[#0F9D58] text-white rounded-lg p-3 mb-1 inline-block">
                        <p className="text-sm">
                          Of course! I'd be happy to help. What's your concern?
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">10:32 AM</p>
                    </div>
                  </div>

                  {/* Customer Message */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0F9D58]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[#0F9D58]">
                        {messages.find((m) => m.id === selectedMessage)
                          ?.avatar || "C"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-slate-100 rounded-lg p-3 mb-1">
                        <p className="text-sm text-slate-900">
                          I'm still waiting on my delivery...
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">10:35 AM</p>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F9D58] text-sm"
                    />
                    <button
                      type="button"
                      className="px-4 py-2 bg-[#0F9D58] text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">
                    Select a conversation to view details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

interface StatusCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

function StatusCard({ label, value, icon: Icon, highlight }: StatusCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"
      }`}
    >
      <p
        className={`text-xs font-medium mb-1 ${highlight ? "text-blue-600" : "text-slate-600"}`}
      >
        {label}
      </p>
      <div className="flex items-center justify-between">
        <p
          className={`text-2xl font-bold ${highlight ? "text-blue-600" : "text-slate-900"}`}
        >
          {value}
        </p>
        <Icon
          className={`w-5 h-5 ${highlight ? "text-blue-400" : "text-slate-400"}`}
        />
      </div>
    </div>
  );
}
