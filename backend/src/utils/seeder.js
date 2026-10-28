import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

dotenv.config();

const categories = [
  { name: 'Men', slug: 'men', description: "Men's Collection" },
  { name: 'Women', slug: 'women', description: "Women's Collection" },
  { name: 'Accessories', slug: 'accessories', description: 'Premium Accessories' },
];

const productData = [
  {
    name: 'Linen Blend Overshirt',
    slug: 'linen-blend-overshirt',
    category: 'men',
    description: 'A relaxed, breathable linen-blend overshirt for effortless everyday layering.',
    price: 2499,
    image: 'photo-1598033129183-c4f50c736f10',
    color: 'Sand',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    name: 'Classic Cotton Oxford',
    slug: 'classic-cotton-oxford',
    category: 'men',
    description: 'A crisp cotton Oxford shirt with a timeless cut and versatile styling.',
    price: 1899,
    image: 'photo-1603252109303-2751441dd157',
    color: 'White',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    name: 'Everyday Crewneck Tee',
    slug: 'everyday-crewneck-tee',
    category: 'men',
    description: 'A soft, mid-weight cotton crewneck made for daily wear.',
    price: 899,
    image: 'photo-1521572163474-6864f9cf17ab',
    color: 'Black',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    name: 'Tailored Pleated Trousers',
    slug: 'tailored-pleated-trousers',
    category: 'men',
    description: 'Modern straight-leg trousers with clean tailoring and a comfortable finish.',
    price: 2299,
    image: 'photo-1473966968600-fa801b869a1a',
    color: 'Charcoal',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    name: 'Textured Knit Polo',
    slug: 'textured-knit-polo',
    category: 'men',
    description: 'A refined short-sleeve knit polo that moves easily from casual to smart.',
    price: 1699,
    image: 'photo-1551028719-00167b16eac5',
    color: 'Olive',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    name: 'Flowing Midi Dress',
    slug: 'flowing-midi-dress',
    category: 'women',
    description: 'An elegant, easy-moving midi dress with a flattering everyday silhouette.',
    price: 2799,
    image: 'photo-1595777457583-95e059d581b8',
    color: 'Black',
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    name: 'Relaxed Linen Shirt',
    slug: 'relaxed-linen-shirt',
    category: 'women',
    description: 'A lightweight linen shirt with a relaxed drape for warm-weather layering.',
    price: 1999,
    image: 'photo-1598554747436-c9293d6a588f',
    color: 'Ivory',
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    name: 'Soft Ribbed Knit Top',
    slug: 'soft-ribbed-knit-top',
    category: 'women',
    description: 'A versatile rib-knit top with a soft hand feel and clean, minimal lines.',
    price: 1299,
    image: 'photo-1529139574466-a303027c1d8b',
    color: 'Cream',
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    name: 'High-Rise Straight Jeans',
    slug: 'high-rise-straight-jeans',
    category: 'women',
    description: 'Classic high-rise denim with a straight leg and comfortable all-day fit.',
    price: 2399,
    image: 'photo-1541099649105-f69ad21f3246',
    color: 'Blue',
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    name: 'Pleated Wide-Leg Pants',
    slug: 'pleated-wide-leg-pants',
    category: 'women',
    description: 'Fluid wide-leg pants with subtle pleats and a polished, easy silhouette.',
    price: 2199,
    image: 'photo-1523381210434-271e8be1f52b',
    color: 'Taupe',
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    name: 'Structured Everyday Tote',
    slug: 'structured-everyday-tote',
    category: 'accessories',
    description: 'A spacious structured tote designed to carry daily essentials in style.',
    price: 1999,
    image: 'photo-1548036328-c9fa89d128fa',
    color: 'Tan',
    sizes: ['One Size'],
  },
  {
    name: 'Minimal Leather Belt',
    slug: 'minimal-leather-belt',
    category: 'accessories',
    description: 'A clean-finish belt with a polished buckle for everyday styling.',
    price: 999,
    image: 'photo-1523275335684-37898b6baf30',
    color: 'Brown',
    sizes: ['One Size'],
  },
  {
    name: 'Classic Frame Sunglasses',
    slug: 'classic-frame-sunglasses',
    category: 'accessories',
    description: 'A versatile pair of classic-frame sunglasses with a timeless profile.',
    price: 1499,
    image: 'photo-1511499767150-a48a237f0083',
    color: 'Black',
    sizes: ['One Size'],
  },
  {
    name: 'Everyday Dial Watch',
    slug: 'everyday-dial-watch',
    category: 'accessories',
    description: 'A minimalist dial watch designed to complement both casual and formal looks.',
    price: 2999,
    image: 'photo-1524805444758-089113d48a6d',
    color: 'Silver',
    sizes: ['One Size'],
  },
  {
    name: 'Soft Woven Scarf',
    slug: 'soft-woven-scarf',
    category: 'accessories',
    description: 'A soft woven scarf that adds a light, comfortable finishing layer.',
    price: 1199,
    image: 'photo-1601924994987-69e26d50dc26',
    color: 'Beige',
    sizes: ['One Size'],
  },
];

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in your .env file.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for product seeding.');

    const categoryIds = new Map();
    for (const category of categories) {
      const savedCategory = await Category.findOneAndUpdate(
        { slug: category.slug },
        { $setOnInsert: category },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      categoryIds.set(category.slug, savedCategory._id);
    }

    const operations = productData.map((product) => {
      const { image, color, sizes, category, ...details } = product;
      const variants = sizes.map((size) => ({
        sku: `${product.slug}-${size.toLowerCase().replace(/\s+/g, '-')}`,
        size,
        color,
        stockQuantity: 10,
      }));

      return {
        updateOne: {
          filter: { slug: product.slug },
          update: {
            $setOnInsert: {
              ...details,
              brand: 'StyleHouse',
              category: categoryIds.get(category),
              images: [{
                url: `https://images.unsplash.com/${image}?auto=format&fit=crop&w=900&q=85`,
                publicId: `catalog-${product.slug}`,
                isPrimary: true,
              }],
              colors: [color],
              stockQuantity: variants.reduce((total, variant) => total + variant.stockQuantity, 0),
              variants,
              tags: [category, 'new-arrivals'],
              isPublished: true,
            },
          },
          upsert: true,
        },
      };
    });

    const result = await Product.bulkWrite(operations, { ordered: true });
    console.log(`Catalog seeded: ${result.upsertedCount} products added; existing products preserved.`);
    await mongoose.disconnect();
  } catch (error) {
    await mongoose.disconnect().catch(() => {});
    console.error(`Product seeding failed: ${error.message}`);
    process.exitCode = 1;
  }
};

seedData();
