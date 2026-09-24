import mongoose from 'mongoose';

const troubleshootingGuideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Guide title is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],
    diagnosticQuestions: [
      {
        question: String,
        options: [String], // e.g. ["Yes", "No", "Not sure"]
      },
    ],
    steps: [
      {
        stepNumber: Number,
        instruction: String,
        details: String,
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    suggestedPriority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
  },
  {
    timestamps: true,
  }
);

troubleshootingGuideSchema.index({ title: 'text', symptoms: 'text' });

export const TroubleshootingGuide = mongoose.model('TroubleshootingGuide', troubleshootingGuideSchema);
