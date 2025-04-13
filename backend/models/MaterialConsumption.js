const mongoose = require('mongoose');

const materialConsumptionSchema = new mongoose.Schema({
  ConsumptionID: {
    type: String,
    required: true,
    unique: true,
  },
  OrderID: {
    type: String,
    ref: 'ProductionOrder',
    required: true,
  },
  MaterialID: {
    type: String,
    ref: 'Material',
    required: true,
  },
  ConsumedQuantity: {
    type: Number,
    required: true,
    min: 0, // Số lượng tiêu hao không âm
  },
  ConsumptionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MaterialConsumption', materialConsumptionSchema);
