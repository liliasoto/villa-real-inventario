// src/services/api.js
import axios from 'axios';

const API_URL = 'https://sistema-inventario-production.up.railway.app/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Servicios para productos
export const productosService = {
  getAll: () => api.get('/productos-compra-venta'),
  getById: (id) => api.get(`/productos-compra-venta/${id}`),
  create: (data) => api.post('/productos-compra-venta', data),
  update: (id, data) => api.put(`/productos-compra-venta/${id}`, data),
  delete: (id) => api.delete(`/productos-compra-venta/${id}`),
};

// Servicios para servicios
export const serviciosService = {
  getAll: () => api.get('/servicios'),
  getById: (id) => api.get(`/servicios/${id}`),
  create: (data) => api.post('/servicios', data),
  update: (id, data) => api.put(`/servicios/${id}`, data),
  delete: (id) => api.delete(`/servicios/${id}`),
};

// Servicios para proveedores
export const proveedoresService = {
  getAll: () => api.get('/proveedores'),
  getById: (id) => api.get(`/proveedores/${id}`),
  create: (data) => api.post('/proveedores', data),
  update: (id, data) => api.put(`/proveedores/${id}`, data),
  delete: (id) => api.delete(`/proveedores/${id}`),
};

// Servicios para clasificaciones
export const clasificacionesService = {
  getAll: () => api.get('/clasificaciones'),
  getById: (id) => api.get(`/clasificaciones/${id}`),
  create: (data) => api.post('/clasificaciones', data),
  update: (id, data) => api.put(`/clasificaciones/${id}`, data),
  delete: (id) => api.delete(`/clasificaciones/${id}`),
};

export default api;