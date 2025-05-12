const mongoose = require('mongoose');

const consumptionStandardSchema = new mongoose.Schema({
  StandardID: {
    type: String,
    required: true,
    unique: true,
  },
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  MaterialIDs: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true,
  }],
  StandardQuantities: [{  
    type: Number,
    required: true,
    min: 0, // Định mức không âm
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('ConsumptionStandard', consumptionStandardSchema);