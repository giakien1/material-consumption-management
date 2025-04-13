const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  WarehouseID: {
    type: String,
    required: true,
    unique: true,
  },
  WarehouseName: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
