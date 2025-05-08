const { v4: uuidv4 } = require('uuid');
const ProductionOrder = require('../models/ProductOrder');
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const WarehouseMaterial = require('../models/WarehouseMaterial');
const ConsumptionStandard = require('../models/ConsumptionStandard');
const MaterialConsumption = require('../models/MaterialConsumption');
const mongoose = require('mongoose');

const productionOrderController = {
  // Lấy danh sách đơn sản xuất
  async getOrders(req, res) {
    try {
      const { page = 1, size = 5 } = req.query; // Lấy số trang và kích thước, mặc định size=10
      const limit = parseInt(size); // Số lượng đơn sản xuất trên mỗi trang
      const skip = (page - 1) * limit; // Bỏ qua các đơn đã lấy từ các trang trước
  
      const orders = await ProductionOrder.find()
        .populate('ProductID') 
        .populate('WarehouseID') 
        .skip(skip)
        .limit(limit);
  
      const totalOrders = await ProductionOrder.countDocuments(); // Tổng số đơn sản xuất
      const totalPages = Math.ceil(totalOrders / limit); // Tính số trang
  
      res.status(200).json({
        orders,
        totalPages,
        currentPage: parseInt(page),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Lấy chi tiết đơn sản xuất theo OrderID
  async createOrder(req, res) {
    try {
      const { ProductID, ProductionQuantity, CompletionDate, WarehouseID } = req.body;
      const product = await Product.findById(ProductID);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Kiểm tra xem WarehouseID có tồn tại không 
      const warehouse = await Warehouse.findOne({ _id: WarehouseID });
      if (!warehouse) {
        return res.status(404).json({ message: 'Warehouse not found' });
      }

      const consumotionStandard = await ConsumptionStandard.findOne({ ProductID: product._id });
      if(!consumotionStandard){
        return res.status(404).json({ message: 'Consumption standard have not been created yet!' });
      }
  
      const newOrder = new ProductionOrder({
        OrderID: uuidv4(),
        ProductID,
        WarehouseID, 
        ProductionQuantity,
        CompletionDate,
        Status: 'Pending',
      });
  
      await newOrder.save();
      res.status(201).json(newOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },  

  // Cập nhật đơn sản xuất
  async updateOrder(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const { ProductionQuantity, CompletionDate, Status } = req.body;
  
      const order = await ProductionOrder.findOne({ OrderID: req.params.id }).session(session);
      if (!order) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Production order not found' });
      }
  
      const prevStatus = order.Status;
  
      // Cập nhật đơn
      order.ProductionQuantity = ProductionQuantity;
      order.CompletionDate = CompletionDate;
      order.Status = Status;
      await order.save({ session });
  
      // Nếu chuyển sang "In Progress"
      if (prevStatus !== 'In Progress' && Status === 'In Progress') {
        const standards = await ConsumptionStandard.find({ ProductID: order.ProductID }).session(session);
  
        for (const standard of standards) {
          const consumedQty = standard.StandardQuantity * ProductionQuantity;
  
          // Tìm bản ghi tồn kho của vật tư trong kho (mặc định lấy 1 kho nào đó, hoặc bạn có thể gán WarehouseID cụ thể)
          const wm = await WarehouseMaterial.findOne({
            MaterialID: standard.MaterialID,
            WarehouseID: order.WarehouseID,
          }).session(session);
  
          if (!wm || wm.StockQuantity < consumedQty) {
            await session.abortTransaction();
            return res.status(400).json({ message: `Not enough material in the warehouse: ${standard.MaterialID}` });
          }
  
          // Trừ tồn kho
          wm.StockQuantity -= consumedQty;
          await wm.save({ session });
  
          // Tạo bản ghi tiêu hao
          await MaterialConsumption.create([{
            ConsumptionID: `C${Date.now()}${Math.floor(Math.random() * 1000)}`,
            OrderID: order.OrderID,
            MaterialID: standard.MaterialID,
            ConsumedQuantity: consumedQty,
            ConsumptionDate: new Date(),
          }], { session });
        }
      }
  
      await session.commitTransaction();
      res.status(200).json(order);
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({ message: error.message });
    } finally {
      session.endSession();
    }
  },

  // Xóa đơn sản xuất
  async deleteOrder(req, res) {
    try {
      const deleted = await ProductionOrder.findOneAndDelete(req.params.orderID);
  
      if (!deleted) {
        return res.status(404).json({ message: 'Can not find the Order' });
      }
  
      res.status(200).json({ message: 'Order deleted successfully!' });
    } catch (error) {
      console.error('Lỗi khi xóa đơn sản xuất:', error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  },

  async getOrderById(req, res) {
    try {
      const order = await ProductionOrder.findOne({ OrderID: req.params.id })
        .populate('ProductID')
        .populate('WarehouseID'); 
  
      if (!order) {
        return res.status(404).json({ message: 'Production order not found' });
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
};

module.exports = productionOrderController;
