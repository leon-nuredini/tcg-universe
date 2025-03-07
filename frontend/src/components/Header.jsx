import React from 'react'
import { Container, Navbar, Nav } from 'react-bootstrap'
import { FaShoppingCart, FaUser } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const Header = () => {
  return (
    <header>
        <Navbar bg='dark' variant='dark' expand='md' collapseOnSelect>
            <Container>
                    <Navbar.Brand as={Link} to='/'>
                        <img src={logo} alt='TCG Universe Logo' />
                        TCG Universe
                    </Navbar.Brand>
                <Navbar.Toggle aria-controls='basic-navbar-menu' />
                <Navbar.Collapse id='basic-navbar-nav'>
                    <Nav className='ms-auto'>
                        <Nav.Link as={Link} to='/cart'><FaShoppingCart />Cart</Nav.Link>
                        <Nav.Link as={Link} to='/login'><FaUser />Sign In</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </header>
  )
}

export default Header