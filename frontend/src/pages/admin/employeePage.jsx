import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import { api } from '../../api';

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    EmployeeId: '',
    EmployeeName: '',
    RoleID: '',
    Password: '',
  });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees([...response.data]);
    } catch (error) {
      alert('Failed to fetch employees: ' + error.message);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles([...response.data]);
    } catch (error) {
      alert('Failed to fetch roles: ' + error.message);
    }
  };

  const handleShowAdd = () => {
    setFormData({
      EmployeeId: '',
      EmployeeName: '',
      RoleID: roles.length > 0 ? roles[0].RoleID : '', 
      Password:'',
    });
    setIsEdit(false);
    setShowModal(true);
  };

  const handleShowEdit = (employee) => {
    setFormData({
      EmployeeId: employee.EmployeeId,
      EmployeeName: employee.EmployeeName,
      RoleID: employee.RoleID?.RoleID || '',
      Password: employee.Password || '', 
    });
    setIsEdit(true);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setFormData({
      EmployeeId: '',
      EmployeeName: '',
      RoleID: '',
      Password: '',
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
        await api.put(`/employees/${formData.EmployeeId}`, {
          EmployeeName: formData.EmployeeName,
          RoleID: formData.RoleID,
          Password: formData.Password,
        });
        alert('Employee updated successfully');
      } else {
        await api.post('/employees', formData);
        alert('Employee added successfully');
      }
      handleClose();
      await fetchEmployees();
    } catch (error) {
      alert('Failed to save employee: ' + error.message);
    }
  };

  const handleDelete = async (EmployeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${EmployeeId}`);
        alert('Employee deleted successfully');
        await fetchEmployees();
      } catch (error) {
        alert('Failed to delete employee: ' + error.message);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Employee Management</h2>
      <Button variant="primary" className="mb-3" onClick={handleShowAdd}>
        Add Employee
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Employee Name</th>
            <th>Role ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <tr key={employee.EmployeeID}>
                <td>{employee.EmployeeID}</td>
                <td>{employee.EmployeeName}</td>
                <td>{employee.RoleID?.RoleName} ({employee.RoleID?.RoleID})</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowEdit(employee)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(employee.EmployeeID)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No employees found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Edit Employee' : 'Add Employee'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmployeeId">
              <Form.Label>Employee ID</Form.Label>
              <Form.Control
                type="text"
                name="EmployeeId"
                value={formData.EmployeeId}
                onChange={handleInputChange}
                placeholder="Enter Employee ID"
                required
                disabled={isEdit}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEmployeeName">
              <Form.Label>Employee Name</Form.Label>
              <Form.Control
                type="text"
                name="EmployeeName"
                value={formData.EmployeeName}
                onChange={handleInputChange}
                placeholder="Enter Employee Name"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="Password"
                value={formData.Password}
                onChange={handleInputChange}
                placeholder="Enter Password"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRoleID">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="RoleID"
                value={formData.RoleID}
                onChange={handleInputChange}
                required
              >
                {roles.length === 0 ? (
                  <option value="">No roles available</option>
                ) : (
                  roles.map((role) => (
                    <option key={role.RoleID} value={role.RoleID}>
                      {role.RoleName || 'Unnamed Role'} ({role.RoleID})
                    </option>
                  ))
                )}
              </Form.Select>
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

export default EmployeePage;