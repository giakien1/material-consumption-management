const productRouter = require('./productRouter');
const materialRouter = require('./materialRouter');
const employeeRouter = require('./employeeRouter');
const importExportRouter = require('./importExportRouter');
const materialConsumptionRouter = require('./materialConsumptionRouter');
const roleRouter = require('./roleRouter');
const warehouseRouter = require('./warehouseRouter');
const warehouseMaterialRouter = require('./warehouseMaterialRouter');
const consumptionStandardRouter = require('./consumptionStandardRouter');
const orderRouter = require('./orderRouter');
const authRouter = require('./authRouter');

function route(app) {
    app.use('/api/materials', materialRouter);
    app.use('/api/employees', employeeRouter);
    app.use('/api/import-exports', importExportRouter);
    app.use('/api/material-consumptions', materialConsumptionRouter);
    app.use('/api/roles', roleRouter);
    app.use('/api/warehouses', warehouseRouter);
    app.use('/api/warehouse-materials', warehouseMaterialRouter);
    app.use('/api/consumption-standards', consumptionStandardRouter);
    app.use('/api/products', productRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/orders', orderRouter);
  };

module.exports = route;