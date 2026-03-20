const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {

        $lookup: {
          from: 'products',      
          localField: 'slug',
          foreignField: 'category',
          as: 'products',
        },
      },
      {
        $addFields: {
          itemCount: { $size: '$products' },
        },
      },
      {

        $project: { products: 0 },
      },
      {
        $sort: { order: 1, name: 1 },
      },
    ]);

    res.status(200).json(categories);
  } catch (error) {
    console.error('categoryController.getCategories error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { slug, name, bgColor, imgUrl, order } = req.body;

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: `Category with slug "${slug}" already exists.` });
    }

    const category = await Category.create({ slug, name, bgColor, imgUrl, order });
    res.status(201).json(category);
  } catch (error) {
    console.error('categoryController.createCategory error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, bgColor, imgUrl, order } = req.body;

    const category = await Category.findOneAndUpdate(
      { slug: req.params.slug },
      { name, bgColor, imgUrl, order },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error('categoryController.updateCategory error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ slug: req.params.slug });

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.status(200).json({ message: 'Category deleted.' });
  } catch (error) {
    console.error('categoryController.deleteCategory error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
