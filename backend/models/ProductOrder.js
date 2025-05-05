const mongoose = require('mongoose');

const productionOrderSchema = new mongoose.Schema({
  OrderID: {
    type: String,
    required: true,
    unique: true,
  },
  CreationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  CompletionDate: {
    type: Date,
  },
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  ProductionQuantity: {
    type: Number,
    required: true,
    min: 1, // Số lượng sản xuất phải dương
  },
  WarehouseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },  
  Status: {
    type: String,
    enum: ['Pending', 'InProgress', 'Completed', 'Cancelled'],
    default: 'Pending',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProductionOrder', productionOrderSchema);