import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom

const NavigationBar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        {/* <Navbar.Brand as={Link} to="/">My App</Navbar.Brand> */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Products</Nav.Link>
            <Nav.Link as={Link} to="/employee">Employees</Nav.Link>
            <Nav.Link as={Link} to="/role">Roles</Nav.Link>
            <Nav.Link as={Link} to="/material">Materials</Nav.Link>
            <Nav.Link as={Link} to="/warehouse">Warehouses</Nav.Link>
            <Nav.Link as={Link} to="/transaction">Transactions</Nav.Link>
            <Nav.Link as={Link} to="/warehouse-materials">Warehouse Materials</Nav.Link>
            <Nav.Link as={Link} to="/consumption-standard">Consumption Standards</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
