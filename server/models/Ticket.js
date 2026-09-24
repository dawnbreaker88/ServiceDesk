import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number, default: 0 },
  mimeType: { type: String, default: '' },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Ticket title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED', 'ESCALATED'],
      default: 'OPEN',
      required: true,
      index: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      default: null,
    },
    slaPolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SlaPolicy',
      default: null,
    },
    slaStatus: {
      type: String,
      enum: ['NORMAL', 'APPROACHING_DEADLINE', 'BREACHED', 'ESCALATED'],
      default: 'NORMAL',
    },
    responseDeadline: {
      type: Date,
      default: null,
    },
    resolutionDeadline: {
      type: Date,
      default: null,
    },
    firstResponseAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    reopenedAt: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      enum: ['MANUAL', 'AI_ASSISTANT'],
      default: 'MANUAL',
    },
    resolutionSummary: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    attachments: [attachmentSchema],
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

// Search index for text searches
ticketSchema.index({ ticketNumber: 'text', title: 'text', description: 'text' });

export const Ticket = mongoose.model('Ticket', ticketSchema);
