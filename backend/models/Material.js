const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  MaterialID: {
    type: String,
    required: true,
    unique: true,
  },
  MaterialName: {
    type: String,
    required: true,
  },
  Unit: {
    type: String,
    required: true, // Ví dụ: kg, liter, piece
  },
  UnitPrice: {
    type: Number,
    required: true,
    min: 0, // Giá không âm
  },
  Quantity: {
    type: Number,
    required: true,
    min: 0, // Số lượng không âm
  },
}, {
  timestamps: true, 
});

module.exports = mongoose.model('Material', materialSchema);
