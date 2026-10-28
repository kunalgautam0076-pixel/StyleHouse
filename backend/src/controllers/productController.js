import Product from '../models/Product.js';

// @desc    Get all published products (with filtering, sorting, pagination)
// @route   GET /api/v1/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from direct database filtering
    const removeFields = ['search', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Add 'isPublished: true' to only show active products
    reqQuery.isPublished = true;

    // Handle Category Filtering (if a category slug or ID is passed)
    if (reqQuery.category) {
       // We will handle exact match here. In a real app, you might look up the category ID by slug first.
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
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
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
    const product = await Product.findOne({ 
      slug: req.params.slug, 
      isPublished: true 
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
    product.slug = req.body.name ? req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : product.slug;
    product.price = req.body.price !== undefined ? req.body.price : product.price;
    product.compareAtPrice = req.body.compareAtPrice !== undefined ? req.body.compareAtPrice : product.compareAtPrice;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.brand = req.body.brand || product.brand;
    product.stockQuantity = req.body.stockQuantity !== undefined ? req.body.stockQuantity : product.stockQuantity;
    product.isPublished = req.body.isPublished !== undefined ? req.body.isPublished : product.isPublished;
    
    if (req.body.images) {
      product.images = req.body.images;
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