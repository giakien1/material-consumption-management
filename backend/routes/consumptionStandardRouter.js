const exprsess = require('express');
const router = exprsess.Router();
const consumptionStandardController = require('../controllers/consumptionStandardController');

router.get('/', consumptionStandardController.getConsumptionStandards);
router.get('/:id', consumptionStandardController.getConsumptionStandardById);
router.post('/', consumptionStandardController.createConsumptionStandard);
router.put('/:id', consumptionStandardController.updateConsumptionStandard);
router.delete('/:id', consumptionStandardController.deleteConsumptionStandard);

module.exports = router;