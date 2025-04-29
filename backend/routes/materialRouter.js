const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');

router.get('/', materialController.getMaterials);
router.get('/:id', materialController.getMaterialById);
router.get('/search/:keyword', materialController.getMaterialByName);
router.post('/', materialController.createMaterial);
router.put('/:id', materialController.updateMaterial);
router.delete('/:id', materialController.deleteMaterial);


module.exports = router;