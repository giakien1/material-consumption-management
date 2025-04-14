const Employee = require('../models/Employee');

const EmployeeController = {
    async getEmployees(req, res) {
        try{
            const employees = await Employee.find()
            .populate('RoleID')
            res.status(200).json(employees);
        } catch(error){
            res.status(500).json({message: error.message});
        }
    },

    async getEmployeeById(req, res) {
        try{
            const employee = await Employee.findOne({ EmployeeId: req.params.id })
                .populate('RoleID')
            if(!employee){
                return res.status(404).json({message: 'Employee not found'});
            }
            res.status(200).json(employee);
        } catch(error){
            res.status(500).json({message: error.message});
        }
    },

    async createEmployee(req, res) {
        try{
            const { EmployeeId, EmployeeName, RoleID } = req.body;

            // Kiểm tra xem EmployeeId đã tồn tại chưa
            const existingEmployee = await Employee.findOne({ EmployeeId });
            if(existingEmployee) {
                return res.status(400).json({ message: 'EmployeeId already exists' });
            }

            // Kiểm tra xem RoleID có tồn tại trong bảng Role không            
            const employee = new Employee({ 
                EmployeeId, 
                EmployeeName, 
                RoleID,
            });
            await employee.save();
            res.status(201).json(employee);
        } catch(error){
            res.status(400).json({message: error.message});
        }
    },

    async updateEmployee(req, res) {
        try{
            const { EmployeeName, RoleID } = req.body;
            const employee = await Employee.findOneAndUpdate(
                { EmployeeId: req.params.id },
                { EmployeeName, RoleID },
                { new: true }
            );
            if(!employee){
                return res.status(404).json({message: 'Employee not found'});
            }
            res.status(200).json(employee);
        } catch(error){
            res.status(400).json({message: error.message});
        }
    },

    async deleteEmployee(req, res) {
        try{
            const employee = await Employee.findOneAndDelete({ EmployeeId: req.params.id });
            if(!employee){
                return res.status(404).json({message: 'Employee not found'});
            }
            res.status(200).json({message: 'Employee deleted successfully'});
        } catch(error){
            res.status(500).json({message: error.message});
        }
    }
}
module.exports = EmployeeController;