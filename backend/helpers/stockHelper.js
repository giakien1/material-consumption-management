const WarehouseMaterial = require('../models/WarehouseMaterial');

async function updateStock(materialId, warehouseId, type, qty) {
  const wm = await WarehouseMaterial.findOne({ MaterialID: materialId, WarehouseID: warehouseId });

  if (!wm) {
    throw new Error('Không tìm thấy vật tư trong kho.');
  }

  if (type === 'Export') {
    if (wm.StockQuantity < qty) {
      throw new Error('Không đủ hàng trong kho để xuất.');
    }
    wm.StockQuantity -= qty;
  } else if (type === 'Import') {
    wm.StockQuantity += qty;
  } else {
    throw new Error('Loại giao dịch không hợp lệ.');
  }

  await wm.save();
}

module.exports = {
  updateStock,
};
