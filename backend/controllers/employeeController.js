const Employee = require('../models/Employee');
const Role = require('../models/Role'); 

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
            const employee = await Employee.findOne({ EmployeeID: req.params.id })
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
            const { EmployeeId, EmployeeName, RoleID, Password } = req.body;

            // Kiểm tra xem EmployeeId đã tồn tại chưa
            const existingEmployee = await Employee.findOne({ EmployeeID: EmployeeId });
            if(existingEmployee) {
                return res.status(400).json({ message: 'EmployeeId already exists' });
            }

            //Kiểm tra xem RoleID có tồn tại không
            const existingRole = await Role.findOne({ RoleID });
            if(!existingRole) {
                return res.status(400).json({ message: 'RoleID does not exist' });
            }

            const employee = new Employee({ 
                EmployeeID: EmployeeId, 
                EmployeeName, 
                RoleID: existingRole._id,
                Password: Password,
            });
            await employee.save();
            res.status(201).json(employee);
        } catch(error){
            res.status(400).json({message: error.message});
        }
    },

    async updateEmployee(req, res) {
        try {
            const { EmployeeName, RoleID, Password } = req.body;
    
            // Tìm Role theo RoleID nếu client gửi "R001" thay vì ObjectId
            const role = await Role.findOne({ RoleID });
            if (!role) {
                return res.status(400).json({ message: 'RoleID does not exist' });
            }
    
            const employee = await Employee.findOneAndUpdate(
                { EmployeeID: req.params.id },
                {
                    EmployeeName,
                    RoleID: role._id,
                    Password,
                },
                { new: true }
            ).populate('RoleID');
    
            if (!employee) {
                return res.status(404).json({ message: 'Employee not found' });
            }
    
            res.status(200).json(employee);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    

    async deleteEmployee(req, res) {
        try{
            const employee = await Employee.findOneAndDelete({ EmployeeID: req.params.id });
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