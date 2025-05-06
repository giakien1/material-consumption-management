const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
  password: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

// Mã hóa mật khẩu trước khi lưu vào database
employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); 
  try {
    const hashed = await bcrypt.hash(this.password, 10);
    this.password = hashed;
    next();
  } catch (err) {
    next(err);
  }
});

// So sánh mật khẩu khi đăng nhập
employeeSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema);
