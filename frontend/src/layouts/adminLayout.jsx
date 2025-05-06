import { Routes, Route } from 'react-router-dom';
import OrderPage from '../pages/admin/orderPage';
import EmployeePage from '../pages/employeePage';
import RolePage from '../pages/rolePage';
import MaterialPage from '../pages/materialPage';
import WarehousePage from '../pages/warehousePage';
import TransactionPage from '../pages/transactionPage';
import WarehouseMaterialPage from '../pages/warehouseMaterialPage';
import ConsumptionStandardPage from '../pages/consumptionStandardPage';
import ProductPage from '../pages/productPage'; 
import AdminNavBar from '../components/adminNavigationBar';

const AdminLayout = ({ onLogout }) => (
  <>
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
    </Routes>
  </>
);

export default AdminLayout;
