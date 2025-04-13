const ImportExport = require('../models/ImportExport');
const WarehouseMaterial = require('../models/WarehouseMaterial');

const importExportController = {
    // Tạo giao dịch nhập/xuất kho
    async createTransaction(req, res) {
        try {
        const { TransactionID, MaterialID, WarehouseID, TransactionType, Quantity, TransactionDate, EmployeeID } = req.body;
        // Kiểm tra TransactionID đã tồn tại chưa
        const existingTransaction = await ImportExport.findOne({ TransactionID });
        if (existingTransaction) {
            return res.status(400).json({ message: 'TransactionID already exists' });
        }

        // Nếu là xuất kho, kiểm tra tồn kho
        if (TransactionType === 'Export') {
            const stock = await WarehouseMaterial.findOne({ MaterialID, WarehouseID });
            if (!stock || stock.StockQuantity < Quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
            }
            // Cập nhật tồn kho
            await WarehouseMaterial.findOneAndUpdate(
            { MaterialID, WarehouseID },
            { $inc: { StockQuantity: -Quantity } }
            );
        } else if (TransactionType === 'Import') {
            // Cập nhật tồn kho khi nhập
            await WarehouseMaterial.findOneAndUpdate(
            { MaterialID, WarehouseID },
            { $inc: { StockQuantity: Quantity } },
            { upsert: true } // Tạo mới nếu chưa có
            );
        }

        const transaction = new ImportExport({
            TransactionID,
            MaterialID,
            WarehouseID,
            TransactionType,
            Quantity,
            TransactionDate,
            EmployeeID,
        });
        await transaction.save();
        res.status(201).json(transaction);
        } catch (error) {
        res.status(400).json({ message: error.message });
        }
    },

    // Lấy danh sách giao dịch
    async getTransactions(req, res) {
        try {
        const transactions = await ImportExport.find()
            .populate('MaterialID')
            .populate('WarehouseID')
            .populate('EmployeeID');
        res.status(200).json(transactions);
        } catch (error) {
        res.status(500).json({ message: error.message });
        }
    },

    // Lấy chi tiết giao dịch theo TransactionID
    async getTransactionById(req, res) {
        try {
        const transaction = await ImportExport.findOne({ TransactionID: req.params.id })
            .populate('MaterialID')
            .populate('WarehouseID')
            .populate('EmployeeID');
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json(transaction);
        } catch (error) {
        res.status(500).json({ message: error.message });
        }
    },

    // Cập nhật giao dịch (chỉ cho phép cập nhật một số trường)
    async updateTransaction(req, res) {
        try {
        const { Quantity, TransactionDate } = req.body;
        const transaction = await ImportExport.findOneAndUpdate(
            { TransactionID: req.params.id },
            { Quantity, TransactionDate },
            { new: true }
        );
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json(transaction);
        } catch (error) {
        res.status(400).json({ message: error.message });
        }
    },

    // Xóa giao dịch
    async deleteTransaction(req, res) {
        try {
        const transaction = await ImportExport.findOneAndDelete({ TransactionID: req.params.id });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json({ message: 'Transaction deleted' });
        } catch (error) {
        res.status(500).json({ message: error.message });
        }
    },
};

module.exports = importExportController;