import { Routes, Route } from 'react-router-dom';
import Transaction from '../pages/transactionPage';
import WarehouseMaterial from '../pages/warehouseMaterialPage';
import CreateOrder from '../pages/createOrder';
import NotFoundPage from '../pages/notFoundPage';

import UserNavBar from '../components/userNavigationBar';

const UserLayout = ({ onLogout }) => (
  <div className='app-content'>
    <UserNavBar onLogout={onLogout}/>
    <Routes>
      <Route path="/transaction" element={<Transaction />} />
      <Route path="/warehouse-materials" element={<WarehouseMaterial />} />
      <Route path="/" element={<CreateOrder />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </div>
);

export default UserLayout;
