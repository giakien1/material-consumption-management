const exprsess = require('express');
const router = exprsess.Router();
const consumptionStandardController = require('../controllers/consumptionStandardController');

router.get('/', consumptionStandardController.getConsumptionStandards);
router.get('/:id', consumptionStandardController.getConsumptionStandardById);
router.post('/create', consumptionStandardController.createConsumptionStandard);
router.put('/update/:id', consumptionStandardController.updateConsumptionStandard);
router.delete('/delete/:id', consumptionStandardController.deleteConsumptionStandard);

module.exports = router;