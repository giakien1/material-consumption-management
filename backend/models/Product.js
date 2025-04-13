const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  ProductID: {
    type: String,
    required: true,
    unique: true,
  },
  ProductName: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
