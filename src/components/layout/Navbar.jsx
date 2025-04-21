// src/components/layout/Navbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX } from 'react-icons/fi';
import '../../styles/navbar.css';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { title: 'Productos', path: '/productos' },
    { title: 'Agregar producto', path: '/agregar-producto' },
    { title: 'Proveedores', path: '/proveedores' },
    { title: 'Categorías', path: '/categorias' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <img
              src={logo || "/placeholder.svg"}
              alt="Villa Real Logo"
            />
          </Link>
        </div>
        
        <button className="navbar-toggle" onClick={toggleMenu}>
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
        
        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="navbar-menu-item"
              onClick={() => setIsOpen(false)}
            >
              {item.title}
            </Link>
          ))}
          {user && (
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="btn btn-outline ml-4"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;