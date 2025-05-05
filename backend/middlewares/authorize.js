const Employee = require('../models/Employee');
const Role = require('../models/Role');

const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const employee = await Employee.findById(req.user.id).populate('RoleID');
      if (!employee || !allowedRoles.includes(employee.RoleID.RoleName)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Authorization error' });
    }
  };
};

module.exports = { authorizeRoles };
