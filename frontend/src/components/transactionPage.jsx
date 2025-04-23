import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from '../api';

const ImportExportPage = () => {
  const [transactions, setTransactions] = useState([]); 
  const [warehouses, setWarehouses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    TransactionType: '',
    MaterialsUsed: [],
    WarehouseId: '',
    EmployeeId: '',
    TransactionDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchTransactions();
    fetchWarehouses();
    fetchEmployees();
    fetchMaterials();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/import-exports');
      console.log(response.data);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api
      .post('/import-exports', formData)
      .then((response) => {
        toast.success(`Giao dịch ${response.data.transaction.TransactionType} thành công!`);
        setTransactions([...transactions, response.data.transaction]);
        setShowModal(false);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
      });
  };

  const handleAddMaterial = () => {
    if (selectedMaterial && quantity > 0) {
      const material = materials.find((m) => m.MaterialID === selectedMaterial);
      if (material) {
        setFormData((prevState) => ({
          ...prevState,
          MaterialsUsed: [
            ...prevState.MaterialsUsed,
            { MaterialID: material.MaterialID, Quantity: quantity },
          ],
        }));
        setSelectedMaterial('');
        setQuantity(1);
      }
    } else {
      toast.error('Chưa chọn vật liệu hoặc số lượng không hợp lệ!');
    }
  };

  const handleFormChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleCloseModal = () => {
    setFormData({
      TransactionType: '',
      MaterialsUsed: [],
      WarehouseId: '',
      EmployeeId: '',
      TransactionDate: new Date().toISOString().split('T')[0],
    });
    setSelectedMaterial('');
    setQuantity(1);
    setShowModal(false);
  };
   

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'TransactionID',
    },
    {
      title: 'Transaction Type',
      dataIndex: 'TransactionType',
    },
    {
      title: 'Transaction Date',
      dataIndex: 'TransactionDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Warehouse',
      dataIndex: 'WarehouseID',
      render: (warehouseId) => {
        const warehouse = warehouses.find((w) => w._id === warehouseId);
        return warehouse ? warehouse.WarehouseName : '';
      },
    },
    {
      title: 'Employee',
      dataIndex: 'EmployeeID',
      render: (employeeId) => {
        const employee = employees.find((e) => e._id === employeeId);
        return employee ? employee.EmployeeName : '';
      },
    },
  ];

  return (
    <div>
      <h2>Import/Export Transaction Management</h2>

      <Button variant="primary" onClick={() => setShowModal(true)}>
        Tạo giao dịch
      </Button>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Transaction Type</th>
            <th>Transaction Date</th>
            <th>Warehouse</th>
            <th>Employee</th>
            <th>Materials Used</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.TransactionID}>
              <td>{transaction.TransactionID}</td>
              <td>{transaction.TransactionType}</td>
              <td>{new Date(transaction.TransactionDate).toLocaleDateString()}</td>
              <td>{transaction.WarehouseID?.WarehouseName}</td>
              <td>{transaction.EmployeeID?.EmployeeName}</td>
              <td>
                <ul>
                  {transaction.MaterialsUsed.map((item, idx) => (
                    <li key={idx}>
                      {item.MaterialID?.MaterialName || item.MaterialID} - {item.Quantity}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal Tạo Giao Dịch */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col sm={6}>
                <Form.Group controlId="formType">
                  <Form.Label>Transaction Type</Form.Label>
                  <Form.Control
                    as="select"
                    value={formData.TransactionType}
                    onChange={(e) => handleFormChange('TransactionType', e.target.value)}
                    required
                  >
                    <option value="">Choose Transaction Type</option>
                    <option value="import">Import</option>
                    <option value="export">Export</option>
                  </Form.Control>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group controlId="formWarehouse">
                  <Form.Label>Warehouse</Form.Label>
                  <Form.Control
                    as="select"
                    value={formData.WarehouseId}
                    onChange={(e) => handleFormChange('WarehouseId', e.target.value)}
                    required
                  >
                    <option value="">Choose Warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse._id} value={warehouse._id}>
                        {warehouse.WarehouseName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group controlId="formEmployee">
                  <Form.Label>Nhân viên</Form.Label>
                  <Form.Control
                    as="select"
                    value={formData.EmployeeId}
                    onChange={(e) => handleFormChange('EmployeeId', e.target.value)}
                    required
                  >
                    <option value="">Choose Employee</option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.EmployeeName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group controlId="formDate">
                  <Form.Label>Transaction Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.TransactionDate}
                    onChange={(e) => handleFormChange('TransactionDate', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col sm={6}>
                <Form.Group controlId="formMaterial">
                  <Form.Label>Material</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                  >
                    <option value="">Choose Material</option>
                    {materials.map((material) => (
                      <option key={material.MaterialID} value={material.MaterialID}>
                        {material.MaterialName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group controlId="formQuantity">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                  />
                </Form.Group>
              </Col>

              <Col sm={12}>
                <Button variant="primary" onClick={handleAddMaterial}>
                  Add Material
                </Button>
              </Col>
            </Row>

            <Button variant="primary" type="submit">
              Create
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <ToastContainer />
    </div>
  );

};

export default ImportExportPage;