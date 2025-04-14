const express = require('express');
const router = express.Router();
const materialConsumptionController = require('../controllers/materialConsumptionController');

router.get('/', materialConsumptionController.getConsumptions);
router.get('/:id', materialConsumptionController.getConsumptionById);
router.post('/create', materialConsumptionController.createConsumption);
router.put('/:id', materialConsumptionController.updateConsumption);
router.delete('/:id', materialConsumptionController.deleteConsumption);

module.exports = router;