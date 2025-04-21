const mongoose = require('mongoose');

const importExportSchema = new mongoose.Schema({
  TransactionID: {
    type: String,
    required: true,
    unique: true,
  },
  WarehouseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true,
  },
  TransactionType: {
    type: String,
    required: true,
    enum: ['Import', 'Export'], // Chỉ chấp nhận Import hoặc Export
  },
  TransactionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  EmployeeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  MaterialsUsed: [
    {
      MaterialID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
        required: true,
      },
      Quantity: {
        type: Number,
        required: true,
        min: 0,
      }
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('ImportExport', importExportSchema);