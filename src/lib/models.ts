import mongoose, { Schema } from "mongoose";

// We need to ensure models are not compiled twice in development
// const { Schema } = mongoose;

const ClientSchema = new Schema({
  companyName: String,
  whatsappNumber: String,
  businessCategory: String,
  timezone: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});
ClientSchema.index({ whatsappNumber: 1 });

const UserSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client" },
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["Admin", "Agent"], default: "Agent" },
  status: { type: String, enum: ["active", "disabled"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});
UserSchema.index({ email: 1 });

// Provide a `fullName` virtual so APIs can return `fullName` to the frontend
UserSchema.virtual("fullName").get(function (this: any) {
  return this.name || "";
});

// Include virtuals in JSON / Object output
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

const RefreshTokenSchema = new Schema({
  tokenId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  revoked: { type: Boolean, default: false },
});
// auto remove revoked refresh tokens after 30 days
RefreshTokenSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 },
);

const LeadSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client" },
  phoneNumber: String,
  name: String,
  stage: {
    type: String,
    enum: ["new", "contacted", "qualified", "won", "lost"],
    default: "new",
  },
  tags: [String],
  optInStatus: String,
  assignedAgentId: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
LeadSchema.index({ clientId: 1, phoneNumber: 1 });

const ConversationSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client" },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
  assignedAgentId: { type: Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["open", "pending", "closed"],
    default: "open",
  },
  lastMessageAt: Date,
  displayName: String,
  avatar: String,
  lastMessagePreview: String,
  unreadCount: { type: Number, default: 0 },
  frontendStatus: {
    type: String,
    enum: ["unread", "read", "resolved"],
    default: "unread",
  },
  starred: { type: Boolean, default: false },
  userMeta: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      starred: { type: Boolean, default: false },
      lastReadAt: Date,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});
ConversationSchema.index({ clientId: 1, status: 1, lastMessageAt: -1 });
ConversationSchema.index({ clientId: 1, frontendStatus: 1 });

const MessageSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client" },
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
  senderType: { type: String, enum: ["customer", "agent", "system"] },
  messageType: { type: String, enum: ["text", "template", "image", "button"] },
  content: Schema.Types.Mixed,
  templateName: String,
  providerMessageId: { type: String, index: true },
  status: {
    type: String,
    enum: ["sent", "delivered", "failed", "read", "unknown"],
    default: "sent",
  },
  statusHistory: [
    {
      status: String,
      timestamp: Date,
      raw: Schema.Types.Mixed,
    },
  ],
  timestamp: { type: Date, default: Date.now },
});
MessageSchema.index({ conversationId: 1, timestamp: -1 });

const TemplateSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client" },
  name: String,
  language: String,
  content: String,
  variables: [String],
  status: {
    type: String,
    enum: ["approved", "pending", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});
TemplateSchema.index({ clientId: 1, name: 1 });

// Campaigns - extended with metrics and segment breakdown
const CampaignSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client" },
  name: String,
  templateId: { type: Schema.Types.ObjectId, ref: "Template" },
  targetTags: [String],
  // Scheduling
  scheduleTime: Date,
  startDate: Date,
  endDate: Date,
  status: {
    type: String,
    enum: ["scheduled", "running", "paused", "completed"],
    default: "scheduled",
  },
  createdAt: { type: Date, default: Date.now },

  // Metrics
  audienceSize: { type: Number, default: 0 },
  messagesSent: { type: Number, default: 0 },
  delivered: { type: Number, default: 0 },
  read: { type: Number, default: 0 },
  clicked: { type: Number, default: 0 },
  replied: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },

  // Rates stored as percentages (0-100)
  rates: {
    deliveryRate: { type: Number, default: 0 },
    readRate: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    replyRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
  },

  // Segment breakdowns - use Maps so keys can be dynamic (e.g., location names)
  segmentBreakdown: {
    location: { type: Map, of: Number, default: {} },
    age_group: { type: Map, of: Number, default: {} },
  },
});
CampaignSchema.index({ clientId: 1, createdAt: -1 });

// Campaign Logs
const CampaignLogSchema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
  messageStatus: { type: String, enum: ["sent", "delivered", "failed"] },
  sentAt: { type: Date, default: Date.now },
});
CampaignLogSchema.index({ campaignId: 1, leadId: 1 });

// Automation rules
const AutomationRuleSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client" },
  triggerType: { type: String, enum: ["keyword", "menu", "status"] },
  triggerValue: String,
  templateId: { type: Schema.Types.ObjectId, ref: "Template" },
  businessHoursOnly: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
AutomationRuleSchema.index({ clientId: 1, triggerType: 1 });

// Tasks
const TaskSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client" },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
  assignedAgentId: { type: Schema.Types.ObjectId, ref: "User" },
  title: String,
  dueDate: Date,
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});
TaskSchema.index({ clientId: 1, assignedAgentId: 1, status: 1 });

// AI Logs
const AiLogSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client" },
  featureType: { type: String, enum: ["template", "summary", "error"] },
  input: Schema.Types.Mixed,
  output: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});
AiLogSchema.index({ clientId: 1, createdAt: -1 });

// Audit logs
const AuditLogSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: "Client" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  action: String,
  entityType: String,
  entityId: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});
AuditLogSchema.index({ clientId: 1, userId: 1, timestamp: -1 });

// Check if models are already defined to prevent overwriting in hot reload
export const Client =
  mongoose.models.Client || mongoose.model("Client", ClientSchema);
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const RefreshToken =
  mongoose.models.RefreshToken ||
  mongoose.model("RefreshToken", RefreshTokenSchema);
export const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);
export const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);
export const Template =
  mongoose.models.Template || mongoose.model("Template", TemplateSchema);
