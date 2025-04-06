// src/pages/HomePage.jsx
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import '../styles/home.css';
import heroImage from '../assets/hero-image.png';

const HomePage = () => {
  return (
    <Layout>
      <section className="hero-section">
        <div className="hero-container">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-content"
          >
            <h1 className="hero-title">
              Villa Real
            </h1>
            <p className="hero-subtitle">
              Comercio al por menor de pisos y recubrimientos cerámicos
            </p>
            <div className="hero-buttons">
              <Link to="/productos" className="btn btn-primary">
                Ver Productos
              </Link>
              <Link to="/agregar-producto" className="btn btn-outline">
                Agregar Producto
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img
              src={heroImage || "/placeholder.svg"}
              alt="Villa Real Pisos y Azulejos"
              className="hero-image"
            />
          </motion.div>
        </div>
      </section>
      
      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">
              Sistema de Inventario
            </h2>
            <p className="features-subtitle">
              Gestiona fácilmente tus productos, servicios, proveedores y categorías
            </p>
          </div>
          
          <div className="features-grid">
            {[
              {
                title: 'Productos',
                description: 'Gestiona tu inventario de productos',
                path: '/productos',
                icon: '📦'
              },
              {
                title: 'Agregar Producto',
                description: 'Añade nuevos productos al inventario',
                path: '/agregar-producto',
                icon: '➕'
              },
              {
                title: 'Proveedores',
                description: 'Administra tus proveedores',
                path: '/proveedores',
                icon: '🏭'
              },
              {
                title: 'Categorías',
                description: 'Organiza tus productos por categorías',
                path: '/categorias',
                icon: '🏷️'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="feature-card"
              >
                <div className="feature-icon">{item.icon}</div>
                <h3 className="feature-title">{item.title}</h3>
                <p className="feature-description">{item.description}</p>
                <Link
                  to={item.path}
                  className="feature-link"
                >
                  Ir a {item.title} →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;