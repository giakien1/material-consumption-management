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
    type: String,
    ref: 'Product',
    required: true,
  },
  ProductionQuantity: {
    type: Number,
    required: true,
    min: 1, // Số lượng sản xuất phải dương
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProductionOrder', productionOrderSchema);