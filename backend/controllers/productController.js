const Product = require('../models/Product');

function validateProductBody(body, isUpdate = false) {
  const { name, price, category, stock } = body;

  if (!isUpdate) {

    if (!name || price == null || !category || stock == null) {
      return 'name, price, category, and stock are all required.';
    }
  }

  if (name !== undefined && !String(name).trim()) {
    return 'name cannot be blank.';
  }

  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    return 'price must be a non-negative number.';
  }

  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
    return 'stock must be a non-negative number.';
  }

  const allowed = ['Meat', 'Vegetables', 'Fruits', 'Dairy', 'Grains'];
  if (category !== undefined && !allowed.includes(category)) {
    return `category must be one of: ${allowed.join(', ')}.`;
  }

  return null;
}

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json({ products });
  } catch (err) {
    console.error('GET /api/products error:', err);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
};

exports.create = async (req, res) => {
  try {
    const validationError = validateProductBody(req.body, false);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { name, price, category, stock, img, unit, reviews, reviewCount } = req.body;

    const product = await Product.create({
      name: name.trim(),
      price,
      category,
      stock,
      img: img || '',
      unit: unit || 'kg',
      reviews: reviews || 0,
      reviewCount: reviewCount || 0,
    });

    res.status(201).json({ product });
  } catch (err) {
    console.error('POST /api/products error:', err);
    res.status(500).json({ error: 'Failed to create product.' });
  }
};

exports.update = async (req, res) => {
  try {
    const validationError = validateProductBody(req.body, true);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json({ product });
  } catch (err) {
    console.error('PUT /api/products/:id error:', err);
    res.status(500).json({ error: 'Failed to update product.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json({ message: 'Product deleted successfully.', product });
  } catch (err) {
    console.error('DELETE /api/products/:id error:', err);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
};
