import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Pagination } from 'react-bootstrap';
import { api } from '../../api'; 


const MaterialPage = () => {
    const [message, setMessage] = useState(null);
    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [materials, setMaterials] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [formData, setFormData] = useState({
        MaterialID: '',
        MaterialName: '',
        Unit: '',
        UnitPrice: 0
    });

    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, [currentPage, pageSize]);

    const fetchMaterials = async (searchKeyword = '') => {
        try {
          if (searchKeyword) {
            const response = await api.get(`/materials/search/${searchKeyword}`);
            setMaterials([...response.data]);
          } else {
            const response = await api.get(`/materials?page=${currentPage}&pageSize=${pageSize}`);
            setMaterials([...response.data.materials]);
            setTotalPages(response.data.totalPages);
            setMessage({ type: 'danger', text: 'Failed to load employees.' });
          }
        } catch (error) {
            console.error('Error fetching materials:', error.message);
            alert('Failed to fetch materials');
        }
    };

    const handleShowAdd = () => {
        setFormData({ MaterialID: '', MaterialName: '', Unit: '', UnitPrice: 0 });
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
        try {
            if (isEdit) {
            await api.put(`/materials/${formData.MaterialID}`, formData); // Dùng api.put
            } else {
            await api.post('/materials', formData); // Dùng api.post
            }
            fetchMaterials();
            handleClose();
        } catch (error) {
            console.error('Error saving product:', error.message);
            alert('Failed to save product');
        }
    };

    const handleDelete = async (MaterialID) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
            await api.delete(`/materials/${MaterialID}`);
            fetchMaterials();
            } catch (error) {
            console.error('Error deleting product:', error.message);
            alert('Failed to delete product');
            }
        }
    };

    const handlePageChange = (page) => {
      setCurrentPage(page);
    };

    return (
        <div className="container mt-4">
          <h2>Material Management</h2>
          <Button variant="primary" className="mb-3" onClick={handleShowAdd}>
            Add Material
          </Button>

          <div className="mb-3 d-flex gap-2">
            <input
              type="text"
              placeholder="Material Name"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchMaterials(keyword);
              }}
              className="form-control"
            />
            <button className="btn btn-primary" onClick={() => fetchMaterials(keyword)}>
              Search
            </button>
          </div>
    
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Material ID</th>
                <th>Material Name</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.length > 0 ? (
                materials.map((material) => (
                  <tr key={material.MaterialID}>
                    <td>{material.MaterialID}</td>
                    <td>{material.MaterialName}</td>
                    <td>{material.Unit}</td>
                    <td>{material.UnitPrice}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowEdit(material)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(material.MaterialID)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No materials found
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
        
          <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{isEdit ? 'Edit Material' : 'Add Material'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formMaterialID">
                  <Form.Label>Material ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="MaterialID"
                    value={formData.MaterialID}
                    onChange={handleInputChange}
                    placeholder="Enter Material ID"
                    required
                    disabled={isEdit}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formMaterialName">
                  <Form.Label>Material Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="MaterialName"
                    value={formData.MaterialName}
                    onChange={handleInputChange}
                    placeholder="Enter Material Name"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formUnit">
                  <Form.Label>Unit</Form.Label>
                  <Form.Control
                    type='text'
                    name="Unit"
                    value={formData.Unit}
                    onChange={handleInputChange}
                    placeholder="Enter Unit"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formUnitPrice">
                  <Form.Label>Unit Price</Form.Label>
                  <Form.Control
                    type='number'
                    name="UnitPrice"
                    value={formData.UnitPrice}
                    onChange={handleInputChange}
                    placeholder="Enter Unit Price"
                  />
                </Form.Group>
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
}

export default MaterialPage;
