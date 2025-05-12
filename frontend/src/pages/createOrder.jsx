import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Pagination,
} from 'react-bootstrap';

const ProductionOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [orderID, setOrderID] = useState('');

  const [productID, setProductID] = useState('');
  const [productionQuantity, setProductionQuantity] = useState(1);

  const [warehouses, setWarehouses] = useState([]);
  const [warehouseID, setWarehouseID] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchWarehouses();
  }, [currentPage]);

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      console.log('Warehouses API Response:', res.data); // Log the response to inspect the structure

      if (Array.isArray(res.data.warehouses)) {
        setWarehouses(res.data.warehouses);
      } else {
        console.warn('Warehouses data is not an array:', res.data);
        setWarehouses([]); // Set to empty array if the data is not in the expected format
        setMessage({ type: 'danger', text: 'Failed to load warehouses.' });
      }
    } catch (err) {
      console.error('Error when fetching the warehouse:', err.message);
      setWarehouses([]); // Set to empty array in case of an error
      setMessage({ type: 'danger', text: 'Failed to load warehouses.' });
    }
  };


  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders', {
        params: {
          page: currentPage,
          size: pageSize, 
        },
      });
      console.log('Orders API Response:', res.data);
      if (Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages || 1);
      } else {
        console.warn('Orders data is not an array:', res.data);
        setOrders([]);
        setTotalPages(1);
        setMessage({ type: 'danger', text: 'Failed to load orders.' });
      }
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      setOrders([]);
      setTotalPages(1);
      setMessage({ type: 'danger', text: 'Failed to load orders.' });
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', {
        params: {
          page: 1,
          size: 100, 
        },
      });
      console.log('Products API Response:', res.data);
      if (Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        console.warn('Products data is not an array:', res.data);
        setProducts([]);
        setMessage({ type: 'danger', text: 'Failed to load products.' });
      }
    } catch (err) {
      console.error('Error fetching products:', err.message);
      setProducts([]);
      setMessage({ type: 'danger', text: 'Failed to load products.' });
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post('/orders', {
        OrderID: orderID,
        ProductID: productID,
        WarehouseID: warehouseID,
        ProductionQuantity: parseInt(productionQuantity),
        Status: 'Pending', // Tạo mới luôn để Pending
      });

      setMessage({ type: 'success', text: 'Tạo đơn sản xuất thành công!' });
      setOrderID('');
      setProductID('');
      setProductionQuantity(1);
      fetchOrders();
      setShowModal(false); // đóng modal sau khi tạo thành công
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Đã xảy ra lỗi.',
      });
    }

    setLoading(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mt-4">
      <h3>Order</h3>

      <Button className="mb-3" onClick={() => setShowModal(true)}>
        + Create Order
      </Button>

      {/* Bảng danh sách đơn */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>OrderID</th>
            <th>Products</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Material From</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.OrderID}</td>
              <td>{o.ProductID?.ProductName || 'N/A'}</td>
              <td>{o.ProductionQuantity}</td>
              <td>{o.Status}</td>
              <td>{o.WarehouseID?.WarehouseName || 'N/A'}</td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination>
        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        />
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

      {/* Modal tạo đơn */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && <Alert variant={message.type}>{message.text}</Alert>}

          <Form onSubmit={handleCreateOrder}>

            <Form.Group className="mb-3">
              <Form.Label>Product Using</Form.Label>
              <Form.Select
                value={productID}
                onChange={(e) => setProductID(e.target.value)}
                required
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.ProductName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={productionQuantity}
                onChange={(e) => setProductionQuantity(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Warehouse</Form.Label>
              <Form.Select
                value={warehouseID}
                onChange={(e) => setWarehouseID(e.target.value)}
                required
              >
                <option value="">-- Choose Warehouse --</option>
                {Array.isArray(warehouses) && warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.WarehouseName}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Create'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductionOrderPage;
