import React, { useState } from 'react';
import { api } from '../../api';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate

const LoginPage = ({ onLogin }) => {
  const [employeeID, setEmployeeID] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Khởi tạo useNavigate

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  if (!employeeID.trim() || !password.trim()) {
    setError('Vui lòng nhập đầy đủ Mã nhân viên và Mật khẩu');
    return;
  }

  try {
    const res = await api.post('/auth', {
      employeeID,
      password,
    });

    console.log('API response:', res.data);

    if (res.data && res.data.user && res.data.user.role) {
      // Xóa các key cũ
      localStorage.removeItem('role');
      localStorage.removeItem('employeeName');
      localStorage.removeItem('token');
      // Lưu key mới với tiền tố
      localStorage.setItem('project1_role', res.data.user.role.toLowerCase());
      localStorage.setItem('project1_employeeName', res.data.user.name);
      localStorage.setItem('project1_token', res.data.token);
      console.log('Stored role:', res.data.user.role.toLowerCase());
      onLogin();
      navigate('/');
    } else {
      setError('Dữ liệu trả về không hợp lệ');
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Lỗi đăng nhập');
    console.error('Login error:', err.response?.data);
  }
};

  return (
    <Container fluid className="vh-100 d-flex justify-content-center align-items-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card>
            <Card.Body>
              <h3 className="text-center mb-4">Đăng nhập</h3>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="employeeID">
                  <Form.Label>Mã nhân viên</Form.Label>
                  <Form.Control
                    type="text"
                    value={employeeID}
                    onChange={(e) => setEmployeeID(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Đăng nhập
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;