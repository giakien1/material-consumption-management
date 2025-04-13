const Material = require('../models/Material');

const materialController = {
    // Tạo vật tư mới
    async createMaterial(req, res) {
        try {
          const { MaterialID, MaterialName, Unit, UnitPrice } = req.body;
          
          // Kiểm tra MaterialID đã tồn tại chưa
          const existingMaterial = await Material.findOne({ MaterialID });
          if (existingMaterial) {
            return res.status(400).json({ message: 'MaterialID already exists' });
          }
          const material = new Material({ MaterialID, MaterialName, Unit, UnitPrice });
          await material.save();
          res.status(201).json(material);
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
    },

    // Lấy danh sách vật tư
    async getMaterials(req, res) {
        try {
        const materials = await Material.find();
        res.status(200).json(materials);
        } catch (error) {
        res.status(500).json({ message: error.message });
        }
    },

    // Lấy chi tiết vật tư theo MaterialID
    async getMaterialById(req, res) {
        try {
        const material = await Material.findOne({ MaterialID: req.params.id });
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }
        res.status(200).json(material);
        } catch (error) {
        res.status(500).json({ message: error.message });
        }
    },

    // Cập nhật vật tư
    async updateMaterial(req, res) {
        try {
        const { MaterialName, Unit, UnitPrice } = req.body;
        const material = await Material.findOneAndUpdate(
            { MaterialID: req.params.id },
            { MaterialName, Unit, UnitPrice },
            { new: true }
        );
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }
        res.status(200).json(material);
        } catch (error) {
        res.status(400).json({ message: error.message });
        }
    },

    // Xóa vật tư
    async deleteMaterial(req, res) {
        try {
        const material = await Material.findOneAndDelete({ MaterialID: req.params.id });
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }
        res.status(200).json({ message: 'Material deleted' });
        } catch (error) {
        res.status(500).json({ message: error.message });
        }
    },
}

modele.exports = materialController;