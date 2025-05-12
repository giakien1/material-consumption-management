const ConsumptionStandard = require('../models/ConsumptionStandard');
const Product = require('../models/Product');
const Material = require('../models/Material');

const consumptionStandardController = {
    async getConsumptionStandards(req, res) {
        try {
            const { page = 1, size = 5 } = req.query; // Lấy số trang và kích thước, mặc định size=10
            const limit = parseInt(size); // Số lượng đơn sản xuất trên mỗi trang
            const skip = (page - 1) * limit; 

            const consumptionStandards = await ConsumptionStandard.find()
                .populate('ProductID')
                .populate('MaterialIDs')
                .skip(skip)
                .limit(limit);

            const totalCS = await ConsumptionStandard.countDocuments();
            const totalPages = Math.ceil(totalCS/ limit); // Tính số trang

            res.status(200).json({
                consumptionStandards,
                totalPages,
                currentPage: parseInt(page),
            });
        } catch (error) {
            console.error('Error fetching consumption standards', error);
            res.status(500).json({ message: 'Error fetching consumption standards', error });
        }
    },

    async getConsumptionStandardById(req, res) {
        try {
            const consumptionStandard = await ConsumptionStandard.findOne({StandardID: req.params.id})
                .populate('ProductID', 'ProductName')
                .populate('MaterialIDs', 'MaterialName');
            if (!consumptionStandard) {
                return res.status(404).json({ message: 'Consumption standard not found' });
            }
            res.status(200).json(consumptionStandard);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching consumption standard', error });
        }
    },

    async createConsumptionStandard(req, res) {
        try{
            const { ProductID, MaterialIDs, StandardQuantities } = req.body;

            // Kiểm tra xem MaterialIDs có phải là mảng không, nếu không thì ép kiểu thành mảng
            const materialIDsArray = Array.isArray(MaterialIDs) ? MaterialIDs : [MaterialIDs];

            const product = await Product.findOne({ _id: ProductID });
            if (!product) {
                return res.status(400).json({ message: 'Product not found' });
            }
 
            // Kiểm tra xem tất cả các nguyên liệu có tồn tại không
            const materials = await Material.find({ _id: { $in: materialIDsArray  } });
            
            if (materials.length !== materialIDsArray.length) {
                return res.status(400).json({ message: 'Some materials not found' });
            }

            // Map ra danh sách ObjectId để lưu
            const materialObjectIdsDB = materials.map(m => m._id);

            // Tìm bản ghi cuối cùng và tạo StandardID mới
            const lastStandard = await ConsumptionStandard.findOne().sort({ StandardID: -1 });

            let newID = 'STD001';  // Giá trị mặc định khi chưa có bản ghi nào

            if (lastStandard) {
                const lastStandardID = lastStandard.StandardID;
                const lastNumber = parseInt(lastStandardID.replace('STD', ''));

                // Nếu lastNumber là NaN, tức là không có số hợp lệ, thì bắt đầu lại từ 1
                const newNumber = (isNaN(lastNumber) ? 0 : lastNumber) + 1;

                newID = 'STD' + newNumber.toString().padStart(3, '0');
            }

            // Kiểm tra xem bản ghi đã tồn tại chưa
            const existingStandard = await ConsumptionStandard.findOne({
                ProductID: product._id,
                MaterialIDs: { $all: materialObjectIdsDB },
            });

            if (existingStandard) {
                return res.status(400).json({ message: 'This consumption standard already exists' });
            }

            const standard = new ConsumptionStandard({
                StandardID: newID,
                ProductID: product._id,
                MaterialIDs: materialObjectIdsDB,
                StandardQuantities,
            });

            await standard.save();
            res.status(201).json({ message: 'Consumption standard created successfully', standard });
        } catch (error) {
            res.status(500).json({ message: 'Error creating consumption standard', error });
            console.log(error);
        }
    },

    async updateConsumptionStandard(req, res) {
        try{
            const { ProductID, MaterialIDs, StandardQuantities } = req.body;
            const consumptionStandard = await ConsumptionStandard.findOne({ StandardID: req.params.id });

            if (!consumptionStandard) {
                return res.status(404).json({ message: 'Consumption standard not found' });
            }

            const product = await Product.findOne({ ProductID });
            if (!product) {
                return res.status(400).json({ message: 'Product not found' });
            }

            // Kiểm tra xem tất cả các nguyên liệu có tồn tại không
            const materials = await Material.find({ '_id': { $in: MaterialIDs } });
            if (materials.length !== MaterialIDs.length) {
                return res.status(400).json({ message: 'Some materials not found' });
            }

            const standard = await ConsumptionStandard.findOneAndUpdate(
                { StandardID: req.params.id },
                { 
                    ProductID: product._id,
                    MaterialIDs,
                    StandardQuantities 
                },
                { new: true }
            );
            
            if(!standard) {
                return res.status(404).json({ message: 'Consumption standard not found' });
            }
            res.status(200).json({ message: 'Consumption standard updated successfully', standard });
        } catch (error) {
            res.status(500).json({ message: 'Error updating consumption standard', error });
        }
    },

    async deleteConsumptionStandard(req, res) {
        try{
            const consumptionStandard = await ConsumptionStandard.findOneAndDelete({ StandardID: req.params.id });
            if (!consumptionStandard) {
                return res.status(404).json({ message: 'Consumption standard not found' });
            }
            res.status(200).json({ message: 'Consumption standard deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting consumption standard', error });
        }
    }
}
module.exports = consumptionStandardController;