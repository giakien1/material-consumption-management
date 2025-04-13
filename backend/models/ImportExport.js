const mongoose = require('mongoose');

const importExportSchema = new mongoose.Schema({
  TransactionID: {
    type: String,
    required: true,
    unique: true,
  },
  MaterialID: {
    type: String,
    ref: 'Material',
    required: true,
  },
  WarehouseID: {
    type: String,
    ref: 'Warehouse',
    required: true,
  },
  TransactionType: {
    type: String,
    required: true,
    enum: ['Import', 'Export'], // Chỉ chấp nhận Import hoặc Export
  },
  Quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  TransactionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  EmployeeID: {
    type: String,
    ref: 'Employee',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ImportExport', importExportSchema);