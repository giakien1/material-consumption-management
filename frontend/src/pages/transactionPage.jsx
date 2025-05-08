import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Row, Col, Container, Pagination } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from '../api';

const ImportExportPage = () => {
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

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
  }, [currentPage, pageSize]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/import-exports', {
        params: {
          page: currentPage,
          pageSize: pageSize,
        },
      });
      if (response.data && response.data.transactions) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.totalPages || 1);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses');
      console.log('Warehouses response:', response); // Log the full response to inspect it
      if (response.data && response.data.warehouses && Array.isArray(response.data.warehouses)) {
        setWarehouses(response.data.warehouses); // Use the 'warehouses' array inside the response object
      } else {
        console.error('Unexpected response format for warehouses:', response.data);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };
  
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      console.log('Employees response:', response); // Log the full response to inspect it
      if (response.data && response.data.employees && Array.isArray(response.data.employees)) {
        setEmployees(response.data.employees); // Use the 'employees' array inside the response object
      } else {
        console.error('Unexpected response format for employees:', response.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };
  
  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      console.log('Materials response:', response); // Log the full response to inspect it
      if (response.data && response.data.materials && Array.isArray(response.data.materials)) {
        setMaterials(response.data.materials); // Use the 'materials' array inside the response object
      } else {
        console.error('Unexpected response format for materials:', response.data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/import-exports', formData);
      toast.success(`Giao dịch ${response.data.transaction.TransactionType} thành công!`);
      setTransactions([...transactions, response.data.transaction]);
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Container className="my-4 d-flex flex-column align-items-center" style={{ maxWidth: '1200px' }}>
      <h2 className="text-center mb-4" style={{color: '#213547'}}>Import/Export Transaction Management</h2>

      <div className="d-flex justify-content-center mb-4">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Create Transaction
        </Button>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover className="mt-3 mx-auto" style={{ maxWidth: '1000px', width: '100%' }}>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Transaction Type</th>
              <th>Transaction Date</th>
              <th>Warehouse</th>
              <th style={{ width: '150px' }}>Employee</th>
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
                <td style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                  {transaction.EmployeeID?.EmployeeName}
                </td>
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
      </div>

      <Pagination>
        <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        />
      </Pagination>

      {/* Modal Tạo Giao Dịch */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
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
                  <Form.Label>Employee</Form.Label>
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

              <Col sm={12} className="mt-3">
                <Button variant="primary" onClick={handleAddMaterial}>
                  Add Material
                </Button>
              </Col>
            </Row>

            <Button variant="primary" type="submit" className="mt-3">
              Create
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <ToastContainer />
    </Container>
  );
};

export default ImportExportPage;
