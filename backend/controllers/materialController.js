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
            const { page = 1, size = 5 } = req.query; // Lấy số trang và kích thước, mặc định size=10
            const limit = parseInt(size); // Số lượng đơn sản xuất trên mỗi trang
            const skip = (page - 1) * limit; // Bỏ qua các đơn đã lấy từ các trang trước
            const materials = await Material.find()
                .skip(skip)
                .limit(limit);

            const totalMaterials = await Material.countDocuments(); // Tổng số đơn sản xuất
            const totalPages = Math.ceil(totalMaterials / limit); // Tính số trang
              
            res.status(200).json({
                materials,
                totalPages,
                currentPage: parseInt(page),
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Lấy chi tiết vật tư theo ID
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

    async getMaterialByName(req,res) {
        try {
            const { keyword } = req.params;
            const materials = await Material.find({ MaterialName: { $regex: keyword, $options: 'i' } })

            if (materials.length === 0) {
                return res.status(404).json({ message: 'Material not found' });
            }

            res.status(200).json(materials);
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

module.exports = materialController;