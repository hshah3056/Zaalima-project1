import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: [true, 'Tenant ID is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true
    },
    tagline: {
      type: String,
      default: 'Official Brand Store'
    },
    themeColor: {
      type: String,
      default: '#e40046'
    },
    bannerTitle: {
      type: String,
      default: 'Mega Festival Sale'
    },
    bannerSubtitle: {
      type: String,
      default: 'Up to 80% OFF on Top Verified Products'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    isVerified: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Store = mongoose.model('Store', storeSchema);
