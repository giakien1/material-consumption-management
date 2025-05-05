const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  EmployeeID: {
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
  Password: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

// Mã hóa mật khẩu trước khi lưu vào database
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// So sánh mật khẩu khi đăng nhập
employeeSchema.methods.comparePassword = async function(inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema);
