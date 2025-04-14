const ProductOrder = require('../models/productOrderModel');
const Product = require('../models/productModel');

const productOrderController = {
    async createProductOrder(req, res) {
        try{
            const { OrderID, ProductID, OrderQuantity } = req.body;
            if(OrderID){
                return res.status(400).json({ message: 'Order ID already exists' });
            }
            
            const existingOrder = await Order.fineOne({ OrderID });
            if(existingOrder){
                return res.status(400).json({ message: 'Order ID already exists' });
            }

            const existingProduct = await Product.findOne({ ProductID });
            if(!existingProduct){
                return res.status(400).json({ message: 'Product not found' });
            }
            
            const productOrder = new ProductOrder({
                OrderID,
                ProductID,
                OrderQuantity,
            });
            await productOrder.save();
            res.status(201).json({ message: 'Product order created successfully', productOrder });
        } catch(error){
            res.status(500).json({ message: 'Error fetching Product Order' });
        }
    },

    async getProductOrderById(req, res) {
        try{
            const productOrder = await ProductOrder.findOne({OrderID: req.params.id});
            if(!productOrder){
                return res.status(404).json({ message: 'Product order not found' });
            }
            res.status(200).json(productOrder);
        } catch(error){
            res.status(500).json({ message: 'Error fetching Product Order' });
        }
    },

    async getProductOrders(req, res) {
        try{
            const productOrders = await ProductOrder.find();
            res.status(200).json(productOrders);
        } catch(error){
            res.status(500).json({ message: 'Error fetching Product Orders' });
        }
    },

    async updateProductOrder(req, res) {
        try{
            const { ProductID, OrderQuantity } = req.body;
            const productOrder = await ProductOrder.findOne({ OrderID: req.params.id });

            if(!productOrder){
                return res.status(404).json({ message: 'Product order not found' });
            }

            const product = await Product.findOne({ ProductID });
            if(!product){
                return res.status(400).json({ message: 'Product not found' });
            }
            
            newProductOrder = await ProductOrder.findOneAndUpdate(
                { OrderID: req.params.id }, 
                { ProductID, OrderQuantity },
                { new: true });
            await productOrder.save();
            res.status(200).json({ message: 'Product order updated successfully', productOrder });
        } catch(error){
            res.status(500).json({ message: 'Error updating Product Order' });
        }
    },

    async deleteProductOrder(req, res) {
        try{
            const productOrder = await ProductOrder.fineOneAndDelete({ OrderID: req.params.id });
            if(!productOrder){
                return res.status(404).json({ message: 'Product order not found' });
            }
            res.status(200).json({ message: 'Product order deleted successfully' });
        } catch(error){
            res.status(500).json({ message: 'Error deleting Product Order' });
        }
    }
}
module.exports = productOrderController;