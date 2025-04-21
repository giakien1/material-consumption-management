const ImportExport = require('../models/ImportExport');
const WarehouseMaterial = require('../models/WarehouseMaterial');
const Material = require('../models/Material');
const Warehouse = require('../models/Warehouse');
const Employee = require('../models/Employee');
const { updateStock} = require('../helpers/stockHelper');

const importExportController = {

  // Tạo giao dịch nhập/xuất kho
  async createTransaction(req, res) {
    try {
      const { Type, MaterialsUsed, WarehouseId, EmployeeId, transactionDate } = req.body;
  
      if (!Type || !MaterialsUsed || !Array.isArray(MaterialsUsed) || !WarehouseId || !EmployeeId || !transactionDate) {
        return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
      }
  
      const normalizedType = Type.toLowerCase();
      if (!['import', 'export'].includes(normalizedType)) {
        return res.status(400).json({ message: 'Loại giao dịch không hợp lệ' });
      }
  
      const transactionType = normalizedType === 'import' ? 'Import' : 'Export';
  
      // Kiểm tra kho và nhân viên
      const [warehouse, employee] = await Promise.all([
        Warehouse.findOne({ WarehouseID: WarehouseId }),
        Employee.findOne({ EmployeeID: EmployeeId }),
      ]);
      if (!warehouse) return res.status(404).json({ message: 'Kho không tồn tại' });
      if (!employee) return res.status(404).json({ message: 'Nhân viên không tồn tại' });
  
      const materialUpdates = [];
  
      // Kiểm tra từng vật tư
      for (const item of MaterialsUsed) {
        const { MaterialID, Quantity } = item;
  
        if (!MaterialID || isNaN(Quantity) || Quantity <= 0) {
          return res.status(400).json({ message: 'Vật tư không hợp lệ hoặc số lượng <= 0' });
        }
  
        const material = await Material.findOne({ MaterialID });
        if (!material) return res.status(404).json({ message: `Vật tư ${MaterialID} không tồn tại` });
  
        const warehouseMaterial = await WarehouseMaterial.findOne({
          MaterialID: material._id,
          WarehouseID: warehouse._id,
        });
  
        if (!warehouseMaterial) {
          return res.status(404).json({ message: `Vật tư ${MaterialID} không có trong kho ${WarehouseId}` });
        }
  
        if (Type === 'export' && warehouseMaterial.StockQuantity < Quantity) {
          return res.status(400).json({ message: `Không đủ số lượng để xuất vật tư ${MaterialID}` });
        }
  
        // Cập nhật tồn kho
        warehouseMaterial.StockQuantity += (Type === 'import' ? Quantity : -Quantity);
        await warehouseMaterial.save();
  
        // Chuẩn bị dữ liệu thêm vào giao dịch
        materialUpdates.push({
          MaterialID: material._id,
          Quantity,
        });
      }
  
      // Tạo một bản ghi giao dịch 
      const transaction = new ImportExport({
        TransactionID: `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        WarehouseID: warehouse._id,
        TransactionType: transactionType,
        TransactionDate: transactionDate || Date.now(),
        EmployeeID: employee._id,
        MaterialsUsed: materialUpdates,
      });
  
      await transaction.save();
  
      return res.status(201).json({
        message: `Giao dịch ${transactionType} đã được tạo với ${materialUpdates.length} vật tư`,
        transaction,
      });
  
    } catch (error) {
      console.error('Lỗi tạo giao dịch:', error);
      res.status(500).json({ message: 'Lỗi server khi xử lý giao dịch', error: error.message });
    }
  },
  
  
  // Lấy danh sách giao dịch
  async getTransactions(req, res) {
    try {
      const transactions = await ImportExport.find()
        .populate('MaterialsUsed.MaterialID')
        .populate('WarehouseID')
        .populate('EmployeeID');
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy chi tiết giao dịch theo TransactionId
  async getTransactionById(req, res) {
    try {
      const transaction = await ImportExport.findOne({ TransactionID: req.params.id })
        .populate('MaterialsUsed.MaterialID')
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

  // Xóa giao dịch
  async deleteTransaction(req, res) {
    try {
      const transaction = await ImportExport.findOne({ TransactionID: req.params.id });
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

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
              message: `Không thể xóa: Số lượng trong kho không đủ để hoàn tác MaterialID ${item.MaterialID}`,
            });
          }
          await WarehouseMaterial.findOneAndUpdate(
            { MaterialID: item.MaterialID, WarehouseID: transaction.WarehouseId },
            { $inc: { StockQuantity: -item.Quantity } }
          );
        }
      }

      await ImportExport.findOneAndDelete({ TransactionID: req.params.id });
      res.status(200).json({ message: 'Đã xóa giao dịch' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = importExportController;
