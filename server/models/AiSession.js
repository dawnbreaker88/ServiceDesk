import mongoose from 'mongoose';

const aiSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problemDescription: {
      type: String,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    matchedGuide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TroubleshootingGuide',
      default: null,
    },
    currentStepIndex: {
      type: Number,
      default: 0,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        options: [String],
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'RESOLVED', 'ESCALATED', 'ABANDONED'],
      default: 'IN_PROGRESS',
    },
    createdTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const AiSession = mongoose.model('AiSession', aiSessionSchema);
