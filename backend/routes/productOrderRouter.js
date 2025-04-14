const express = require('express');
const router = express.Router();
const productOrderController = require('../controllers/productOrderController');

router.get('/', productOrderController.getProductOrders);
router.get('/:id', productOrderController.getProductOrderById);
router.post('/', productOrderController.createProductOrder);
router.put('/:id', productOrderController.updateProductOrder);
router.delete('/:id', productOrderController.deleteProductOrder);

module.exports = router;