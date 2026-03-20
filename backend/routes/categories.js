const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

const verifyAdmin = (req, res, next) => {

  next();
};

router.route('/')
  .get(categoryController.getCategories)
  .post(verifyAdmin, categoryController.createCategory);

router.route('/:slug')
  .put(verifyAdmin, categoryController.updateCategory)
  .delete(verifyAdmin, categoryController.deleteCategory);

module.exports = router;
