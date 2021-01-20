import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import { LinkContainer } from "react-router-bootstrap";

import { useAuth } from "../auth";

const NavHeader = () => {
  const { logout } = useAuth();

  return (
    <Container fluid>
      <Navbar bg="light" expand="sm">
        <LinkContainer to="/">
          <Navbar.Brand>ISMDB</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <NavDropdown title="View" id="basic-nav-dropdown">
              <LinkContainer to="/references">
                <NavDropdown.Item>References</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/authors">
                <NavDropdown.Item>Authors</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/magazines">
                <NavDropdown.Item>Magazines</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/tags">
                <NavDropdown.Item>Tags</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
        <Nav>
          <Button variant="link" onClick={() => logout()}>
            logout
          </Button>
        </Nav>
      </Navbar>
    </Container>
  );
};

export default NavHeader;
