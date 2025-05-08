const Product = require('../models/Product');

const productController = {
    async getProducts(req, res) {
        try {
            const { page = 1, size = 5 } = req.query; // Lấy số trang và kích thước từ query parameters
            const limit = parseInt(size); // Số lượng sản phẩm trên mỗi trang
            const skip = (page - 1) * limit; // Bỏ qua sản phẩm đã lấy từ các trang trước

            const products = await Product.find()
                .skip(skip)
                .limit(limit);

            const totalProducts = await Product.countDocuments(); // Tổng số sản phẩm

            const totalPages = Math.ceil(totalProducts / limit); // Tính số trang
            res.status(200).json({
                products,
                totalPages,
                currentPage: parseInt(page),
              });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async getProductById(req, res) {
        try {
            const product = await Product.findOne({ ProductID: req.params.id });
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async createProduct(req, res) {
        try {
            const { ProductID, ProductName, Description } = req.body;

            // Kiểm tra xem ProductID đã tồn tại chưa
            const existingProduct = await Product.findOne({ ProductID });
            if (existingProduct) {
                return res.status(400).json({ message: 'ProductID already exists' });
            }

            const product = new Product({ ProductID, ProductName, Description });
            await product.save();
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async updateProduct(req, res) {
        try{
            const { ProductName, Description } = req.body;
            const product = await Product.findOneAndUpdate(
                { ProductID: req.params.id },
                { ProductName, Description },
                { new: true }
            );
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json({ message: 'Product updated successfully' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async deleteProduct(req, res) {
        try {
            const product = await Product.findOneAndDelete({ ProductID: req.params.id });
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
}
module.exports = productController;