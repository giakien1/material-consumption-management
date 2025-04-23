import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from '../api';

const WarehouseMaterialPage = () => {
  const [warehouseMaterials, setWarehouseMaterials] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    MaterialID: '',
    WarehouseID: '',
    StockQuantity: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchMaterials();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      fetchMaterialsByWarehouse(selectedWarehouse);
    } else {
      fetchWarehouseMaterials();
    }
  }, [selectedWarehouse]);

  const fetchWarehouseMaterials = async () => {
    try {
      const response = await api.get('/warehouse-materials');
      setWarehouseMaterials([...response.data]);
    } catch (error) {
      toast.error('Failed to fetch warehouse materials: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchMaterialsByWarehouse = async (warehouseId) => {
    try {
      const response = await api.get(`/warehouse-materials/warehouse/${warehouseId}`);
      setWarehouseMaterials([...response.data]);
    } catch (error) {
      toast.error('Failed to fetch materials in warehouse: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      console.log('Fetched materials:', response.data);
      setMaterials([...response.data]);
    } catch (error) {
      toast.error('Failed to fetch materials: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await api.get('/warehouses');
      console.log('Fetched warehouses:', response.data);
      setWarehouses([...response.data]);
    } catch (error) {
      toast.error('Failed to fetch warehouses: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleShowAdd = () => {
    setFormData({
      MaterialID: materials.length > 0 ? materials[0].MaterialID : '',
      WarehouseID: selectedWarehouse || (warehouses.length > 0 ? warehouses[0].WarehouseID : ''),
      StockQuantity: '',
    });
    setIsEdit(false);
    setErrors({});
    setShowModal(true);
  };

  // const handleShowEdit = (warehouseMaterial) => {
  //   setFormData({
  //     MaterialID: typeof warehouseMaterial.MaterialID === 'object' ? warehouseMaterial.MaterialID.MaterialID : warehouseMaterial.MaterialID,
  //     WarehouseID: typeof warehouseMaterial.WarehouseID === 'object' ? warehouseMaterial.WarehouseID.WarehouseID : warehouseMaterial.WarehouseID,
  //     StockQuantity: warehouseMaterial.StockQuantity,
  //   });
  //   setIsEdit(true);
  //   setErrors({});
  //   setShowModal(true);
  // };

  const handleClose = () => {
    setShowModal(false);
    setFormData({
      MaterialID: '',
      WarehouseID: '',
      StockQuantity: '',
    });
    setIsEdit(false);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.MaterialID) newErrors.MaterialID = 'Material is required';
    if (!formData.WarehouseID) newErrors.WarehouseID = 'Warehouse is required';
    if (formData.StockQuantity === '' || parseFloat(formData.StockQuantity) < 0) {
      newErrors.StockQuantity = 'Stock Quantity must be non-negative';
    }
    if (!isEdit) {
      const exists = warehouseMaterials.some(
        (wm) =>
          (typeof wm.MaterialID === 'object' ? wm.MaterialID.MaterialID : wm.MaterialID) === formData.MaterialID &&
          (typeof wm.WarehouseID === 'object' ? wm.WarehouseID.WarehouseID : wm.WarehouseID) === formData.WarehouseID
      );
      if (exists) {
        newErrors.MaterialID = 'This Material already exists in the selected Warehouse';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleWarehouseFilterChange = (e) => {
    setSelectedWarehouse(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    try {
      console.log('Submitting warehouse material:', formData);
      if (isEdit) {
        await api.put(`/warehouse-materials/${formData.MaterialID}/${formData.WarehouseID}`, {
          StockQuantity: parseFloat(formData.StockQuantity),
        });
        toast.success('Warehouse material updated successfully');
      } else {
        await api.post('/warehouse-materials', {
          MaterialID: formData.MaterialID,
          WarehouseID: formData.WarehouseID,
          StockQuantity: parseFloat(formData.StockQuantity),
        });
        toast.success('Warehouse material added successfully');
      }
      handleClose();
      if (selectedWarehouse) {
        await fetchMaterialsByWarehouse(selectedWarehouse);
      } else {
        await fetchWarehouseMaterials();
      }
    } catch (error) {
      console.error('Error saving warehouse material:', error.response || error);
      toast.error('Failed to save warehouse material: ' + (error.response?.data?.message || error.message));
    }
  };

  // const handleDelete = async (materialId, warehouseId) => {
  //   if (window.confirm('Are you sure you want to delete this warehouse material? This may affect inventory transactions.')) {
  //     try {
  //       await api.delete(`/warehouse-materials/${materialId}/${warehouseId}`);
  //       toast.success('Warehouse material deleted successfully');
  //       if (selectedWarehouse) {
  //         await fetchMaterialsByWarehouse(selectedWarehouse);
  //       } else {
  //         await fetchWarehouseMaterials();
  //       }
  //     } catch (error) {
  //       toast.error('Failed to delete warehouse material: ' + (error.response?.data?.message || error.message));
  //     }
  //   }
  // };

  return (
    <div className="container mt-4">
      <h2>Material Search</h2>
      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={handleShowAdd}>
          Add Material to Warehouse
        </Button>
        <Form.Group controlId="warehouseFilter">
          <Form.Label>Filter by Warehouse</Form.Label>
          <Form.Select
            value={selectedWarehouse}
            onChange={handleWarehouseFilterChange}
          >
            <option value="">All Warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.WarehouseID} value={warehouse.WarehouseID}>
                {warehouse.WarehouseName || 'Unnamed Warehouse'} ({warehouse.WarehouseID})
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Material ID</th>
            <th>Material Name</th>
            <th>Warehouse ID</th>
            <th>Warehouse Name</th>
            <th>Stock Quantity</th>
            {/* <th>Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {warehouseMaterials.length > 0 ? (
            warehouseMaterials.map((wm) => (
              <tr key={`${typeof wm.MaterialID === 'object' ? wm.MaterialID?.MaterialID : wm.MaterialID}-${typeof wm.WarehouseID === 'object' ? wm.WarehouseID?.WarehouseID : wm.WarehouseID}`}>
                <td>{wm.MaterialID?.MaterialID || wm.MaterialID || 'Unnamed Material'}</td>
                <td>{wm.MaterialID?.MaterialName || 'Unnamed Material'}</td>
                <td>{wm.WarehouseID?.WarehouseID || wm.WarehouseID || 'Unnamed Warehouse'}</td>
                <td>{wm.WarehouseID?.WarehouseName || 'Unnamed Warehouse'}</td>
                <td>{wm.StockQuantity}</td>
                {/* <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowEdit(wm)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(
                      typeof wm.MaterialID === 'object' ? wm.MaterialID.MaterialID : wm.MaterialID,
                      typeof wm.WarehouseID === 'object' ? wm.WarehouseID.WarehouseID : wm.WarehouseID
                    )}
                  >
                    Delete
                  </Button>
                </td> */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No warehouse materials found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Warehouse Material' : 'Add Warehouse Material'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formMaterialID">
              <Form.Label>Material</Form.Label>
              <Form.Select
                name="MaterialID"
                value={formData.MaterialID}
                onChange={handleInputChange}
                required
                disabled={isEdit}
              >
                {materials.length === 0 ? (
                  <option value="">No materials available</option>
                ) : (
                  materials.map((material) => (
                    <option key={material.MaterialID} value={material.MaterialID}>
                      {material.MaterialName || 'Unnamed Material'} ({material.MaterialID})
                    </option>
                  ))
                )}
              </Form.Select>
              {errors.MaterialID && <Form.Text className="text-danger">{errors.MaterialID}</Form.Text>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formWarehouseID">
              <Form.Label>Warehouse</Form.Label>
              <Form.Select
                name="WarehouseID"
                value={formData.WarehouseID}
                onChange={handleInputChange}
                required
                disabled={isEdit}
              >
                {warehouses.length === 0 ? (
                  <option value="">No warehouses available</option>
                ) : (
                  warehouses.map((warehouse) => (
                    <option key={warehouse.WarehouseID} value={warehouse.WarehouseID}>
                      {warehouse.WarehouseName || 'Unnamed Warehouse'} ({warehouse.WarehouseID})
                    </option>
                  ))
                )}
              </Form.Select>
              {errors.WarehouseID && <Form.Text className="text-danger">{errors.WarehouseID}</Form.Text>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formStockQuantity">
              <Form.Label>Stock Quantity</Form.Label>
              <Form.Control
                type="number"
                name="StockQuantity"
                value={formData.StockQuantity}
                onChange={handleInputChange}
                placeholder="Enter Stock Quantity"
                min="0"
                step="0.01"
                required
              />
              {errors.StockQuantity && <Form.Text className="text-danger">{errors.StockQuantity}</Form.Text>}
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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default WarehouseMaterialPage;