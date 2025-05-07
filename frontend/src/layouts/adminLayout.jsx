import { Routes, Route } from 'react-router-dom';
import OrderPage from '../pages/admin/orderPage';
import EmployeePage from '../pages/admin/employeePage';
import RolePage from '../pages/admin/rolePage';
import MaterialPage from '../pages/admin/materialPage';
import WarehousePage from '../pages/admin/warehousePage';
import TransactionPage from '../pages/transactionPage';
import WarehouseMaterialPage from '../pages/warehouseMaterialPage';
import ConsumptionStandardPage from '../pages/admin/consumptionStandardPage';
import ProductPage from '../pages/admin/productPage'; 
import AdminNavBar from '../components/adminNavigationBar';
import NotFoundPage from '../pages/notFoundPage';

import '../index.css';

const AdminLayout = ({ onLogout }) => (
  <div className='app-content'>
    <AdminNavBar onLogout={onLogout}/>
    <Routes>
      <Route path="/" element={<OrderPage />} />
      <Route path="/employee" element={<EmployeePage />} />
      <Route path="/role" element={<RolePage />} />
      <Route path="/material" element={<MaterialPage />} />
      <Route path="/warehouse" element={<WarehousePage />} />
      <Route path="/admin/orders" element={<OrderPage />} />
      <Route path="/transaction" element={<TransactionPage />} />
      <Route path="/warehouse-materials" element={<WarehouseMaterialPage />} />
      <Route path="/consumption-standard" element={<ConsumptionStandardPage />} />
      <Route path="/orders" element={<OrderPage />} />
      <Route path="/products" element={<ProductPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </div>
);

export default AdminLayout;
