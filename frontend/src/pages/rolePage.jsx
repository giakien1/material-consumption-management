import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import { api } from '../api';

const RolePage = () => {
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    RoleID: '',
    RoleName: '',
    Description: '',
  });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles([...response.data]);
    } catch (error) {
      alert('Failed to fetch roles: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleShowAdd = () => {
    setFormData({
      RoleID: '',
      RoleName: '',
      Description: '',
    });
    setIsEdit(false);
    setShowModal(true);
  };

  const handleShowEdit = (role) => {
    setFormData({
      RoleID: role.RoleID,
      RoleName: role.RoleName,
      Description: role.Description || '',
    });
    setIsEdit(true);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setFormData({
      RoleID: '',
      RoleName: '',
      Description: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/roles/${formData.RoleID}`, {
          RoleName: formData.RoleName,
          Description: formData.Description,
        });
        alert('Role updated successfully');
      } else {
        await api.post('/roles', {
          RoleID: formData.RoleID,
          RoleName: formData.RoleName,
          Description: formData.Description,
        });
        alert('Role added successfully');
      }
      handleClose();
      await fetchRoles();
    } catch (error) {
      alert('Failed to save role: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (RoleID) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await api.delete(`/roles/${RoleID}`);
        alert('Role deleted successfully');
        await fetchRoles();
      } catch (error) {
        alert('Failed to delete role: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Role Management</h2>
      <Button variant="primary" className="mb-3" onClick={handleShowAdd}>
        Add Role
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Role ID</th>
            <th>Role Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.length > 0 ? (
            roles.map((role) => (
              <tr key={role.RoleID}>
                <td>{role.RoleID}</td>
                <td>{role.RoleName}</td>
                <td>{role.Description}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowEdit(role)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(role.RoleID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No roles found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Role' : 'Add Role'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formRoleID">
              <Form.Label>Role ID</Form.Label>
              <Form.Control
                type="text"
                name="RoleID"
                value={formData.RoleID}
                onChange={handleInputChange}
                placeholder="Enter Role ID"
                required
                disabled={isEdit}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRoleName">
              <Form.Label>Role Name</Form.Label>
              <Form.Control
                type="text"
                name="RoleName"
                value={formData.RoleName}
                onChange={handleInputChange}
                placeholder="Enter Role Name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                placeholder="Enter Description"
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
};

export default RolePage;