const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const Role = require('../models/Role');

const authController = {
    async login(req,res) {
        const { employeeID, password } = req.body;
        try {
            // Kiểm tra xem người dùng có tồn tại không
            const employee = await Employee.findOne({ employeeID }).populate('RoleID');
            if (!employee) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }
            const isMatch = await employee.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            // Tạo token
            const token = jwt.sign({ id: employee._id }, process.env.JWT_SECRET, {
                expiresIn: '1d', // Token hết hạn sau 1 ngày
            });

            res.status(200).json({
                token,
                user: {
                    id: employee._id,
                    name: employee.EmployeeName,
                    role: employee.RoleID.RoleName,
                },
            });
        } catch(error) {
            res.status(500).json({ message: error.message });
        }
    },
}

module.exports = authController