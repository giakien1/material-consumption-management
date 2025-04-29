import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import NavigationBar from './components/navigationBar';
import ProductPage from './components/productPage';
import EmployeePage from './components/employeePage';
import RolePage from './components/rolePage';
import MaterialPage from './components/materialPage';
import WarehousePage from './components/warehousePage';
import Transaction from './components/transactionPage';
import WarehouseMaterial  from './components/warehouseMaterialPage';
import ConsumptionStandard from './components/consumptionStandard';

function App() {
  return (
    <Router>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<ProductPage />} />
          <Route path="/employee" element={<EmployeePage />} />
          <Route path="/role" element={<RolePage />} />
          <Route path="/material" element={<MaterialPage />} />
          <Route path="/warehouse" element={<WarehousePage />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/warehouse-materials" element={<WarehouseMaterial />} />
          <Route path="/consumption-standard" element={<ConsumptionStandard />} />
        </Routes>
    </Router>
  );
}

export default App;
