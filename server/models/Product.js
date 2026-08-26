import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: [true, 'Tenant ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    brand: {
      type: String,
      default: 'Mydeal Brand'
    },
    price: {
      type: Number,
      required: [true, 'Product price is required']
    },
    originalPrice: {
      type: Number,
      default: function () {
        return Math.round(this.price * 1.3);
      }
    },
    discount: {
      type: String,
      default: '30% OFF'
    },
    rating: {
      type: Number,
      default: 4.5
    },
    reviewsCount: {
      type: Number,
      default: 120
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required']
    },
    isDealOfTheDay: {
      type: Boolean,
      default: false
    },
    stock: {
      type: Number,
      default: 50
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
