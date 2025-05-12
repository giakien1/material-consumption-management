import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Pagination, Alert } from 'react-bootstrap';
import { api } from '../../api';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ProductID: '',
    ProductName: '',
    Description: '',
  });

  const [isEdit, setIsEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(0);  // Tổng số trang
  const [pageSize, setPageSize] = useState(5);      // Số lượng sản phẩm mỗi trang

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize]); // Chạy lại khi trang hoặc pageSize thay đổi

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', {
        params: {
          page: currentPage,
          size: pageSize,
        },
      });
      console.log('Products API Response:', response.data);
      if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products); // Lưu danh sách sản phẩm
        setTotalPages(response.data.totalPages || 1); // Lưu tổng số trang
      } else {
        console.warn('Products data is not an array:', response.data);
        setProducts([]); // Nếu dữ liệu không hợp lệ, set products là mảng rỗng
        alert('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error.message);
      alert('Failed to fetch products');
    }
  };

  const handleShowAdd = () => {
    setFormData({ ProductID: '', ProductName: '', Description: '' });
    setIsEdit(false);
    setShowModal(true);
  };

  const handleShowEdit = (product) => {
    setFormData(product);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ProductID.trim() || !formData.ProductName.trim()) {
      setError('Please fill in the product ID and name');
      return; 
    }

    try {
      setError(''); 
      if (isEdit) {
        await api.put(`/products/${formData.ProductID}`, formData); // Dùng api.put
      } else {
        await api.post('/products', formData); // Dùng api.post
      }
      fetchProducts();
      handleClose();
    } catch (error) {
      console.error('Error saving product:', error.message);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (ProductID) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${ProductID}`); // Dùng api.delete
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error.message);
        alert('Failed to delete product');
      }
    }
  };

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mt-4">
      <h2>Product Management</h2>
      <Button variant="primary" className="mb-3" onClick={handleShowAdd}>
        Add Product
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr key={product.ProductID}>
                <td>{product.ProductID}</td>
                <td>{product.ProductName}</td>
                <td>{product.Description}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowEdit(product)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(product.ProductID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination Controls */}
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

      {/* Modal Form */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formProductID">
              <Form.Label>Product ID</Form.Label>
              <Form.Control
                type="text"
                name="ProductID"
                value={formData.ProductID}
                onChange={handleInputChange}
                placeholder="Enter Product ID"
                required
                disabled={isEdit}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formProductName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="ProductName"
                value={formData.ProductName}
                onChange={handleInputChange}
                placeholder="Enter Product Name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                placeholder="Enter Description"
              />
            </Form.Group>

            {/* Hiển thị thông báo lỗi nếu có */}
            {error && <Alert variant="danger">{error}</Alert>}

            <Button variant="primary" type="submit">
              {isEdit ? 'Update' : 'Add'}
            </Button>
            <Button variant="secondary" className="ms-2" onClick={handleClose}>
              Cancel
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductPage;