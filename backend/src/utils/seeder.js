import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

// Load env vars from the backend root folder
dotenv.config(); 

const categories = [
  { name: 'Men', slug: 'men', description: 'Men\'s Collection' },
  { name: 'Women', slug: 'women', description: 'Women\'s Collection' },
  { name: 'Accessories', slug: 'accessories', description: 'Premium Accessories' }
];

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in your .env file!");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('Previous Data Cleared.');

    // Insert Categories
    const createdCategories = await Category.insertMany(categories);
    const menCatId = createdCategories.find(c => c.slug === 'men')._id;
    const womenCatId = createdCategories.find(c => c.slug === 'women')._id;

    // Create Sample Products
    const products = [
      {
        name: 'Classic Oxford Shirt',
        slug: 'classic-oxford-shirt',
        description: 'A timeless white oxford shirt made from premium organic cotton.',
        category: menCatId,
        price: 89.99,
        images: [{ url: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=500', publicId: 'sample_oxford', isPrimary: true }],
        variants: [
          { sku: 'OX-WHT-M', size: 'M', color: 'White', stockQuantity: 15 },
          { sku: 'OX-WHT-L', size: 'L', color: 'White', stockQuantity: 10 }
        ]
      },
      {
        name: 'Silk Slip Dress',
        slug: 'silk-slip-dress',
        description: 'Elegant midi-length slip dress crafted from 100% mulberry silk.',
        category: womenCatId,
        price: 145.00,
        images: [{ url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500', publicId: 'sample_dress', isPrimary: true }],
        variants: [
          { sku: 'SLP-BLK-S', size: 'S', color: 'Black', stockQuantity: 8 },
          { sku: 'SLP-BLK-M', size: 'M', color: 'Black', stockQuantity: 5 }
        ]
      }
    ];

    await Product.insertMany(products);
    console.log('Seed Data Successfully Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();