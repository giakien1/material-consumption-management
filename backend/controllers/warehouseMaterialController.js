const WarehouseMaterial = require('../models/WarehouseMaterial');
const Warehouse = require('../models/Warehouse');
const Material = require('../models/Material');

const warehouseMaterialController = {
  // Lấy danh sách tất cả vật tư trong các kho
  async getWarehouseMaterials(req, res) {
    try {
      const warehouseMaterials = await WarehouseMaterial.find()
        .populate({
          path: 'MaterialID',
          select: 'MaterialID MaterialName',
        })
        .populate({
          path: 'WarehouseID',
          select: 'WarehouseID WarehouseName',
        });
      res.status(200).json(warehouseMaterials);
    } catch (error) {
      console.error('Error fetching warehouse materials:', error);
      res.status(500).json({ message: 'Failed to fetch warehouse materials' });
    }
  },

  // Lấy danh sách vật tư trong một kho cụ thể
  async getMaterialsByWarehouse(req, res) {
    try {
      const { warehouseId } = req.params;

      if (!warehouseId) {
        const allMaterials = await WarehouseMaterial.find({})
          .populate('MaterialID', 'MaterialID MaterialName')
          .populate('WarehouseID', 'WarehouseID WarehouseName');
        return res.status(200).json(allMaterials);
      }

      const warehouse = await Warehouse.findOne({ WarehouseID: warehouseId });
      if (!warehouse) {
        return res.status(400).json({ message: 'Warehouse not found' });
      }

      const warehouseMaterials = await WarehouseMaterial.find({ WarehouseID: warehouse._id })
        .populate({
          path: 'MaterialID',
          select: 'MaterialID MaterialName',
        })
        .populate({
          path: 'WarehouseID',
          select: 'WarehouseID WarehouseName',
        });
      res.status(200).json(warehouseMaterials);
    } catch (error) {
      console.error('Error fetching materials by warehouse:', error);
      res.status(500).json({ message: 'Failed to fetch materials in warehouse' });
    }
  },
  
  // Lấy chi tiết tồn kho của một vật tư trong một kho
  async getWarehouseMaterialById(req, res) {
    try {
      const { materialId, warehouseId } = req.params;
      const material = await Material.findOne({ MaterialID: materialId });
      const warehouse = await Warehouse.findOne({ WarehouseID: warehouseId });
      if (!material || !warehouse) {
        return res.status(400).json({ message: 'Material or Warehouse not found' });
      }
      const warehouseMaterial = await WarehouseMaterial.findOne({
        MaterialID: material._id,
        WarehouseID: warehouse._id,
      })
        .populate({
          path: 'MaterialID',
          select: 'MaterialID MaterialName',
        })
        .populate({
          path: 'WarehouseID',
          select: 'WarehouseID WarehouseName',
        });
      if (!warehouseMaterial) {
        return res.status(404).json({ message: 'Warehouse material not found' });
      }
      res.status(200).json(warehouseMaterial);
    } catch (error) {
      console.error('Error fetching warehouse material by ID:', error);
      res.status(500).json({ message: 'Failed to fetch warehouse material' });
    }
  },

  // Thêm vật tư vào kho
  async createWarehouseMaterial(req, res) {
    try {
      const { MaterialID, WarehouseID, StockQuantity } = req.body;
      // Validate input
      if (!MaterialID || !WarehouseID) {
        return res.status(400).json({ message: 'MaterialID and WarehouseID are required' });
      }
      if (StockQuantity === undefined || StockQuantity < 0 || isNaN(StockQuantity)) {
        return res.status(400).json({ message: 'StockQuantity must be a non-negative number' });
      }
      const material = await Material.findOne({ MaterialID });
      const warehouse = await Warehouse.findOne({ WarehouseID });
      if (!material || !warehouse) {
        return res.status(400).json({ message: 'Material or Warehouse not found' });
      }
      const existingWarehouseMaterial = await WarehouseMaterial.findOne({
        MaterialID: material._id,
        WarehouseID: warehouse._id,
      });
      if (existingWarehouseMaterial) {
        return res.status(400).json({ message: 'Material already exists in this warehouse' });
      }
      const warehouseMaterial = new WarehouseMaterial({
        MaterialID: material._id,
        WarehouseID: warehouse._id,
        StockQuantity,
      });
      await warehouseMaterial.save();
      const populatedWarehouseMaterial = await WarehouseMaterial.findOne({
        MaterialID: material._id,
        WarehouseID: warehouse._id,
      })
        .populate({
          path: 'MaterialID',
          select: 'MaterialID MaterialName',
        })
        .populate({
          path: 'WarehouseID',
          select: 'WarehouseID WarehouseName',
        });
      res.status(201).json(populatedWarehouseMaterial);
    } catch (error) {
      console.error('Error creating warehouse material:', error);
      res.status(400).json({ message: 'Failed to create warehouse material' });
    }
  },

  // Cập nhật tồn kho
  async updateWarehouseMaterial(req, res) {
    try {
      const { materialId, warehouseId } = req.params;
      const { StockQuantity } = req.body;
      // Validate input
      if (StockQuantity === undefined || StockQuantity < 0 || isNaN(StockQuantity)) {
        return res.status(400).json({ message: 'StockQuantity must be a non-negative number' });
      }
      const material = await Material.findOne({ MaterialID: materialId });
      const warehouse = await Warehouse.findOne({ WarehouseID: warehouseId });
      if (!material || !warehouse) {
        return res.status(400).json({ message: 'Material or Warehouse not found' });
      }
      const warehouseMaterial = await WarehouseMaterial.findOneAndUpdate(
        { MaterialID: material._id, WarehouseID: warehouse._id },
        { StockQuantity },
        { new: true }
      )
        .populate({
          path: 'MaterialID',
          select: 'MaterialID MaterialName',
        })
        .populate({
          path: 'WarehouseID',
          select: 'WarehouseID WarehouseName',
        });
      if (!warehouseMaterial) {
        return res.status(404).json({ message: 'Warehouse material not found' });
      }
      res.status(200).json(warehouseMaterial);
    } catch (error) {
      console.error('Error updating warehouse material:', error);
      res.status(400).json({ message: 'Failed to update warehouse material' });
    }
  },

  // Xóa vật tư khỏi kho
  async deleteWarehouseMaterial(req, res) {
    try {
      const { materialId, warehouseId } = req.params;
      const material = await Material.findOne({ MaterialID: materialId });
      const warehouse = await Warehouse.findOne({ WarehouseID: warehouseId });
      if (!material || !warehouse) {
        return res.status(400).json({ message: 'Material or Warehouse not found' });
      }
      const warehouseMaterial = await WarehouseMaterial.findOneAndDelete({
        MaterialID: material._id,
        WarehouseID: warehouse._id,
      });
      if (!warehouseMaterial) {
        return res.status(404).json({ message: 'Warehouse material not found' });
      }
      res.status(200).json({ message: 'Warehouse material deleted successfully' });
    } catch (error) {
      console.error('Error deleting warehouse material:', error);
      res.status(500).json({ message: 'Failed to delete warehouse material' });
    }
  },
};

module.exports = warehouseMaterialController;