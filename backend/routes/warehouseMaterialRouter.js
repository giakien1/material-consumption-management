const express = require('express');
const router = express.Router();
const warehouseMaterialController = require('../controllers/warehouseMaterialController');

router.get('/', warehouseMaterialController.getWarehouseMaterials);
router.get('/warehouse/:warehouseId', warehouseMaterialController.getMaterialsByWarehouse);
router.get('/:materialId/:warehouseId', warehouseMaterialController.getWarehouseMaterialById);
router.post('/', warehouseMaterialController.createWarehouseMaterial);
router.put('/:materialId/:warehouseId', warehouseMaterialController.updateWarehouseMaterial);
router.delete('/:materialId/:warehouseId', warehouseMaterialController.deleteWarehouseMaterial);

module.exports = router;