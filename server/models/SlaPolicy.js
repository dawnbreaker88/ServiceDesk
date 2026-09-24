import mongoose from 'mongoose';

const slaPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      required: true,
      unique: true,
    },
    responseTimeMinutes: {
      type: Number,
      required: true, // e.g., 15 for 15 mins
    },
    resolutionTimeMinutes: {
      type: Number,
      required: true, // e.g., 120 for 2 hrs
    },
    warningThresholdPercent: {
      type: Number,
      default: 75, // triggers SLA warning when 75% elapsed
    },
    description: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SlaPolicy = mongoose.model('SlaPolicy', slaPolicySchema);
