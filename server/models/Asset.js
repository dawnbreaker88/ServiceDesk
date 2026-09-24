import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      required: [true, 'Asset tag is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['LAPTOP', 'DESKTOP', 'MONITOR', 'PRINTER', 'PHONE', 'ROUTER', 'SERVER', 'SOFTWARE_LICENSE', 'ACCESSORY', 'OTHER'],
      default: 'LAPTOP',
      required: true,
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PROCURED', 'IN_STOCK', 'ASSIGNED', 'IN_REPAIR', 'RETIRED', 'LOST'],
      default: 'IN_STOCK',
      required: true,
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    vendor: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      default: '',
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    warrantyExpiry: {
      type: Date,
      default: null,
    },
    cost: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    specs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Asset = mongoose.model('Asset', assetSchema);
