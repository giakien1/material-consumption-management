const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  RoleID: {
    type: String,
    required: true,
    unique: true,
  },
  RoleName: {
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

module.exports = mongoose.model('Role', roleSchema);