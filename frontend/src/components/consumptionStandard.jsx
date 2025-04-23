import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, InputGroup, FormControl } from 'react-bootstrap';
import { api } from '../api';

const ConsumptionStandard = () => {
    const [consumptionStandards, setConsumptionStandards] = useState([]);
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [formData, setFormData] = useState({
        StandardID: '',
        ProductID: '',
        MaterialID: '',
        StandardQuantity: 0,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchConsumptionStandards();
        fetchProducts();
        fetchMaterials();
    }, []);

    const fetchConsumptionStandards = async () => {
        try {
            const response = await api.get('/consumption-standards');
            setConsumptionStandards(response.data);
        } catch (error) {
            console.error('Error fetching consumption standards:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
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

    const handleShowAdd = () => {
        setFormData({
            StandardID: '',
            ProductID: products.length > 0 ? products[0].ProductID : '',
            MaterialID: materials.length > 0 ? materials[0].MaterialID : '',
            StandardQuantity: 0,
        });
        setIsEdit(false);
        setErrors({});
        setShowModal(true);
    };

    const handleShowEdit = (standard) => {
        setFormData({
            StandardID: standard.StandardID,
            ProductID: standard.ProductID?.ProductID || '',
            MaterialID: standard.MaterialID?.MaterialID || '',
            StandardQuantity: standard.StandardQuantity,
        });
        setIsEdit(true);
        setErrors({});
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setFormData({
            StandardID: '',
            ProductID: products.length > 0 ? products[0].ProductID : '',
            MaterialID: materials.length > 0 ? materials[0].MaterialID : '',
            StandardQuantity: 0,
        });
        setErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const newErrors = {};
        // if (!formData.StandardID) newErrors.StandardID = 'Standard ID is required';
        if (!formData.ProductID) newErrors.ProductID = 'Product is required';
        if (!formData.MaterialID) newErrors.MaterialID = 'Material is required';
        if (parseFloat(formData.StandardQuantity) <= 0) newErrors.StandardQuantity = 'Quantity must be > 0';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            if (isEdit) {
                await api.put(`/consumption-standards/${formData.StandardID}`, formData);
            } else {
                await api.post('/consumption-standards', {
                    ProductID: formData.ProductID,
                    MaterialID: formData.MaterialID,
                    StandardQuantity: formData.StandardQuantity
                });
            }
            fetchConsumptionStandards();
            handleClose();
        } catch (error) {
            console.error('Error saving consumption standard:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this consumption standard?')) {
            try {
                await api.delete(`/consumption-standards/${id}`);
                fetchConsumptionStandards();
            } catch (error) {
                console.error('Error deleting consumption standard:', error);
            }
        }
    };

    return (
        <div className="container mt-4">
            <h2>Consumption Standard</h2>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="primary" onClick={handleShowAdd}>
                    + Add Standard
                </Button>
                <InputGroup style={{ width: '300px' }}>
                    <FormControl
                        placeholder="Search by Standard ID"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </InputGroup>
            </div>

            <Table striped bordered hover responsive>
                <thead className="table-dark">
                    <tr>
                        <th>Standard ID</th>
                        <th>Product</th>
                        <th>Material</th>
                        <th>Quantity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {consumptionStandards
                        .filter(s =>
                            s.StandardID.toLowerCase().includes(keyword.toLowerCase()) ||
                            s.ProductID?.ProductName.toLowerCase().includes(keyword.toLowerCase())
                        )
                        .map((s) => (
                            <tr key={s.StandardID}>
                                <td>{s.StandardID}</td>
                                <td>{s.ProductID?.ProductName}</td>
                                <td>{s.MaterialID?.MaterialName}</td>
                                <td>{parseFloat(s.StandardQuantity).toFixed(2)}</td>
                                <td>
                                    <Button size="sm" variant="warning" onClick={() => handleShowEdit(s)}>Edit</Button>{' '}
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(s.StandardID)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEdit ? 'Edit' : 'Add'} Consumption Standard</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {/* <Form.Group className="mb-3">
                            <Form.Label>Standard ID</Form.Label>
                            <Form.Control
                                type="text"
                                name="StandardID"
                                value={formData.StandardID}
                                onChange={handleInputChange}
                                disabled={isEdit}
                                isInvalid={!!errors.StandardID}
                            />
                            <Form.Control.Feedback type="invalid">{errors.StandardID}</Form.Control.Feedback>
                        </Form.Group> */}

                        <Form.Group className="mb-3">
                            <Form.Label>Product</Form.Label>
                            <Form.Select
                                name="ProductID"
                                value={formData.ProductID}
                                onChange={handleInputChange}
                                isInvalid={!!errors.ProductID}
                            >
                                {products.map(p => (
                                    <option key={p.ProductID} value={p.ProductID}>
                                        {p.ProductName} ({p.ProductID})
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.ProductID}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Material</Form.Label>
                            <Form.Select
                                name="MaterialID"
                                value={formData.MaterialID}
                                onChange={handleInputChange}
                                isInvalid={!!errors.MaterialID}
                            >
                                {materials.map(m => (
                                    <option key={m.MaterialID} value={m.MaterialID}>
                                        {m.MaterialName} ({m.MaterialID})
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.MaterialID}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Standard Quantity</Form.Label>
                            <Form.Control
                                type="number"
                                name="StandardQuantity"
                                value={formData.StandardQuantity}
                                onChange={handleInputChange}
                                isInvalid={!!errors.StandardQuantity}
                                min="0"
                                step="0.01"
                            />
                            <Form.Control.Feedback type="invalid">{errors.StandardQuantity}</Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={handleClose} className="me-2">Cancel</Button>
                            <Button type="submit" variant="primary">Save</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ConsumptionStandard;
