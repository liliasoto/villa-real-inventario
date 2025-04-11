import axios from "axios"

// URL base del backend
const API_URL = "https://sistema-inventario-production.up.railway.app/api"

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error)

    // Mostrar más detalles sobre el error
    if (error.response && error.response.data) {
      console.error("Error details:", error.response.data)

      // Mostrar errores específicos si existen
      if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        console.error("Validation errors:")
        error.response.data.errors.forEach((err, index) => {
          console.error(`Error ${index + 1}:`, err)
        })
      }
    }

    return Promise.reject(error)
  },
)

// Interceptor para mostrar las solicitudes
api.interceptors.request.use(
  (config) => {
    console.log(`Request: ${config.method.toUpperCase()} ${config.url}`, config.data)
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Servicios para productos de compra/venta
export const productosCompraVentaService = {
  getAll: () => api.get("/productos-compra-venta"),
  getById: (id) => api.get(`/productos-compra-venta/${id}`),
  create: (data) => api.post("/productos-compra-venta", data),
  update: (id, data) => api.put(`/productos-compra-venta/${id}`, data),
  delete: (id) => api.delete(`/productos-compra-venta/${id}`),
}

// Modificar el servicio de productos manufacturados para añadir un log específico
export const productosManufacturaService = {
  getAll: () => api.get("/productos-manufactura"),
  getById: (id) => api.get(`/productos-manufactura/${id}`),
  create: (data) => {
    console.log("Enviando a /productos-manufactura:", JSON.stringify(data))
    return api.post("/productos-manufactura", data)
  },
  update: (id, data) => api.put(`/productos-manufactura/${id}`, data),
  delete: (id) => api.delete(`/productos-manufactura/${id}`),
}

// Servicios para servicios
export const serviciosService = {
  getAll: () => api.get("/servicios"),
  getById: (id) => api.get(`/servicios/${id}`),
  create: (data) => api.post("/servicios", data),
  update: (id, data) => api.put(`/servicios/${id}`, data),
  delete: (id) => api.delete(`/servicios/${id}`),
}

// Servicios para proveedores
export const proveedoresService = {
  getAll: () => api.get("/proveedores"),
  getById: (id) => api.get(`/proveedores/${id}`),
  create: (data) => api.post("/proveedores", data),
  update: (id, data) => api.put(`/proveedores/${id}`, data),
  delete: (id) => api.delete(`/proveedores/${id}`),
}

// Servicios para clasificaciones
export const clasificacionesService = {
  getAll: () => api.get("/clasificaciones"),
  getById: (id) => api.get(`/clasificaciones/${id}`),
  create: (data) => api.post("/clasificaciones", data),
  update: (id, data) => api.put(`/clasificaciones/${id}`, data),
  delete: (id) => api.delete(`/clasificaciones/${id}`),
}

// Servicios para materiales de manufactura
export const materialesService = {
  getAll: () => api.get("/materiales"),
  getById: (id) => api.get(`/materiales/${id}`),
  create: (data) => api.post("/materiales", data),
  update: (id, data) => api.put(`/materiales/${id}`, data),
  delete: (id) => api.delete(`/materiales/${id}`),
}

// Servicios para items (productos genéricos)
export const itemsService = {
  getAll: () => api.get("/items"),
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post("/items", data),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
  getDefault: () => api.get("/items/default"),
}

export default api
