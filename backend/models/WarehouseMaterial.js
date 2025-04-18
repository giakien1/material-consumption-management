const mongoose = require('mongoose');
const Warehouse = require('./Warehouse');

const warehouseMaterialSchema = new mongoose.Schema({
  WarehouseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true,
  },
  MaterialID: {
    type: mongoose.Schema.Types.ObjectId,
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

warehouseMaterialSchema.index({ WarehouseID: 1, MaterialID: 1 }, { unique: true });

module.exports = mongoose.model('WarehouseMaterial', warehouseMaterialSchema);