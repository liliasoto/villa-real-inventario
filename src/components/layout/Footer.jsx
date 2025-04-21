// src/components/layout/Footer.jsx
import { FiMapPin, FiPhone } from 'react-icons/fi';
import '../../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h2 className="footer-title">Villa Real Pisos y Azulejos</h2>
            <div className="footer-info">
              <FiMapPin className="footer-info-icon" />
              <p>
                Av. Enrique Corona Morfín 93, Burócratas Municipales, 28989 Cdad. de Villa de Álvarez, Col.
              </p>
            </div>
            <div className="footer-info">
              <FiPhone className="footer-info-icon" />
              <p>312 396 4278</p>
            </div>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Horario de atención</h3>
            <p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
            <p>Sábados: 9:00 AM - 2:00 PM</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Villa Real Pisos y Azulejos. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;