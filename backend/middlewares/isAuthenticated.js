const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Token lấy từ header "Authorization: Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm nhân viên theo id trong token
    const employee = await Employee.findById(decoded.id).populate('RoleID');
    if (!employee) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Gán nhân viên vào request để middleware sau dùng
    req.user = {
      id: employee._id,
      role: employee.RoleID.RoleName,
      name: employee.EmployeeName,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
};

module.exports = { isAuthenticated };
