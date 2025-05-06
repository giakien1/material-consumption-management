import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import { api } from '../api'; 

const WarehousePage = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        WarehouseID: '',
        WarehouseName: '',
        Address: '',
    });

    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const response = await api.get('/warehouses');
            setWarehouses([...response.data]);
        } catch (error) {
            console.error('Error fetching warehouses:', error.message);
            alert('Failed to fetch warehouses');
        }
    };

    const handleShowAdd = () => {
            setFormData({ WarehouseID: '', WarehouseName: '', Address: ''});
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
            await api.put(`/warehouses/${formData.WarehouseID}`, formData); // Dùng api.put
            } else {
            await api.post('/warehouses', formData); // Dùng api.post
            }
            fetchWarehouses();
            handleClose();
        } catch (error) {
            console.error('Error saving warehouse:', error.message);
            alert('Failed to save warehouse');
        }
    };

    const handleDelete = async (WarehouseID) => {
        if (window.confirm('Are you sure you want to delete this warehouse?')) {
            try {
            await api.delete(`/warehouses/${WarehouseID}`); // Dùng api.delete
            fetchWarehouses();
            } catch (error) {
            console.error('Error deleting warehouse:', error.message);
            alert('Failed to delete warehouse');
            }
        }
    };

    return (
        <div className="container mt-4">
            <h2>Warehouse Management</h2>
            <Button variant="primary" className="mb-3" onClick={handleShowAdd}>
            Add Warehouse
            </Button>
    
            <Table striped bordered hover responsive>
            <thead>
                <tr>
                <th>Warehouse ID</th>
                <th>Warehouse Name</th>
                <th>Address</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {warehouses.length > 0 ? (
                warehouses.map((warehouse) => (
                    <tr key={warehouse.WarehouseID}>
                    <td>{warehouse.WarehouseID}</td>
                    <td>{warehouse.WarehouseName}</td>
                    <td>{warehouse.Address}</td>
                    <td>
                        <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowEdit(warehouse)}
                        >
                        Edit
                        </Button>
                        <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(warehouse.WarehouseID)}
                        >
                        Delete
                        </Button>
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan="4" className="text-center">
                    No warehouses found
                    </td>
                </tr>
                )}
            </tbody>
            </Table>
    
            <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{isEdit ? 'Edit Warehouse' : 'Add Warehouse'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formWarehouseID">
                    <Form.Label>Warehouse ID</Form.Label>
                    <Form.Control
                    type="text"
                    name="WarehouseID"
                    value={formData.WarehouseID}
                    onChange={handleInputChange}
                    placeholder="Enter Warehouse ID"
                    required
                    disabled={isEdit}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formWarehouseName">
                    <Form.Label>Warehouse Name</Form.Label>
                    <Form.Control
                    type="text"
                    name="WarehouseName"
                    value={formData.WarehouseName}
                    onChange={handleInputChange}
                    placeholder="Enter Warehouse Name"
                    required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formAddress">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                    type='text'
                    name="Address"
                    value={formData.Address}
                    onChange={handleInputChange}
                    placeholder="Enter Address"
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
export default WarehousePage;