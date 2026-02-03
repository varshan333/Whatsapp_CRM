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

const UserSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['admin', 'agent'], default: 'agent' },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

const RefreshTokenSchema = new Schema({
  tokenId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  revoked: { type: Boolean, default: false },
});

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

const ConversationSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
  assignedAgentId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['open', 'pending', 'closed'], default: 'open' },
  lastMessageAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const MessageSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  senderType: { type: String, enum: ['customer', 'agent', 'system'] },
  messageType: { type: String, enum: ['text', 'template', 'image', 'button'] },
  content: Schema.Types.Mixed,
  templateName: String,
  status: { type: String, enum: ['sent', 'delivered', 'failed'], default: 'sent' },
  timestamp: { type: Date, default: Date.now },
});

const TemplateSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
  name: String,
  language: String,
  content: String,
  variables: [String],
  status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  Client: mongoose.model('Client', ClientSchema),
  User: mongoose.model('User', UserSchema),
  RefreshToken: mongoose.model('RefreshToken', RefreshTokenSchema),
  Lead: mongoose.model('Lead', LeadSchema),
  Conversation: mongoose.model('Conversation', ConversationSchema),
  Message: mongoose.model('Message', MessageSchema),
  Template: mongoose.model('Template', TemplateSchema),
};
