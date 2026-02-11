const { mongoose } = require('./db');
const { Schema } = mongoose;

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
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['admin', 'agent'], default: 'agent' },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});
UserSchema.index({ email: 1 });

const RefreshTokenSchema = new Schema({
  tokenId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  revoked: { type: Boolean, default: false },
});
// auto remove revoked refresh tokens after 30 days
RefreshTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const LeadSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  phoneNumber: String,
  name: String,
  stage: { type: String, enum: ['new', 'contacted', 'qualified', 'won', 'lost'], default: 'new' },
  tags: [String],
  optInStatus: String,
  assignedAgentId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
LeadSchema.index({ clientId: 1, phoneNumber: 1 });

const ConversationSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
  assignedAgentId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['open', 'pending', 'closed'], default: 'open' },
  lastMessageAt: Date,
  createdAt: { type: Date, default: Date.now },
});
ConversationSchema.index({ clientId: 1, status: 1, lastMessageAt: -1 });

const MessageSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  senderType: { type: String, enum: ['customer', 'agent', 'system'] },
  messageType: { type: String, enum: ['text', 'template', 'image', 'button'] },
  content: Schema.Types.Mixed,
  templateName: String,
  // providerMessageId stores the external provider's message id (e.g., WhatsApp message id)
  providerMessageId: { type: String, index: true },
  status: { type: String, enum: ['sent', 'delivered', 'failed', 'read', 'unknown'], default: 'sent' },
  // history of status updates from provider (idempotent append)
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
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  name: String,
  language: String,
  content: String,
  variables: [String],
  status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});
TemplateSchema.index({ clientId: 1, name: 1 });

module.exports = {
  Client: mongoose.model('Client', ClientSchema),
  User: mongoose.model('User', UserSchema),
  RefreshToken: mongoose.model('RefreshToken', RefreshTokenSchema),
  Lead: mongoose.model('Lead', LeadSchema),
  Conversation: mongoose.model('Conversation', ConversationSchema),
  Message: mongoose.model('Message', MessageSchema),
  Template: mongoose.model('Template', TemplateSchema),
};
