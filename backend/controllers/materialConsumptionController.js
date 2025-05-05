const MaterialConsumption = require('../models/MaterialConsumption');
const ConsumptionStandard = require('../models/ConsumptionStandard');
const ProductionOrder = require('../models/ProductOrder');

const materialConsumptionController = {
  // Tạo bản ghi tiêu hao vật tư
  async createConsumption(req, res) {
    try {
      const { ConsumptionID, OrderID, MaterialID, ConsumedQuantity, ConsumptionDate } = req.body;
      // Kiểm tra ConsumptionID đã tồn tại chưa
      const existingConsumption = await MaterialConsumption.findOne({ ConsumptionID });
      if (existingConsumption) {
        return res.status(400).json({ message: 'ConsumptionID already exists' });
      }

      // Kiểm tra đơn sản xuất có tồn tại không
      const order = await ProductionOrder.findOne({ OrderID });
      if (!order) {
        return res.status(400).json({ message: 'Production order not found' });
      }

      // Kiểm tra định mức tiêu hao
      const standard = await ConsumptionStandard.findOne({
        ProductID: order.ProductID,
        MaterialID,
      });

      if (standard) {
        const expectedQuantity = standard.StandardQuantity * order.ProductionQuantity;
        if (ConsumedQuantity > expectedQuantity) {
          console.warn(`Warning: Consumed ${ConsumedQuantity} exceeds standard ${expectedQuantity}`);
        }
      }

      // Kiểm tra đủ tồn kho
      if (material.StockQuantity < ConsumedQuantity) {
        await session.abortTransaction();
        return res.status(400).json({ message: 'Not enough stock for material' });
      }

      // Trừ tồn kho
      material.StockQuantity -= ConsumedQuantity;
      await material.save();

      // Tạo bản ghi tiêu hao
      const consumption = new MaterialConsumption({
        ConsumptionID,
        OrderID,
        MaterialID,
        ConsumedQuantity,
        ConsumptionDate,
      });
      await consumption.save();
      res.status(201).json(consumption);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Lấy danh sách tiêu hao
  async getConsumptions(req, res) {
    try {
      const consumptions = await MaterialConsumption.find()
        .populate('OrderID')
        .populate('MaterialID');
      res.status(200).json(consumptions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy chi tiết tiêu hao theo ConsumptionID
  async getConsumptionById(req, res) {
    try {
      const consumption = await MaterialConsumption.findOne({ ConsumptionID: req.params.id })
        .populate('OrderID')
        .populate('MaterialID');
      if (!consumption) {
        return res.status(404).json({ message: 'Consumption not found' });
      }
      res.status(200).json(consumption);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Cập nhật tiêu hao
  async updateConsumption(req, res) {
    try {
      const { ConsumedQuantity, ConsumptionDate } = req.body;
      const consumption = await MaterialConsumption.findOneAndUpdate(
        { ConsumptionID: req.params.id },
        { ConsumedQuantity, ConsumptionDate },
        { new: true }
      );
      if (!consumption) {
        return res.status(404).json({ message: 'Consumption not found' });
      }
      res.status(200).json(consumption);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Xóa tiêu hao
  async deleteConsumption(req, res) {
    try {
      const consumption = await MaterialConsumption.findOneAndDelete({ ConsumptionID: req.params.id });
      if (!consumption) {
        return res.status(404).json({ message: 'Consumption not found' });
      }
      res.status(200).json({ message: 'Consumption deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = materialConsumptionController;