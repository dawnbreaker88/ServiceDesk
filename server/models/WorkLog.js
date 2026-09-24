import mongoose from 'mongoose';

const workLogSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Work log description is required'],
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: Date.now,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: [1, 'Work duration must be at least 1 minute'],
    },
  },
  {
    timestamps: true,
  }
);

export const WorkLog = mongoose.model('WorkLog', workLogSchema);
