import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import { api } from '../api'; 


const MaterialPage = () => {
    const [materials, setMaterials] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        MaterialID: '',
        MaterialName: '',
        Unit: '',
        UnitPrice: 0,
        Quantity: 0,
    });

    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await api.get('/materials');
            setMaterials([...response.data]);
        } catch (error) {
            console.error('Error fetching materials:', error.message);
            alert('Failed to fetch materials');
        }
    };

    const handleShowAdd = () => {
        setFormData({ MaterialID: '', MaterialName: '', Unit: '', UnitPrice: 0, Quantity: 0 });
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
            await api.delete(`/materials/${MaterialID}`); // Dùng api.delete
            fetchMaterials();
            } catch (error) {
            console.error('Error deleting product:', error.message);
            alert('Failed to delete product');
            }
        }
    };

    return (
        <div className="container mt-4">
          <h2>Material Management</h2>
          <Button variant="primary" className="mb-3" onClick={handleShowAdd}>
            Add Material
          </Button>
    
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Material ID</th>
                <th>Material Name</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Quantity</th>
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
                    <td>{material.Quantity}</td>
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
                <Form.Group className="mb-3" controlId="formUnitQuantity">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type='number'
                    name="Quantity"
                    value={formData.Quantity}
                    onChange={handleInputChange}
                    placeholder="Enter Quantity"
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
