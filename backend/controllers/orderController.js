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
    try {
      const { ProductionQuantity, CompletionDate, Status } = req.body;

      const order = await ProductionOrder.findOne({ OrderID: req.params.id });
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const prevStatus = order.Status;

      // Cập nhật đơn
      order.ProductionQuantity = ProductionQuantity;
      order.CompletionDate = CompletionDate;
      order.Status = Status;
      await order.save();

      const reversedStock = [];

      if (prevStatus !== 'InProgress' && Status === 'InProgress') {

        const standards = await ConsumptionStandard.find({ ProductID: order.ProductID });
        console.log("Found standards:", standards.length);

        if (standards.length === 0) {
          console.warn("ConsumptionStandard not found:", order.ProductID);
        }

        for (const standard of standards) {
        // Kiểm tra độ dài mảng MaterialIDs và StandardQuantities phải bằng nhau
        if (standard.MaterialIDs.length !== standard.StandardQuantities.length) {
          continue;
        }

        for (let i = 0; i < standard.MaterialIDs.length; i++) {
          const materialID = standard.MaterialIDs[i];
          const standardQty = standard.StandardQuantities[i];
          const consumedQty = standardQty * ProductionQuantity;

          const wm = await WarehouseMaterial.findOne({
            MaterialID: materialID,
            WarehouseID: order.WarehouseID,
          });

          if (!wm || wm.StockQuantity < consumedQty) {

            // Rollback
            for (const stock of reversedStock) {
              await WarehouseMaterial.updateOne(
                { MaterialID: stock.MaterialID, WarehouseID: stock.WarehouseID },
                { $inc: { StockQuantity: stock.qty } }
              );
            }

            return res.status(400).json({ message: `Not enough material in the warehouse: ${materialID}` });
          }

          // Trừ kho
          wm.StockQuantity -= consumedQty;
          await wm.save();

          reversedStock.push({ MaterialID: materialID, WarehouseID: order.WarehouseID, qty: consumedQty });

          // Tìm bản ghi cuối cùng và tạo StandardID mới
          const lastStandard = await ConsumptionStandard.findOne().sort({ StandardID: -1 });

          let newID = 'STD001';  

          if (lastStandard) {
            const lastStandardID = lastStandard.StandardID;
            const lastNumber = parseInt(lastStandardID.replace('STD', '')) || 0;

            // Increment the number to generate a new ID
            let newNumber = lastNumber + 1;
            newID = 'STD' + newNumber.toString().padStart(3, '0');

            // Ensure unique ConsumptionID
            let existingConsumption = await MaterialConsumption.findOne({ ConsumptionID: newID });
            while (existingConsumption) {
              newNumber++; // Increment the number if the ID already exists
              newID = 'STD' + newNumber.toString().padStart(3, '0');
              existingConsumption = await MaterialConsumption.findOne({ ConsumptionID: newID });
            }
          }

          // Ghi lại tiêu hao
          await MaterialConsumption.create({
            ConsumptionID: newID,
            OrderID: order._id,
            MaterialID: materialID,
            ConsumedQuantity: consumedQty,
            ConsumptionDate: new Date(),
          });
        }
      }
      } else {
        console.log("Không cần trừ vật tư vì trạng thái không chuyển sang In Progress mới.");
      }

      res.status(200).json(order);
    } catch (error) {
      console.error("Error when updating order:", error);
      res.status(400).json({ message: error.message });
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
