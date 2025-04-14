const productRouter = require('./productRouter');
const materialRouter = require('./materialRouter');
const employeeRouter = require('./employeeRouter');
const importExportRouter = require('./importExportRouter');
const materialConsumptionRouter = require('./materialConsumptionRouter');
const productOrderRouter = require('./productOrderRouter');
const roleRouter = require('./roleRouter');
const warehouseRouter = require('./warehouseRouter');
const warehouseMaterialRouter = require('./warehouseMaterialRouter');
const consumptionStandardRouter = require('./consumptionStandardRouter');

function route(app) {
    app.use('/api/products', productRouter);
    app.use('/api/materials', materialRouter);
    app.use('/api/employees', employeeRouter);
    app.use('/api/import-exports', importExportRouter);
    app.use('/api/material-consumptions', materialConsumptionRouter);
    app.use('/api/product-orders', productOrderRouter);
    app.use('/api/roles', roleRouter);
    app.use('/api/warehouses', warehouseRouter);
    app.use('/api/warehouse-materials', warehouseMaterialRouter);
    app.use('/api/consumption-standards', consumptionStandardRouter);
    app.use('/api/', productRouter);
  };

module.exports = route;