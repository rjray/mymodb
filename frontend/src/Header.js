import React from "react"
import Button from "react-bootstrap/Button"
import Navbar from "react-bootstrap/Navbar"
import Nav from "react-bootstrap/Nav"
import NavDropdown from "react-bootstrap/NavDropdown"
import { BrowserRouter as Router } from "react-router-dom"
import { LinkContainer } from "react-router-bootstrap"

const Header = () => (
  <Router>
    <Navbar bg="light" expand="sm" fixed="top">
      <LinkContainer to="/">
        <Navbar.Brand>My Modeling DB</Navbar.Brand>
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
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
      <Nav>
        <LinkContainer to="/login">
          <Button variant="link">login</Button>
        </LinkContainer>
      </Nav>
    </Navbar>
  </Router>
)

export default Header
