import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

// @desc    Create a draft product for an administrator to complete
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const category = await Category.findOne({ isActive: true }).sort('name');

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Create an active category before adding products.',
      });
    }

    const productId = new mongoose.Types.ObjectId();
    const product = await Product.create({
      _id: productId,
      name: 'New Product',
      slug: `new-product-${productId.toString()}`,
      description: 'Add a product description.',
      brand: 'StyleHouse',
      category: category._id,
      images: [{
        url: 'https://placehold.co/600x800?text=New+Product',
        publicId: 'draft-placeholder',
        isPrimary: true,
      }],
      price: 0,
      isPublished: false,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all published products (with filtering, sorting, pagination)
// @route   GET /api/v1/products
// @access  Public/Admin (admins can also see drafts)
export const getProducts = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from direct database filtering
    const removeFields = ['search', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    if (req.user?.role !== 'admin') {
      reqQuery.isPublished = true;
    }

    let sortBy = req.query.sort;

    // Category filters accept category slugs or IDs; new arrivals means newest first.
    if (reqQuery.category) {
      if (reqQuery.category === 'new-arrivals') {
        delete reqQuery.category;
        sortBy = sortBy || '-createdAt';
      } else {
        const categoryId = mongoose.isValidObjectId(reqQuery.category)
          ? reqQuery.category
          : (await Category.findOne({ slug: reqQuery.category, isActive: true }).select('_id'))?._id;

        if (!categoryId) {
          const page = parseInt(req.query.page, 10) || 1;
          const limit = parseInt(req.query.limit, 10) || 12;

          return res.status(200).json({
            success: true,
            pagination: { page, limit, total: 0, totalPages: 0 },
            data: [],
          });
        }

        reqQuery.category = categoryId;
      }
    }

    // Handle Search Keyword
    if (req.query.search) {
      reqQuery.name = {
        $regex: req.query.search,
        $options: 'i', // case-insensitive
      };
    }

    // Stringify query to handle greater than / less than (e.g., price[lte]=50)
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Build the query
    query = Product.find(JSON.parse(queryStr)).populate('category', 'name slug');

    // Sorting
    if (sortBy) {
      query = query.sort(sortBy.split(',').join(' '));
    } else {
      query = query.sort('-createdAt'); // Default sort by newest
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const total = await Product.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const products = await query;

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single product by slug
// @route   GET /api/v1/products/:slug
// @access  Public
export const getProductBySlug = async (req, res, next) => {
  try {
    const productFilter = mongoose.isValidObjectId(req.params.slug)
      ? { _id: req.params.slug, isPublished: true }
      : { slug: req.params.slug, isPublished: true };
    const product = await Product.findOne({ 
      ...productFilter,
    }).populate('category', 'name slug');

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};  
// @desc    Update a product (Admin only)
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update fields from request body
    product.name = req.body.name || product.name;
    if (req.body.name) {
      const slugBase = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product';
      const slugExists = await Product.exists({ slug: slugBase, _id: { $ne: product._id } });
      product.slug = slugExists ? `${slugBase}-${product._id}` : slugBase;
    }
    product.price = req.body.price !== undefined ? req.body.price : product.price;
    product.compareAtPrice = req.body.compareAtPrice !== undefined ? req.body.compareAtPrice : product.compareAtPrice;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.brand = req.body.brand || product.brand;
    product.stockQuantity = req.body.stockQuantity !== undefined ? req.body.stockQuantity : product.stockQuantity;
    product.isPublished = req.body.isPublished !== undefined ? req.body.isPublished : product.isPublished;
    
    if (req.body.images) {
      product.images = req.body.images.map((image, index) => ({
        ...image,
        publicId: image.publicId || product.images[index]?.publicId || `admin-${product._id}-${index}`,
      }));
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};