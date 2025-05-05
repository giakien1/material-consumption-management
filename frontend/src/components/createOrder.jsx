import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
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

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
      try {
        const res = await api.get('/warehouses');
        setWarehouses(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách kho:', err.message);
      }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy đơn sản xuất:', err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy sản phẩm:', err.message);
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

  return (
    <div className="container mt-4">
      <h3>Đơn Sản Xuất</h3>

      <Button className="mb-3" onClick={() => setShowModal(true)}>
        + Tạo đơn mới
      </Button>

      {/* Bảng danh sách đơn */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>OrderID</th>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Trạng thái</th>
            <th>Material From</th>
            <th>Ngày tạo</th>
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

      {/* Modal tạo đơn */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo Đơn Sản Xuất</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && <Alert variant={message.type}>{message.text}</Alert>}

          <Form onSubmit={handleCreateOrder}>

            <Form.Group className="mb-3">
              <Form.Label>Sản phẩm</Form.Label>
              <Form.Select
                value={productID}
                onChange={(e) => setProductID(e.target.value)}
                required
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.ProductName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Số lượng sản xuất</Form.Label>
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
                <option value="">-- Chọn kho --</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.WarehouseName}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Tạo đơn'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductionOrderPage;
