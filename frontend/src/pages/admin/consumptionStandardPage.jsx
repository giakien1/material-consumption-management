import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, InputGroup, FormControl } from 'react-bootstrap';
import { api } from '../../api';

const ConsumptionStandard = () => {
    const [consumptionStandards, setConsumptionStandards] = useState([]);
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState('');
    const [addedMaterials, setAddedMaterials] = useState([]);
    const [addedQuantities, setAddedQuantities] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        StandardID: '',
        ProductID: '',
        MaterialIDs: [],
        StandardQuantities: [],
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
            if (Array.isArray(response.data)) {
                setProducts(response.data);
            } else {
                console.warn('Products data is not an array:', response.data);
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]); 
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
            MaterialIDs: [],
            StandardQuantities: [],
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
        setFormData((prevData) => ({
            ...prevData,
            StandardID: '',
            ProductID: products.length > 0 ? products[0].ProductID : '',
            MaterialIDs: [],
            StandardQuantities: [],
        }));
        setAddedMaterials([]); // Reset added materials khi đóng modal
        setAddedQuantities([]); 
        setErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "MaterialIDs") {
            const selectedMaterials = Array.from(e.target.selectedOptions, option => option.value);
            setFormData({ ...formData, [name]: selectedMaterials });
    
            // Tạo mảng các StandardQuantities tương ứng với số lượng vật liệu được chọn
            const updatedQuantities = selectedMaterials.map(() => 0);  // Mỗi vật liệu có số lượng mặc định là 0
            setFormData({ ...formData, StandardQuantities: updatedQuantities });
        } else if (name === "StandardQuantities") {
            const quantities = value.split(',').map(q => parseFloat(q.trim()));
            setFormData({ ...formData, [name]: quantities });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.ProductID) newErrors.ProductID = 'Product is required';
        if (!formData.MaterialIDs.length) newErrors.MaterialIDs = 'At least one material is required';
        if (formData.MaterialIDs.length !== formData.StandardQuantities.length) {
            newErrors.StandardQuantities = 'Quantities must match the number of materials';
        } else {
            formData.StandardQuantities.forEach((quantity, index) => {
                if (parseFloat(quantity) <= 0) {
                    newErrors.StandardQuantities = `Quantity for material ${index + 1} must be > 0`;
                }
            });
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting || !validateForm()) return;
        
        setIsSubmitting(true);
        
        setFormData(prev => ({
            ...prev,
            ProductID: formData.ProductID,
            MaterialIDs: addedMaterials,
            StandardQuantities: addedQuantities,
        }));
    
        try {
            if (isEdit) {
                await api.put(`/consumption-standards/${formData.StandardID}`, formData);
            } else {
                await api.post('/consumption-standards', {
                    ProductID: formData.ProductID,
                    MaterialIDs: formData.MaterialIDs,
                    StandardQuantities: formData.StandardQuantities,
                });
            }
    
            fetchConsumptionStandards();
            handleClose();
        } catch (error) {
            console.error('Error saving consumption standard:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddMaterial = () => {
        console.log("Selected Material:", selectedMaterial);
        console.log("Selected Quantity:", selectedQuantity);

        if (selectedMaterial && selectedQuantity > 0) {
            // Thêm material và quantity vào addedMaterials và addedQuantities
            const updatedMaterials = [...addedMaterials, selectedMaterial];
            const updatedQuantities = [...addedQuantities, parseFloat(selectedQuantity)];
    
            setAddedMaterials(updatedMaterials);
            setAddedQuantities(updatedQuantities);
    
            // Cập nhật lại formData với MaterialIDs và StandardQuantities
            setFormData(prev => ({
                ...prev,
                MaterialIDs: updatedMaterials,  // Cập nhật MaterialIDs
                StandardQuantities: updatedQuantities,  // Cập nhật StandardQuantities
            }));
    
            setSelectedMaterial('');  // Reset selected material
            setSelectedQuantity('');  // Reset selected quantity
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
                        <th>Material - Quantity</th>
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
                                <td>
                                    {s.MaterialIDs && s.MaterialIDs.map((material, index) => (
                                        <div key={index}>
                                            {material?.MaterialName || `Material ${index + 1}`} - {s.StandardQuantities?.[index] ?? 0}
                                        </div>
                                    ))}
                                </td>
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
                        <Form.Group className="mb-3">
                            <Form.Label>Product</Form.Label>
                            <Form.Select
                                name="ProductID"
                                value={formData.ProductID}
                                onChange={handleInputChange}
                                isInvalid={!!errors.ProductID}
                            >
                                {products.map(p => (
                                    <option key={p._id} value={p._id}>
                                        {p.ProductName} ({p.ProductID})
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{errors.ProductID}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                        <Form.Label>Material</Form.Label>
                            <Form.Select
                                value={selectedMaterial}
                                onChange={(e) => setSelectedMaterial(e.target.value)}
                            >
                                <option value="">-- Select Material --</option>
                                {materials
                                    .filter(m => !formData.MaterialIDs.includes(m.MaterialID)) // không cho chọn lại material đã chọn
                                    .map(m => (
                                        <option key={m._id} value={m._id}>
                                            {m.MaterialName} ({m.MaterialID})
                                        </option>
                                    ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                step="0.01"
                                value={selectedQuantity}
                                onChange={(e) => setSelectedQuantity(e.target.value)}
                            />
                        </Form.Group>

                        <Button
                            variant="primary"
                            onClick={handleAddMaterial}
                        >
                            Add Material
                        </Button>

                        <Form.Group className="mb-3">
                            <Form.Label>Standard Quantities</Form.Label>
                            {addedMaterials.map((materialID, index) => {
                                const material = materials.find(m => m._id === materialID);
                                return (
                                    <InputGroup key={materialID} className="mb-2">
                                        <InputGroup.Text>{material ? material.MaterialName : `Material ${index + 1}`}</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={addedQuantities[index] || ''}
                                            onChange={(e) => {
                                                const newQuantities = [...addedQuantities];
                                                newQuantities[index] = parseFloat(e.target.value) || 0;
                                                setAddedQuantities(newQuantities);
                                            }}
                                            isInvalid={!!errors.StandardQuantities}
                                        />
                                    </InputGroup>
                                );
                            })}
                            <Form.Control.Feedback type="invalid">{errors.StandardQuantities}</Form.Control.Feedback>
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
