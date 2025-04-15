const Role = require('../models/Role');

const roleController = {
    // Tạo vai trò mới
    async createRole(req, res) {
        try {
            const { RoleID, RoleName, Description } = req.body;

            // Kiểm tra RoleID đã tồn tại chưa
            const existingRole = await Role.findOne({ RoleID });
            if (existingRole) {
                return res.status(400).json({ message: 'RoleID already exists' });
            }

            const role = new Role({ RoleID, RoleName, Description });
            await role.save();
            res.status(201).json(role);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Lấy danh sách vai trò
    async getRoles(req, res) {
        try {
            const roles = await Role.find();
            res.status(200).json(roles);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Lấy chi tiết vai trò theo RoleID
    async getRoleById(req, res) {
        try {
            const role = await Role.findOne({ RoleID: req.params.id });
            if (!role) {
                return res.status(404).json({ message: 'Role not found' });
            }
            res.status(200).json(role);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Cập nhật vai trò
    async updateRole(req, res) {
        try {
            const { RoleName } = req.body;
            const role = await Role.findOneAndUpdate(
                { RoleID: req.params.id },
                { RoleName, Description },
                { new: true }
            );
            if (!role) {
                return res.status(404).json({ message: 'Role not found' });
            }
            res.status(200).json(role);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Xóa vai trò
    async deleteRole(req, res) {
        try {
            const role = await Role.findOneAndDelete({ RoleID: req.params.id });
            if (!role) {
                return res.status(404).json({ message: 'Role not found' });
            }
            res.status(200).json({ message: 'Role deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
}
module.exports = roleController;