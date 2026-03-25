const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

router.route('/')
  .get(categoryController.getCategories)
  .post(auth(), requireRole('admin'), categoryController.createCategory);

router.route('/:slug')
  .put(auth(), requireRole('admin'), categoryController.updateCategory)
  .delete(auth(), requireRole('admin'), categoryController.deleteCategory);

module.exports = router;
