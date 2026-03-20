const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const verifyAdmin = [auth(), requireRole('admin')];

router.get('/', productController.getAll);

router.post('/', verifyAdmin, productController.create);

router.put('/:id', verifyAdmin, productController.update);

router.delete('/:id', verifyAdmin, productController.remove);

module.exports = router;
