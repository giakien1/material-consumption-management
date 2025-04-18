const ConsumptionStandard = require('../models/ConsumptionStandard');
const Product = require('../models/Product');
const Material = require('../models/Material');

const consumptionStandardController = {
    async getConsumptionStandards(req, res) {
        try {
            const consumptionStandards = await ConsumptionStandard.find()
                .populate('product')
                .populate('material');
            res.status(200).json(consumptionStandards);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching consumption standards', error });
        }
    },

    async getConsumptionStandardById(req, res) {
        try {
            const consumptionStandard = await ConsumptionStandard.findOne({StandardID: req.params.id})
                .populate('product')
                .populate('material');
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
            const { StandardID, ProductID, MaterialID, StandardQuantity } = req.body;
            const existingStandard = await ConsumptionStandard.findOne({ StandardID });

            if (existingStandard) {
                return res.status(400).json({ message: 'Consumption standard already exists' });
            }

            const product = await Product.findOne({ ProductID });
            if (!product) {
                return res.status(400).json({ message: 'Product not found' });
            }

            const material = await Material.findOne({ MaterialID });
            if (!material) {
                return res.status(400).json({ message: 'Material not found' });
            }

            const standard = new ConsumptionStandard({
                StandardID,
                ProductID,
                MaterialID,
                StandardQuantity,
            });
            await standard.save();
            res.status(201).json({ message: 'Consumption standard created successfully', standard });
        } catch (error) {
            res.status(500).json({ message: 'Error creating consumption standard', error });
        }
    },

    async updateConsumptionStandard(req, res) {
        try{
            const { ProductID, MaterialID, StandardQuantity } = req.body;
            const consumptionStandard = await ConsumptionStandard.findOne({ StandardID: req.params.id });

            if (!consumptionStandard) {
                return res.status(404).json({ message: 'Consumption standard not found' });
            }

            const product = await Product.findOne(ProductID);
            if (!product) {
                return res.status(400).json({ message: 'Product not found' });
            }

            const material = await Material.findOne(MaterialID);
            if (!material) {
                return res.status(400).json({ message: 'Material not found' });
            }

            const standard = await ConsumptionStandard.findOneAndUpdate(
                { StandardID: req.params.id },
                { ProductID, MaterialID, StandardQuantity },
                { new: true }
            );
            
            if(!standard) {
                return res.status(404).json({ message: 'Consumption standard not found' });
            }
            await consumptionStandard.save();
            res.status(200).json({ message: 'Consumption standard updated successfully', consumptionStandard });
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