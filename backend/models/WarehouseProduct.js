const mongoose = require('mongoose');

const warehouseProductSchema = new mongoose.Schema({
    WarehouseID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    ProductID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    StockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
  }, { timestamps: true });
  
  warehouseProductSchema.index({ WarehouseID: 1, ProductID: 1 }, { unique: true });
  
  module.exports = mongoose.model('WarehouseProduct', warehouseProductSchema);
  