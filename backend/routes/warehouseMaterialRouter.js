const express = require('express');
const router = express.Router();
const warehouseMaterialController = require('../controllers/warehouseMaterialController');

router.get('/', warehouseMaterialController.getWarehouseMaterials);
router.get('/:id', warehouseMaterialController.getWarehouseMaterialById);
router.post('/', warehouseMaterialController.createWarehouseMaterial);
router.put('/:id', warehouseMaterialController.updateWarehouseMaterial);
router.delete('/:id', warehouseMaterialController.deleteWarehouseMaterial);

module.exports = router;