const Product = require('../models/Product');

// GET /api/products?search=&category=&page=&limit=
async function listProducts(req, res, next) {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (category && category !== 'all') query.category = category;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);

    const [products, total, categories] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(query),
      Product.distinct('category')
    ]);

    res.json({
      products,
      categories,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      totalProducts: total
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id
async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

// POST /api/products (admin only)
async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;
    if (!name || !description || price == null || !category) {
      return res.status(400).json({ message: 'name, description, price and category are required.' });
    }
    const product = await Product.create({
      name,
      description,
      price,
      category,
      imageUrl,
      stock: stock ?? 0,
      createdBy: req.user._id
    });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id (admin only)
async function updateProduct(req, res, next) {
  try {
    const updates = (({ name, description, price, category, imageUrl, stock }) => ({
      name, description, price, category, imageUrl, stock
    }))(req.body);
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id (admin only)
async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
