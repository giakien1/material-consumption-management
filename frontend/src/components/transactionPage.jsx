import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from '../api';

const ImportExportPage = () => {
  const [transactions, setImportExports] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    Type: 'import',
    MaterialsUsed: [{ MaterialID: '', Quantity: '' }],
    WarehouseId: '',
    EmployeeId: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchImportExports = async () => {
    try {
      const res = await api.get('/import-exports');
      if (Array.isArray(res.data)) {
        setImportExports(res.data);
      } else {
        setImportExports([]);
      }
      console.log('Fetched Import/Export Data:', res.data);
    } catch (error) {
      console.error('Error fetching import/export data:', error);
      setImportExports([]);  // Đảm bảo là mảng trống nếu có lỗi
    }
  };
  
  const fetchMaterials = async () => {
    const res = await api.get('/materials');
    setMaterials(res.data);
  };
  
  const fetchEmployees = async () => {
    const res = await api.get('/employees');
    setEmployees(res.data);
  };
  
  const fetchWarehouses = async () => {
    const res = await api.get('/warehouses');
    setWarehouses(res.data);
  };
  
  const fetchData = async () => {
    try {
      await Promise.all([
        fetchImportExports(),
        fetchMaterials(),
        fetchEmployees(),
        fetchWarehouses(),
      ]);
    } catch (error) {
      toast.error('Failed to fetch data: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleShowAdd = () => {
    setFormData({
      Type: 'import',
      MaterialsUsed: [{ MaterialID: materials.length > 0 ? materials[0].MaterialID : '', Quantity: '' }],
      WarehouseId: warehouses.length > 0 ? warehouses[0].WarehouseID : '',
      EmployeeId: employees.length > 0 ? employees[0].EmployeeID : '',
      transactionDate: new Date().toISOString().split('T')[0],
    });
    setErrors({});
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setFormData({
      Type: 'import',
      MaterialsUsed: [{ MaterialID: '', Quantity: '' }],
      WarehouseId: '',
      EmployeeId: '',
      transactionDate: new Date().toISOString().split('T')[0],
    });
    setErrors({});
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (name.startsWith('MaterialID') || name.startsWith('Quantity')) {
      const updatedMaterials = [...formData.MaterialsUsed];
      if (name.startsWith('MaterialID')) {
        updatedMaterials[index].MaterialID = value;
      } else {
        updatedMaterials[index].Quantity = value;
      }
      setFormData({ ...formData, MaterialsUsed: updatedMaterials });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addMaterial = () => {
    setFormData({
      ...formData,
      MaterialsUsed: [
        ...formData.MaterialsUsed,
        { MaterialID: materials.length > 0 ? materials[0].MaterialID : '', Quantity: '' },
      ],
    });
  };

  const removeMaterial = (index) => {
    const updatedMaterials = formData.MaterialsUsed.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      MaterialsUsed: updatedMaterials.length > 0 ? updatedMaterials : [{ MaterialID: '', Quantity: '' }],
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Type) newErrors.Type = 'Type is required';
    if (!formData.WarehouseId) newErrors.WarehouseId = 'Warehouse is required';
    if (!formData.EmployeeId) newErrors.EmployeeId = 'Employee is required';
    if (!formData.transactionDate) newErrors.Date = 'Date is required';

    // Check for duplicate MaterialID
    const materialIds = formData.MaterialsUsed.map((m) => m.MaterialID);
    const uniqueMaterialIds = new Set(materialIds);
    if (uniqueMaterialIds.size < materialIds.length) {
      newErrors.MaterialsUsed = 'Duplicate MaterialID is not allowed';
    }

    formData.MaterialsUsed.forEach((m, index) => {
      if (!m.MaterialID) newErrors[`MaterialID${index}`] = 'Material is required';
      if (!m.Quantity || parseFloat(m.Quantity) <= 0) {
        newErrors[`Quantity${index}`] = 'Quantity must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    try {
      console.log('Submitting transaction:', formData);
      await api.post('/import-exports', {
        Type: formData.Type,
        MaterialsUsed: formData.MaterialsUsed.map((m) => ({
          MaterialID: m.MaterialID,
          Quantity: parseFloat(m.Quantity),
        })),
        WarehouseId: formData.WarehouseId,
        EmployeeId: formData.EmployeeId,
        transactionDate: formData.transactionDate,
      });
      toast.success('Transaction added successfully');
      handleClose();
      await fetchImportExports();
    } catch (error) {
      console.error('Error saving transaction:', error.response || error);
      toast.error('Failed to save transaction: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (TransactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/import-exports/${TransactionId}`);
        toast.success('Transaction deleted successfully');
        await fetchImportExports();
      } catch (error) {
        toast.error('Failed to delete transaction: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Transaction Management</h2>
      <Button variant="primary" className="mb-3" onClick={handleShowAdd}>
        Add Transaction
      </Button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Type</th>
            <th>Date</th>
            <th>Employee</th>
            <th>Warehouse</th>
            <th>Materials</th>
          </tr>
        </thead>
        <tbody>
        {Array.isArray(transactions) && transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <tr key={index}>
              <td>{transaction.TransactionID}</td>
              <td>{transaction.TransactionType}</td>
              <td>{new Date(transaction.TransactionDate).toLocaleDateString()}</td>
              <td>{transaction.EmployeeID?.EmployeeName || "N/A"}</td>
              <td>{transaction.WarehouseID?.WarehouseName || "N/A"}</td>
              <td>
                {Array.isArray(transaction.MaterialsUsed) && transaction.MaterialsUsed.length === 0 ? (
                  <div>No materials</div>
                ) : (
                  Array.isArray(transaction.MaterialsUsed) && transaction.MaterialsUsed.length > 0 ? (
                    <ul className="mb-0 ps-3">
                      {transaction.MaterialsUsed.map((item, idx) => (
                        <li key={idx}>
                          {item.MaterialID?.MaterialName || "?"} - {item.Quantity} {item.MaterialID?.Unit || ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div>No materials</div> // Trường hợp khi MaterialsUsed là undefined hoặc không phải mảng
                  )
                )}
              </td>

            </tr>
          ))
        ) : (
          <tr><td colSpan="6">No transactions available</td></tr>
        )}
      </tbody>

      </table>


      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formType">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="Type"
                value={formData.Type}
                onChange={(e) => handleInputChange(e)}
                required
              >
                <option value="import">Import</option>
                <option value="export">Export</option>
              </Form.Select>
              {errors.Type && <Form.Text className="text-danger">{errors.Type}</Form.Text>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formWarehouseId">
              <Form.Label>Warehouse</Form.Label>
              <Form.Select
                name="WarehouseId"
                value={formData.WarehouseId}
                onChange={(e) => handleInputChange(e)}
                required
              >
                {warehouses.length === 0 ? (
                  <option value="">No warehouses available</option>
                ) : (
                  warehouses.map((warehouse) => (
                    <option key={warehouse.WarehouseID} value={warehouse.WarehouseID}>
                      {warehouse.WarehouseName || 'Unnamed Warehouse'} ({warehouse.WarehouseID})
                    </option>
                  ))
                )}
              </Form.Select>
              {errors.WarehouseId && <Form.Text className="text-danger">{errors.WarehouseId}</Form.Text>}
            </Form.Group>

            {formData.MaterialsUsed.map((material, index) => (
            <Row key={material.MaterialID || `material-${index}`} className="mb-3">
              <Col xs={5}>
                <Form.Group controlId={`formMaterialID${index}`}>
                  <Form.Label>Material</Form.Label>
                  <Form.Select
                    name={`MaterialID${index}`}
                    value={material.MaterialID}
                    onChange={(e) => handleInputChange(e, index)}
                    required
                  >
                    {materials.length === 0 ? (
                      <option value="">No materials available</option>
                    ) : (
                      materials.map((m) => (
                        <option key={m.MaterialID} value={m.MaterialID}>
                          {m.MaterialName || 'Unnamed Material'} ({m.MaterialID})
                        </option>
                      ))
                    )}
                  </Form.Select>
                  {errors[`MaterialID${index}`] && (
                    <Form.Text className="text-danger">{errors[`MaterialID${index}`]}</Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col xs={4}>
                <Form.Group controlId={`formQuantity${index}`}>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name={`Quantity${index}`}
                    value={material.Quantity}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Enter Quantity"
                    min="0"
                    step="0.01"
                    required
                  />
                  {errors[`Quantity${index}`] && (
                    <Form.Text className="text-danger">{errors[`Quantity${index}`]}</Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col xs={3} className="d-flex align-items-end">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeMaterial(index)}
                  disabled={formData.MaterialsUsed.length === 1}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          ))}
            {errors.MaterialsUsed && (
              <Form.Text className="text-danger d-block mb-3">{errors.MaterialsUsed}</Form.Text>
            )}
            <Button variant="secondary" className="mb-3" onClick={addMaterial}>
              Add Material
            </Button>

            <Form.Group className="mb-3" controlId="formEmployeeId">
              <Form.Label>Employee</Form.Label>
              <Form.Select
                name="EmployeeId"
                value={formData.EmployeeId}
                onChange={(e) => handleInputChange(e)}
                required
              >
                {employees.length === 0 ? (
                  <option value="">No employees available</option>
                ) : (
                  employees.map((employee) => (
                    <option key={employee.EmployeeID} value={employee.EmployeeID}>
                      {employee.EmployeeName || 'Unnamed Employee'} ({employee.EmployeeID})
                    </option>
                  ))
                )}
              </Form.Select>
              {errors.EmployeeId && <Form.Text className="text-danger">{errors.EmployeeId}</Form.Text>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={(e) => handleInputChange(e)}
                required
              />
              {errors.transactionDate && <Form.Text className="text-danger">{errors.transactionDate}</Form.Text>}
            </Form.Group>

            <Button variant="primary" type="submit">
              Add
            </Button>
            <Button variant="secondary" className="ms-2" onClick={handleClose}>
              Cancel
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default ImportExportPage;