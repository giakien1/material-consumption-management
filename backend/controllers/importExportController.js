const ImportExport = require('../models/ImportExport');
const WarehouseMaterial = require('../models/WarehouseMaterial');
const Material = require('../models/Material');
const Employee = require('../models/Employee');
const Warehouse = require('../models/Warehouse');

const importExportController = {
  // Tạo giao dịch nhập/xuất kho
  async createTransaction(req, res) {
    try {
      const { material, warehouse, quantity, type, date } = req.body;
  
      // Kiểm tra vật tư và kho
      const foundMaterial = await Material.findById(material);
      const foundWarehouse = await Warehouse.findById(warehouse);
      if (!foundMaterial || !foundWarehouse) {
        return res.status(400).json({ message: 'Vật tư hoặc kho không tồn tại.' });
      }
  
      // Kiểm tra số lượng nếu là xuất kho
      if (type === 'export') {
        const currentStock = foundWarehouse.stock[material] || 0;
        if (currentStock < quantity) {
          return res.status(400).json({ message: 'Không đủ số lượng trong kho để xuất.' });
        }
        foundWarehouse.stock[material] = currentStock - quantity;
      } else if (type === 'import') {
        const currentStock = foundWarehouse.stock[material] || 0;
        foundWarehouse.stock[material] = currentStock + quantity;
      } else {
        return res.status(400).json({ message: 'Loại giao dịch không hợp lệ.' });
      }
  
      // Lưu giao dịch
      const transaction = new MaterialTransaction({
        material,
        warehouse,
        quantity,
        type,
        date
      });
      await transaction.save();
  
      // Cập nhật kho
      await foundWarehouse.save();
  
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Lỗi tạo giao dịch vật tư:', error);
      res.status(500).json({ message: 'Lỗi server khi tạo giao dịch vật tư.' });
    }
  },  

  // Lấy danh sách giao dịch
  async getTransactions(req, res) {
    try {
      const transactions = await ImportExport.find()
        .populate('MaterialsUsed.MaterialID')
        .populate('WarehouseId')
        .populate('EmployeeId');
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy chi tiết giao dịch theo TransactionId
  async getTransactionById(req, res) {
    try {
      const transaction = await ImportExport.findOne({ TransactionId: req.params.id })
        .populate('MaterialsUsed.MaterialID')
        .populate('WarehouseId')
        .populate('EmployeeId');
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      res.status(200).json(transaction);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Xóa giao dịch
  async deleteTransaction(req, res) {
    try {
      const transaction = await ImportExport.findOne({ TransactionId: req.params.id });
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Revert stock
      if (transaction.Type === 'export') {
        for (const item of transaction.MaterialsUsed) {
          await WarehouseMaterial.findOneAndUpdate(
            { MaterialID: item.MaterialID, WarehouseID: transaction.WarehouseId },
            { $inc: { StockQuantity: item.Quantity } },
            { upsert: true }
          );
        }
      } else if (transaction.Type === 'import') {
        for (const item of transaction.MaterialsUsed) {
          const stock = await WarehouseMaterial.findOne({
            MaterialID: item.MaterialID,
            WarehouseID: transaction.WarehouseId,
          });
          if (!stock || stock.StockQuantity < item.Quantity) {
            return res.status(400).json({
              message: `Cannot delete: Insufficient stock to revert MaterialID ${item.MaterialID}`,
            });
          }
          await WarehouseMaterial.findOneAndUpdate(
            { MaterialID: item.MaterialID, WarehouseID: transaction.WarehouseId },
            { $inc: { StockQuantity: -item.Quantity } }
          );
        }
      }

      await ImportExport.findOneAndDelete({ TransactionId: req.params.id });
      res.status(200).json({ message: 'Transaction deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = importExportController;