const ImportExport = require('../models/ImportExport');
const WarehouseMaterial = require('../models/WarehouseMaterial');
const Material = require('../models/Material');
const Warehouse = require('../models/Warehouse');
const Employee = require('../models/Employee');

const importExportController = {

  // Tạo giao dịch nhập/xuất kho
  async createTransaction(req, res) {
    try {
      const { TransactionType, MaterialsUsed, WarehouseId, EmployeeId, TransactionDate } = req.body;

      // Chuyển đổi TransactionType về chữ hoa đầu
      const formattedTransactionType = TransactionType.charAt(0).toUpperCase() + TransactionType.slice(1).toLowerCase();
  
      if (!TransactionType || !Array.isArray(MaterialsUsed) || !WarehouseId || !EmployeeId || !TransactionDate) {
        return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
      }
  
      // Kiểm tra kho và nhân viên
      const [warehouse, employee] = await Promise.all([
        Warehouse.findById(WarehouseId),
        Employee.findById(EmployeeId),
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
  
        let warehouseMaterial = await WarehouseMaterial.findOne({
          MaterialID: material._id,
          WarehouseID: warehouse._id,
        });
  
        if (!warehouseMaterial) {
          warehouseMaterial = new WarehouseMaterial({
            MaterialID: material._id,
            WarehouseID: warehouse._id,
            StockQuantity: 0,
          })
        }
  
        if (TransactionType === 'export' && warehouseMaterial.StockQuantity < Quantity) {
          return res.status(400).json({ message: `Không đủ số lượng để xuất vật tư ${MaterialID}` });
        }
  
        // Cập nhật tồn kho
        warehouseMaterial.StockQuantity += (TransactionType === 'import' ? Quantity : -Quantity);
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
        TransactionType: formattedTransactionType,
        TransactionDate: TransactionDate || Date.now(),
        EmployeeID: employee._id,
        MaterialsUsed: materialUpdates,
      });
  
      await transaction.save();
  
      return res.status(201).json({
        message: `Giao dịch ${TransactionType} đã được tạo với ${materialUpdates.length} vật tư`,
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
        .populate('WarehouseID', 'WarehouseName')
        .populate('EmployeeID', 'EmployeeName');
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
  
      const isImport = transaction.TransactionType === 'Import';
      const isExport = transaction.TransactionType === 'Export';
  
      for (const item of transaction.MaterialsUsed) {
        const filter = {
          MaterialID: item.MaterialID,
          WarehouseID: transaction.WarehouseID,
        };
  
        const warehouseMaterial = await WarehouseMaterial.findOne(filter);
  
        if (isExport) {
          if (!warehouseMaterial) {
            // Nếu chưa tồn tại thì tạo mới
            await new WarehouseMaterial({
              MaterialID: item.MaterialID,
              WarehouseID: transaction.WarehouseID,
              StockQuantity: item.Quantity,
            }).save();
          } else {
            warehouseMaterial.StockQuantity += item.Quantity;
            await warehouseMaterial.save();
          }
        } else if (isImport) {
          if (!warehouseMaterial || warehouseMaterial.StockQuantity < item.Quantity) {
            return res.status(400).json({
              message: `Không thể xóa: tồn kho không đủ để hoàn tác MaterialID ${item.MaterialID}`,
            });
          }
  
          warehouseMaterial.StockQuantity -= item.Quantity;
          await warehouseMaterial.save();
        }
      }
  
      await ImportExport.findOneAndDelete({ TransactionID: req.params.id });
      res.status(200).json({ message: 'Đã xóa giao dịch thành công' });
  
    } catch (error) {
      console.error('Lỗi xóa giao dịch:', error);
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = importExportController;
