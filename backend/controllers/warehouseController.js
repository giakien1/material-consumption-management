const Warehouse = require('../models/Warehouse');

const warehouseController = {
    async getWarehouses(req, res) {
        try{
            const { page = 1, size = 5 } = req.query; // Lấy số trang và kích thước, mặc định size=10
            const limit = parseInt(size); // Số lượng đơn sản xuất trên mỗi trang
            const skip = (page - 1) * limit; // Bỏ qua các đơn đã lấy từ các trang trước

            const warehouses = await Warehouse.find()
                .skip(skip)
                .limit(limit);

            const totalWarehouses = await Warehouse.countDocuments(); // Tổng số đơn sản xuất
            const totalPages = Math.ceil(totalWarehouses / limit); // Tính số trang
              
            res.status(200).json({
                warehouses,
                totalPages,
                currentPage: parseInt(page),
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async getWarehouseById(req, res) {
        try{
            const warehouse = await Warehouse.findOne({ WarehouseID: req.params.id });
            if (!warehouse) {
                return res.status(404).json({ message: 'Warehouse not found' });
            }
            res.status(200).json(warehouse);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async createWarehouse(req, res) {
        try{
            const { WarehouseID, WarehouseName, Address } = req.body;

            // Kiểm tra xem WarehouseID đã tồn tại chưa
            const existingWarehouse = await Warehouse.findOne({ WarehouseID });
            if (existingWarehouse) {
                return res.status(400).json({ message: 'WarehouseID already exists' });
            }

            const warehouse = new Warehouse({ WarehouseID, WarehouseName, Address });
            await warehouse.save();
            res.status(201).json(warehouse);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Server error' });
        }
    },

    async updateWarehouse(req, res) {
        try{
            const { WarehouseName, Address } = req.body;
            const warehouse = await Warehouse.findOneAndUpdate(
                { WarehouseID: req.params.id },
                { WarehouseName, Address },
                { new: true }
            );
            if (!warehouse) {
                return res.status(404).json({ message: 'Warehouse not found' });
            }
            res.status(200).json(warehouse);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'Server error' });
        }
    },

    async deleteWarehouse(req, res) {
        try{
            const warehouse = await Warehouse.findOneAndDelete({ WarehouseID: req.params.id });
            if (!warehouse) {
                return res.status(404).json({ message: 'Warehouse not found' });
            }
            res.status(200).json({ message: 'Warehouse deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },
}
module.exports = warehouseController;