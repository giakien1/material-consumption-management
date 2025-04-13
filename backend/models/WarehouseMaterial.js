const mongoose = require('mongoose');

const warehouseMaterialSchema = new mongoose.Schema({
  WarehouseID: {
    type: String,
    ref: 'Warehouse',
    required: true,
  },
  MaterialID: {
    type: String,
    ref: 'Material',
    required: true,
  },
  StockQuantity: {
    type: Number,
    required: true,
    min: 0, // Số lượng tồn không âm
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('WarehouseMaterial', warehouseMaterialSchema);