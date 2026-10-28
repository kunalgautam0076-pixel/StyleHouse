import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  size: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  price: { // Variant-specific pricing if applicable, otherwise defaults to product price
    type: Number,
  }
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: 'LUXE',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        isPrimary: { type: Boolean, default: false }
      }
    ],
    price: {
      type: Number,
      required: [true, 'Product base price is required'],
      min: 0,
    },
    stockQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },
    compareAtPrice: {
      type: Number, // Original price before discount
      min: 0,
    },
    variants: [variantSchema],
    tags: [String],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);