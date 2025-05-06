import { Routes, Route } from 'react-router-dom';
import Transaction from '../pages/transactionPage';
import WarehouseMaterial from '../pages/warehouseMaterialPage';
import ConsumptionStandard from '../pages/consumptionStandardPage';
import CreateOrder from '../pages/createOrder';

import UserNavBar from '../components/userNavigationBar';

const UserLayout = ({ onLogout }) => (
  <>
    <UserNavBar onLogout={onLogout}/>
    <Routes>
      <Route path="/transaction" element={<Transaction />} />
      <Route path="/warehouse-materials" element={<WarehouseMaterial />} />
      <Route path="/consumption-standards" element={<ConsumptionStandard />} />
      <Route path="/" element={<CreateOrder />} />
    </Routes>
  </>
);

export default UserLayout;
