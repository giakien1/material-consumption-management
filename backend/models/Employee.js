const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  EmployeeId: {
    type: String,
    required: true,
    unique: true,
  },
  EmployeeName: {
    type: String,
    required: true,
  },
  RoleID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Employee', employeeSchema);
