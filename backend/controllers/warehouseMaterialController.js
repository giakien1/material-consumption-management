const WarehouseMaterial = require('../models/warehouseMaterialModel');
const Warehouse = require('../models/warehouseModel');
const Material = require('../models/materialModel');

const warehouseMaterialController = {
    async getWarehouseMaterials(req, res) {
        try {
            const warehouseMaterials = await WarehouseMaterial.find()
                .populate('WarehouseID')
                .populate('MaterialID');
            res.status(200).json(warehouseMaterials);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching warehouse materials', error });
        }
    },

    async getWarehouseMaterialById(req, res) {
        try {
            const { warehouseID, materialID } = req.params;
            const warehouseMaterial = await WarehouseMaterial.findOne({ 
                WarehouseID: warehouseID,
                MaterialID: materialID 
            })
                .populate('WarehouseID')
                .populate('MaterialID');
            if (!warehouseMaterial) {
                return res.status(404).json({ message: 'Warehouse material not found' });
            }
            res.status(200).json(warehouseMaterial);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching warehouse material', error });
        }
    },

    async createWarehouseMaterial(req, res) {
        try{
            const{ WarehouseID, MaterialID, StockQuantity } = req.body;
            const existingWarehouseMaterial = await WarehouseMaterial.findOne({ WarehouseID, MaterialID });
            
            if(existingWarehouseMaterial){
                return res.status(400).json({ message: 'Warehouse material already exists' });
            }

            const warehouse = await Warehouse.findOne({ WarehouseID });
            if(!warehouse){
                return res.status(400).json({ message: 'Warehouse not found' });
            }

            const material = await Material.findOne({ MaterialID });
            if(!material){
                return res.status(400).json({ message: 'Material not found' });
            }

            const warehouseMaterial = new WarehouseMaterial({
                WarehouseID,
                MaterialID,
                StockQuantity,
            });
            await warehouseMaterial.save();
        } catch (error) {
            res.status(500).json({ message: 'Error creating warehouse material', error });
        }
    },

    async updateWarehouseMaterial(req, res) {
        try{
            const { StockQuantity } = req.body;
            const warehouseMaterial = await WarehouseMaterial.findOne({ 
                WarehouseID: req.params.warehouseID,
                MaterialID: req.params.materialID 
            });

            if (!warehouseMaterial) {
                return res.status(404).json({ message: 'Warehouse material not found' });
            }

            const newWarehouseMaterial = await WarehouseMaterial.findOne(
                { WarehouseID: req.params.warehouseID, MaterialID: req.params.materialID },
                { StockQuantity },
                { new: true }
            );
            await warehouseMaterial.save();
            res.status(200).json({ message: 'Warehouse material updated successfully', warehouseMaterial });
        } catch (error) {
            res.status(500).json({ message: 'Error updating warehouse material', error });
        }
    },

    async deleteWarehouseMaterial(req, res) {
        try{
            const { warehouseID, materialID } = req.params;
            const warehouseMaterial = await WarehouseMaterial.findOneAndDelete({ 
                WarehouseID: warehouseID,
                MaterialID: materialID 
            });

            if (!warehouseMaterial) {
                return res.status(404).json({ message: 'Warehouse material not found' });
            }
            res.status(200).json({ message: 'Warehouse material deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting warehouse material', error });
        }
    }
}
module.exports = warehouseMaterialController;