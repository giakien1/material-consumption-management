import React, { useState, useEffect } from 'react';
import { api } from '../../api';
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
  const [warehouses, setWarehouses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [orderID, setOrderID] = useState('');
  const [productID, setProductID] = useState('');
  const [productionQuantity, setProductionQuantity] = useState(1);
  const [warehouseID, setWarehouseID] = useState('');
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchWarehouses();
  }, [currentPage,pageSize]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders', {
        params: {
          page: currentPage,
          size: pageSize, // Sử dụng 'size' để đồng bộ với backend
        },
      });
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

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      console.log('Warehouses API Response:', res.data);
      if (Array.isArray(res.data)) {
        setWarehouses(res.data);
      } else if (Array.isArray(res.data.warehouses)) {
        setWarehouses(res.data.warehouses);
      } else {
        console.warn('Warehouses data is not an array:', res.data);
        setWarehouses([]);
        setMessage({ type: 'danger', text: 'Failed to load warehouses.' });
      }
    } catch (err) {
      console.error('Error fetching warehouses:', err.message);
      setWarehouses([]);
      setMessage({ type: 'danger', text: 'Failed to load warehouses.' });
    }
  };

  const handleSaveOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (editingOrder) {
        await api.put(`/orders/${editingOrder.OrderID}`, {
          ProductID: productID,
          ProductionQuantity: parseInt(productionQuantity),
          Status: status,
          WarehouseID: warehouseID,
        });
        setMessage({ type: 'success', text: 'Order updated succesfully' });
      } else {
        await api.post('/orders', {
          ProductID: productID,
          WarehouseID: warehouseID,
          ProductionQuantity: parseInt(productionQuantity),
          Status: 'Pending',
        });
        setMessage({ type: 'success', text: 'Order created succesfully!' });
      }

      setOrderID('');
      setProductID('');
      setProductionQuantity(1);
      setWarehouseID('');
      setStatus('Pending');
      setEditingOrder(null);
      fetchOrders();
      setShowModal(false);
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Something wrong when creating the order.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setOrderID(order.OrderID);
    setProductID(order.ProductID?._id || order.ProductID);
    setProductionQuantity(order.ProductionQuantity);
    setWarehouseID(order.WarehouseID?._id || order.WarehouseID);
    setStatus(order.Status || 'Pending');
    setShowModal(true);
  };

  const handleDeleteOrder = async (orderID) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;

    try {
      await api.delete(`/orders/${orderID}`);
      setMessage({ type: 'success', text: 'Deleted successfully!' });
      fetchOrders();
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Something went wrong when deleting the order.',
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOrder(null);
    setOrderID('');
    setProductID('');
    setProductionQuantity(1);
    setWarehouseID('');
    setStatus('Pending');
    setMessage(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mt-4">
      <h3>Order</h3>

      {message && (
        <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
          {message.text}
        </Alert>
      )}

      <Button
        className="mb-3"
        onClick={() => {
          setEditingOrder(null);
          setShowModal(true);
        }}
      >
        + Create Order
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>OrderID</th>
            <th>Products</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Material From</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(orders) && orders.length > 0 ? (
            orders.map((o) => (
              <tr key={o._id}>
                <td>{o.OrderID}</td>
                <td>{o.ProductID?.ProductName || 'N/A'}</td>
                <td>{o.ProductionQuantity}</td>
                <td>{o.Status}</td>
                <td>{o.WarehouseID?.WarehouseName || 'N/A'}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditOrder(o)}
                  >
                    Update
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteOrder(o.OrderID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No orders found
              </td>
            </tr>
          )}
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

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingOrder ? 'Updating Order' : 'Create Order'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>  
          <Form onSubmit={handleSaveOrder}>
            <Form.Group className="mb-3">
              <Form.Label>Using Product</Form.Label>
              <Form.Select
                value={productID}
                onChange={(e) => setProductID(e.target.value)}
                required
              >
                <option value="">-- Choose Product --</option>
                {Array.isArray(products) && products.length > 0 ? (
                  products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.ProductName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No products available
                  </option>
                )}
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
              <Form.Label>Kho sản xuất</Form.Label>
              <Form.Select
                value={warehouseID}
                onChange={(e) => setWarehouseID(e.target.value)}
                required
              >
                <option value="">-- Choose Warehouse --</option>
                {Array.isArray(warehouses) && warehouses.length > 0 ? (
                  warehouses.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.WarehouseName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No warehouses available
                  </option>
                )}
              </Form.Select>
            </Form.Group>

            {editingOrder && (
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            )}

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Save'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductionOrderPage;