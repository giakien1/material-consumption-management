import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NavigationBar = ({ onLogout }) => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Orders</Nav.Link>
            <Nav.Link as={Link} to="/transaction">Transactions</Nav.Link>
            <Nav.Link as={Link} to="/warehouse-materials">Materials</Nav.Link>
          </Nav>
          <Nav>
            <Button variant="outline-light" onClick={onLogout}>
              Log Out
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;