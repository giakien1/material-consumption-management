const express = require('express');
const router = express.Router();
const importExportController = require('../controllers/importExportController');

router.get('/', importExportController.getTransactions);
router.get('/:id', importExportController.getTransactionById);
router.post('/create', importExportController.createTransaction);
router.put('/:id', importExportController.updateTransaction);
router.delete('/:id', importExportController.deleteTransaction);

module.exports = router;