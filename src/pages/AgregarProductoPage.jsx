"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/layout/Layout"
import { motion } from "framer-motion"
import { FiSave, FiX, FiPlus, FiTrash2, FiLoader } from "react-icons/fi"
import {
  productosCompraVentaService,
  serviciosService,
  clasificacionesService,
  proveedoresService,
} from "../services/api"
import { showToast } from "../utils/toast"
import "../styles/agregar-producto.css"
import "../styles/toast.css"

const AgregarProductoPage = () => {
  const navigate = useNavigate()
  const [tipoSeleccionado, setTipoSeleccionado] = useState("")
  const [clasificaciones, setClasificaciones] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Estado para formulario de Compra/Venta
  const [formCompraVenta, setFormCompraVenta] = useState({
    nombre: "",
    estado: "activo",
    esSubproducto: false,
    clasificacionId: "",
    descripcionCompra: "",
    costo: "",
    proveedorId: "",
    descripcionVenta: "",
    precioVenta: "",
    enInventario: false,
    minimo: "0",
    maximo: "0",
    existencia: "0",
    valorTotal: "0",
    fechaInicio: new Date().toISOString().split("T")[0],
  })

  // Estado para formulario de Manufactura
  const [formManufactura, setFormManufactura] = useState({
    nombre: "",
    estado: "activo",
    esSubproducto: false,
    clasificacionId: "",
    descripcion: "",
    costo: "",
    precioVenta: "",
    materiales: [],
    enInventario: false,
    minimo: "0",
    maximo: "0",
    existencia: "0",
    valorTotal: "0",
    fechaInicio: new Date().toISOString().split("T")[0],
  })

  // Estado para formulario de Servicio
  const [formServicio, setFormServicio] = useState({
    nombre: "",
    estado: "activo",
    descripcion: "",
    precio: "",
  })

  // Cargar datos necesarios
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [clasificacionesRes, proveedoresRes, productosRes] = await Promise.all([
          clasificacionesService.getAll(),
          proveedoresService.getAll(),
          productosCompraVentaService.getAll(),
        ])

        setClasificaciones(clasificacionesRes.data || [])
        setProveedores(proveedoresRes.data || [])

        // Asegurarnos de que los productos se cargan correctamente
        console.log("Productos cargados:", productosRes.data)
        if (productosRes.data && Array.isArray(productosRes.data)) {
          setProductos(productosRes.data)
        } else {
          console.error("Formato de datos de productos incorrecto:", productosRes.data)
          setProductos([])
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        showToast({
          type: "error",
          title: "Error al cargar datos",
          message: "No se pudieron cargar algunos datos necesarios. Por favor, intente nuevamente.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Manejadores para formulario de Compra/Venta
  const handleCompraVentaChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormCompraVenta({
      ...formCompraVenta,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Manejadores para formulario de Manufactura
  const handleManufacturaChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormManufactura({
      ...formManufactura,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Manejador para agregar material a la lista
  const agregarMaterial = () => {
    const nuevoMaterial = {
      id: Date.now(),
      productoId: "",
      descripcion: "",
      tipo: "",
      costo: 0,
      cantidad: 1,
      subtotal: 0,
      itemId: null, // Nuevo campo para almacenar el item_id
    }

    setFormManufactura({
      ...formManufactura,
      materiales: [...formManufactura.materiales, nuevoMaterial],
    })
  }

  // Manejador para eliminar material de la lista
  const eliminarMaterial = (id) => {
    setFormManufactura({
      ...formManufactura,
      materiales: formManufactura.materiales.filter((material) => material.id !== id),
    })
  }

  // Manejador para actualizar un material específico
  const actualizarMaterial = (id, campo, valor) => {
    const materialesActualizados = formManufactura.materiales.map((material) => {
      if (material.id === id) {
        const materialActualizado = { ...material, [campo]: valor }

        // Si se actualiza el productoId, autocompletar los demás campos
        if (campo === "productoId") {
          const productoSeleccionado = productos.find((p) => p.id === Number.parseInt(valor) || p.id === valor)
          if (productoSeleccionado) {
            console.log("Producto seleccionado:", productoSeleccionado)
            materialActualizado.descripcion =
              productoSeleccionado.descripcion_venta || productoSeleccionado.descripcion_compra || ""
            materialActualizado.tipo = productoSeleccionado.tipo || "Compra/Venta"
            materialActualizado.costo = Number.parseFloat(productoSeleccionado.costo) || 0
            materialActualizado.subtotal = materialActualizado.costo * materialActualizado.cantidad

            // Guardar el item_id del producto seleccionado
            materialActualizado.itemId = productoSeleccionado.item_id
            console.log("Item ID guardado:", materialActualizado.itemId)
          } else {
            console.warn("No se encontró el producto con ID:", valor)
          }
        } else if (campo === "cantidad" || campo === "costo") {
          materialActualizado.subtotal = materialActualizado.costo * materialActualizado.cantidad
        }

        return materialActualizado
      }
      return material
    })

    setFormManufactura({
      ...formManufactura,
      materiales: materialesActualizados,
    })
  }

  // Calcular total de costo de materiales
  const calcularTotalCostoMateriales = () => {
    return formManufactura.materiales.reduce((total, material) => total + (material.subtotal || 0), 0)
  }

  const crearProductoManufacturado = async (datos) => {
    try {
      console.log("Enviando datos de manufactura directamente:", datos)

      // Crear un objeto con solo los datos necesarios para el backend
      const datosParaEnviar = {
        nombre: datos.nombre,
        estado: datos.estado,
        descripcion: datos.descripcion,
        es_subproducto: datos.es_subproducto,
        clasificacion_id: datos.clasificacion_id,
        costo: datos.costo,
        precio_venta: datos.precio_venta,
        pertenece_inventario: datos.pertenece_inventario,
        minimo: datos.minimo,
        maximo: datos.maximo,
        existencia: datos.existencia,
        valor_total: datos.valor_total,
        fecha_inicio: datos.fecha_inicio,

        // Transformar los materiales para que tengan el formato correcto
        // Usar el itemId en lugar del producto_id
        materiales:
          datos.materiales.length > 0
            ? datos.materiales.map((material) => ({
                item_id: material.itemId, // Usar el itemId guardado
                descripcion: material.descripcion,
                cantidad: material.cantidad,
                subtotal: material.subtotal,
              }))
            : [],
      }

      console.log("Datos formateados para enviar:", datosParaEnviar)
      console.log("Costo que se enviará:", datosParaEnviar.costo)

      const response = await fetch(`https://sistema-inventario-production.up.railway.app/api/productos-manufactura`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosParaEnviar),
      })

      if (!response.ok) {
        const responseData = await response.json()
        console.error("Error al crear producto manufacturado:", responseData)

        // Mostrar más detalles del error si están disponibles
        if (responseData.error) {
          console.error("Detalles del error:", responseData.error)
        }

        throw new Error(
          `Error al crear producto manufacturado: ${responseData.message || JSON.stringify(responseData)}`,
        )
      }

      const responseData = await response.json()
      return responseData
    } catch (error) {
      console.error("Error en crearProductoManufacturado:", error)
      throw error
    }
  }

  // Manejadores para formulario de Servicio
  const handleServicioChange = (e) => {
    const { name, value } = e.target
    setFormServicio({
      ...formServicio,
      [name]: value,
    })
  }

  // Validar formulario de Compra/Venta
  const validarFormCompraVenta = () => {
    if (!formCompraVenta.nombre) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El nombre del producto es obligatorio.",
      })
      return false
    }

    if (!formCompraVenta.costo) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El costo del producto es obligatorio.",
      })
      return false
    }

    if (!formCompraVenta.precioVenta) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El precio de venta es obligatorio.",
      })
      return false
    }

    return true
  }

  // Validar formulario de Manufactura
  const validarFormManufactura = () => {
    if (!formManufactura.nombre) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El nombre del producto es obligatorio.",
      })
      return false
    }

    if (!formManufactura.costo) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El costo del producto es obligatorio.",
      })
      return false
    }

    if (!formManufactura.precioVenta) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El precio de venta es obligatorio.",
      })
      return false
    }

    if (formManufactura.materiales.length > 0) {
      // Validar que todos los materiales tengan un producto seleccionado
      const materialesSinProducto = formManufactura.materiales.filter((m) => !m.productoId)
      if (materialesSinProducto.length > 0) {
        showToast({
          type: "error",
          title: "Error de validación",
          message: "Todos los materiales deben tener un producto seleccionado.",
        })
        return false
      }

      // Validar que todos los materiales tengan un itemId
      const materialesSinItemId = formManufactura.materiales.filter((m) => !m.itemId)
      if (materialesSinItemId.length > 0) {
        showToast({
          type: "error",
          title: "Error de validación",
          message: "No se pudo obtener el ID de item para algunos materiales.",
        })
        return false
      }
    }

    return true
  }

  // Validar formulario de Servicio
  const validarFormServicio = () => {
    if (!formServicio.nombre) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El nombre del servicio es obligatorio.",
      })
      return false
    }

    if (!formServicio.precio) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El precio del servicio es obligatorio.",
      })
      return false
    }

    return true
  }

  // Preparar datos de Manufactura para enviar al backend
  const prepararDatosManufactura = () => {
    // Convertir valores numéricos de string a número
    const datos = {
      nombre: formManufactura.nombre.trim(),
      estado: formManufactura.estado,
      es_subproducto: formManufactura.esSubproducto,
      clasificacion_id: formManufactura.esSubproducto ? formManufactura.clasificacionId : null,
      descripcion: formManufactura.descripcion.trim(),
      precio_venta: Number.parseFloat(formManufactura.precioVenta) || 0,
      pertenece_inventario: formManufactura.enInventario,
      minimo: Number.parseFloat(formManufactura.minimo) || 0,
      maximo: Number.parseFloat(formManufactura.maximo) || 0,
      existencia: Number.parseFloat(formManufactura.existencia) || 0,
      valor_total: Number.parseFloat(formManufactura.valorTotal) || 0,
      fecha_inicio: formManufactura.fechaInicio || null,
    }

    // Preparar materiales para enviar al backend
    const materialesParaEnviar = formManufactura.materiales.map((material) => ({
      producto_id: Number(material.productoId) || null,
      itemId: material.itemId, // Incluir el itemId
      descripcion: material.descripcion.trim(),
      cantidad: Number.parseFloat(material.cantidad) || 0,
      costo: Number.parseFloat(material.costo) || 0,
      subtotal: Number.parseFloat(material.subtotal) || 0,
    }))

    datos.materiales = materialesParaEnviar

    // Determinar el costo basado en la presencia de materiales
    const costoMateriales = calcularTotalCostoMateriales()
    const costoManual = Number.parseFloat(formManufactura.costo) || 0

    // Si hay materiales y el costo calculado es mayor que cero, usar ese costo
    if (materialesParaEnviar.length > 0 && costoMateriales > 0) {
      datos.costo = costoMateriales
      console.log("Usando costo calculado de materiales:", costoMateriales)
    } else {
      // Si no hay materiales o el costo calculado es cero, usar el costo ingresado manualmente
      datos.costo = costoManual
      console.log("Usando costo ingresado manualmente:", costoManual)
    }

    return datos
  }

  // Preparar datos de Compra/Venta para enviar al backend
  const prepararDatosCompraVenta = () => {
    // Convertir valores numéricos de string a número
    const datos = {
      nombre: formCompraVenta.nombre.trim(),
      estado: formCompraVenta.estado,
      es_subproducto: formCompraVenta.esSubproducto,
      clasificacion_id: formCompraVenta.esSubproducto ? formCompraVenta.clasificacionId : null,
      descripcion_compra: formCompraVenta.descripcionCompra.trim(),
      costo: Number.parseFloat(formCompraVenta.costo) || 0,
      proveedor_id: formCompraVenta.proveedorId || null,
      descripcion_venta: formCompraVenta.descripcionVenta.trim(),
      precio_venta: Number.parseFloat(formCompraVenta.precioVenta) || 0,
      pertenece_inventario: formCompraVenta.enInventario, // Cambiado a pertenece_inventario
      minimo: Number.parseFloat(formCompraVenta.minimo) || 0, // Siempre enviar un número positivo
      maximo: Number.parseFloat(formCompraVenta.maximo) || 0, // Siempre enviar un número positivo
      existencia: Number.parseFloat(formCompraVenta.existencia) || 0, // Siempre enviar un número positivo
      valor_total: Number.parseFloat(formCompraVenta.valorTotal) || 0, // Siempre enviar un número positivo
      fecha_inicio: formCompraVenta.fechaInicio || null,
    }

    return datos
  }

  // Preparar datos de Servicio para enviar al backend
  const prepararDatosServicio = () => {
    return {
      nombre: formServicio.nombre.trim(),
      estado: formServicio.estado,
      descripcion_servicio: formServicio.descripcion.trim(), // Cambiado a descripcion_servicio
      precio_venta: Number.parseFloat(formServicio.precio) || 0,
    }
  }

  // Manejador para enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar según el tipo seleccionado
    let esValido = false

    switch (tipoSeleccionado) {
      case "compra-venta":
        esValido = validarFormCompraVenta()
        break
      case "manufactura":
        esValido = validarFormManufactura()
        break
      case "servicio":
        esValido = validarFormServicio()
        break
      default:
        showToast({
          type: "error",
          title: "Error",
          message: "Debe seleccionar un tipo de producto o servicio.",
        })
        return
    }

    if (!esValido) return

    setSubmitting(true)

    try {
      let response

      switch (tipoSeleccionado) {
        case "compra-venta": {
          const datos = prepararDatosCompraVenta()
          console.log("Enviando datos de compra/venta:", datos)
          response = await productosCompraVentaService.create(datos)
          break
        }
        case "manufactura": {
          try {
            // Preparar datos para manufactura
            const datos = prepararDatosManufactura()
            console.log("Enviando datos de manufactura:", datos)

            // Crear el producto manufacturado directamente
            response = { data: await crearProductoManufacturado(datos) }
          } catch (error) {
            console.error("Error específico al crear producto manufacturado:", error.response?.data || error)
            throw error // Re-lanzar el error para que sea manejado por el catch general
          }
          break
        }
        case "servicio": {
          const datos = prepararDatosServicio()
          console.log("Enviando datos de servicio:", datos)
          response = await serviciosService.create(datos)
          break
        }
      }

      console.log("Respuesta del servidor:", response.data)

      showToast({
        type: "success",
        title: "Guardado exitoso",
        message: `El ${tipoSeleccionado === "servicio" ? "servicio" : "producto"} ha sido guardado correctamente.`,
      })

      // Resetear el formulario
      handleReset()
    } catch (error) {
      console.error("Error al guardar:", error)

      let errorMessage = "Ocurrió un error al guardar los datos."

      if (error.response && error.response.data) {
        console.error("Detalles del error:", error.response.data)

        if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.errors && error.response.data.errors.length > 0) {
          // Mostrar todos los mensajes de error
          const errores = error.response.data.errors.map((err) => {
            console.error("Error específico:", err)
            return err.msg || err.message || JSON.stringify(err)
          })
          errorMessage = errores.join(", ")
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      showToast({
        type: "error",
        title: "Error al guardar",
        message: errorMessage,
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Manejador para resetear formulario
  const handleReset = () => {
    setTipoSeleccionado("")
    setFormCompraVenta({
      nombre: "",
      estado: "activo",
      esSubproducto: false,
      clasificacionId: "",
      descripcionCompra: "",
      costo: "",
      proveedorId: "",
      descripcionVenta: "",
      precioVenta: "",
      enInventario: false,
      minimo: "0",
      maximo: "0",
      existencia: "0",
      valorTotal: "0",
      fechaInicio: new Date().toISOString().split("T")[0],
    })
    setFormManufactura({
      nombre: "",
      estado: "activo",
      esSubproducto: false,
      clasificacionId: "",
      descripcion: "",
      costo: "",
      precioVenta: "",
      materiales: [],
      enInventario: false,
      minimo: "0",
      maximo: "0",
      existencia: "0",
      valorTotal: "0",
      fechaInicio: new Date().toISOString().split("T")[0],
    })
    setFormServicio({
      nombre: "",
      estado: "activo",
      descripcion: "",
      precio: "",
    })
  }

  // Función para cargar y mostrar los detalles de los productos
  useEffect(() => {
    if (productos.length > 0) {
      console.log("Detalles de productos disponibles para materiales:")
      productos.forEach((producto) => {
        console.log(`ID: ${producto.id}, Nombre: ${producto.nombre}, Item ID: ${producto.item_id}`)
      })
    }
  }, [productos])

  return (
    <Layout>
      <div className="agregar-producto-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header"
        >
          <h1 className="page-title">Agregar producto o servicio</h1>
          <p className="page-subtitle">
            Complete el formulario para agregar un nuevo producto o servicio al inventario
          </p>
        </motion.div>

        <div className="tipo-selector-container">
          <h2 className="section-title">Tipo</h2>
          <div className="tipo-selector">
            <select
              className="tipo-select"
              value={tipoSeleccionado}
              onChange={(e) => setTipoSeleccionado(e.target.value)}
              disabled={submitting}
            >
              <option value="">Seleccione un tipo</option>
              <option value="compra-venta">Compra/venta</option>
              <option value="manufactura">Manufactura</option>
              <option value="servicio">Servicio</option>
            </select>

            {tipoSeleccionado && (
              <div className="tipo-descripcion">
                {tipoSeleccionado === "compra-venta" && (
                  <p>Úselo para los productos que compra, rastrea como inventario y revende.</p>
                )}
                {tipoSeleccionado === "manufactura" && (
                  <p>
                    Úselo para artículos de inventario que ensambla a partir de otros artículos de inventario y luego
                    vende.
                  </p>
                )}
                {tipoSeleccionado === "servicio" && (
                  <p>
                    Úselo para servicios que cobra o compra, como mano de obra especializada, horas de consultoría u
                    honorarios profesionales.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {tipoSeleccionado === "compra-venta" && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="producto-form"
            onSubmit={handleSubmit}
          >
            <div className="form-section">
              <h2 className="section-title">Información general</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre del producto *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className="input-field"
                    value={formCompraVenta.nombre}
                    onChange={handleCompraVentaChange}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label>Estado *</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="estado"
                        value="activo"
                        checked={formCompraVenta.estado === "activo"}
                        onChange={handleCompraVentaChange}
                        disabled={submitting}
                      />
                      Activo
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="estado"
                        value="inactivo"
                        checked={formCompraVenta.estado === "inactivo"}
                        onChange={handleCompraVentaChange}
                        disabled={submitting}
                      />
                      Inactivo
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="esSubproducto"
                    checked={formCompraVenta.esSubproducto}
                    onChange={handleCompraVentaChange}
                    disabled={submitting}
                  />
                  Subproducto de
                </label>

                {formCompraVenta.esSubproducto && (
                  <select
                    name="clasificacionId"
                    className="input-field"
                    value={formCompraVenta.clasificacionId}
                    onChange={handleCompraVentaChange}
                    disabled={submitting}
                  >
                    <option value="">Seleccione una categoría</option>
                    {clasificaciones.map((clasificacion) => (
                      <option key={clasificacion.id} value={clasificacion.id}>
                        {clasificacion.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">Información de compra</h2>
              <div className="form-group">
                <label htmlFor="descripcionCompra">Descripción del producto al comprarlo</label>
                <textarea
                  id="descripcionCompra"
                  name="descripcionCompra"
                  className="input-field textarea"
                  value={formCompraVenta.descripcionCompra}
                  onChange={handleCompraVentaChange}
                  disabled={submitting}
                ></textarea>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="costo">Costo *</label>
                  <input
                    type="text"
                    id="costo"
                    name="costo"
                    className="input-field"
                    value={formCompraVenta.costo}
                    onChange={(e) => {
                      const value = e.target.value
                      // Solo permitir números y punto decimal
                      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                        handleCompraVentaChange({
                          target: {
                            name: e.target.name,
                            value: value,
                          },
                        })
                      }
                    }}
                    required
                    disabled={submitting}
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="proveedorId">Proveedor</label>
                  <select
                    id="proveedorId"
                    name="proveedorId"
                    className="input-field"
                    value={formCompraVenta.proveedorId}
                    onChange={handleCompraVentaChange}
                    disabled={submitting}
                    style={{ color: "#333333" }} // Forzar color de texto
                  >
                    <option value="" style={{ color: "#333333" }}>
                      Seleccione un proveedor
                    </option>
                    {proveedores.map((proveedor) => (
                      <option key={proveedor.id} value={proveedor.id} style={{ color: "#333333" }}>
                        {proveedor.nombre_compania || proveedor.nombre || "Proveedor sin nombre"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">Información de venta</h2>
              <div className="form-group">
                <label htmlFor="descripcionVenta">Descripción del producto al venderlo</label>
                <textarea
                  id="descripcionVenta"
                  name="descripcionVenta"
                  className="input-field textarea"
                  value={formCompraVenta.descripcionVenta}
                  onChange={handleCompraVentaChange}
                  disabled={submitting}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="precioVenta">Precio de venta *</label>
                <input
                  type="text"
                  id="precioVenta"
                  name="precioVenta"
                  className="input-field"
                  value={formCompraVenta.precioVenta}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                      handleCompraVentaChange({
                        target: {
                          name: e.target.name,
                          value: value,
                        },
                      })
                    }
                  }}
                  required
                  disabled={submitting}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="enInventario"
                    checked={formCompraVenta.enInventario}
                    onChange={handleCompraVentaChange}
                    disabled={submitting}
                  />
                  El producto pertenece a un inventario
                </label>
              </div>

              {formCompraVenta.enInventario && (
                <div className="inventario-section">
                  <h2 className="section-title">Información de inventario</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="minimo">Mínimo</label>
                      <input
                        type="text"
                        id="minimo"
                        name="minimo"
                        className="input-field"
                        value={formCompraVenta.minimo}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            handleCompraVentaChange({
                              target: {
                                name: e.target.name,
                                value: value,
                              },
                            })
                          }
                        }}
                        disabled={submitting}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="maximo">Máximo</label>
                      <input
                        type="text"
                        id="maximo"
                        name="maximo"
                        className="input-field"
                        value={formCompraVenta.maximo}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            handleCompraVentaChange({
                              target: {
                                name: e.target.name,
                                value: value,
                              },
                            })
                          }
                        }}
                        disabled={submitting}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="existencia">En existencia</label>
                      <input
                        type="text"
                        id="existencia"
                        name="existencia"
                        className="input-field"
                        value={formCompraVenta.existencia}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            handleCompraVentaChange({
                              target: {
                                name: e.target.name,
                                value: value,
                              },
                            })
                          }
                        }}
                        disabled={submitting}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="valorTotal">Valor total</label>
                      <input
                        type="text"
                        id="valorTotal"
                        name="valorTotal"
                        className="input-field"
                        value={formCompraVenta.valorTotal}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            handleCompraVentaChange({
                              target: {
                                name: e.target.name,
                                value: value,
                              },
                            })
                          }
                        }}
                        disabled={submitting}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="fechaInicio">A partir de</label>
                      <input
                        type="date"
                        id="fechaInicio"
                        name="fechaInicio"
                        className="input-field"
                        value={formCompraVenta.fechaInicio}
                        onChange={handleCompraVentaChange}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <FiLoader className="btn-icon spinner" /> Guardando...
                  </>
                ) : (
                  <>
                    <FiSave className="btn-icon" /> Guardar
                  </>
                )}
              </button>
              <button type="button" className="btn btn-outline" onClick={handleReset} disabled={submitting}>
                <FiX className="btn-icon" /> Cancelar
              </button>
            </div>
          </motion.form>
        )}

        {tipoSeleccionado === "manufactura" && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="producto-form"
            onSubmit={handleSubmit}
          >
            <div className="form-section">
              <h2 className="section-title">Información general</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre del producto *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className="input-field"
                    value={formManufactura.nombre}
                    onChange={handleManufacturaChange}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label>Estado *</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="estado"
                        value="activo"
                        checked={formManufactura.estado === "activo"}
                        onChange={handleManufacturaChange}
                        disabled={submitting}
                      />
                      Activo
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="estado"
                        value="inactivo"
                        checked={formManufactura.estado === "inactivo"}
                        onChange={handleManufacturaChange}
                        disabled={submitting}
                      />
                      Inactivo
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="esSubproducto"
                    checked={formManufactura.esSubproducto}
                    onChange={handleManufacturaChange}
                    disabled={submitting}
                  />
                  Subproducto de
                </label>

                {formManufactura.esSubproducto && (
                  <select
                    name="clasificacionId"
                    className="input-field"
                    value={formManufactura.clasificacionId}
                    onChange={handleManufacturaChange}
                    disabled={submitting}
                  >
                    <option value="">Seleccione una categoría</option>
                    {clasificaciones.map((clasificacion) => (
                      <option key={clasificacion.id} value={clasificacion.id}>
                        {clasificacion.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción del producto</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  className="input-field textarea"
                  value={formManufactura.descripcion}
                  onChange={handleManufacturaChange}
                  disabled={submitting}
                ></textarea>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="costo">Costo *</label>
                  <input
                    type="text"
                    id="costo"
                    name="costo"
                    className="input-field"
                    value={formManufactura.costo}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                        handleManufacturaChange({
                          target: {
                            name: e.target.name,
                            value: value,
                          },
                        })
                      }
                    }}
                    required
                    disabled={submitting}
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="precioVenta">Precio de venta *</label>
                  <input
                    type="text"
                    id="precioVenta"
                    name="precioVenta"
                    className="input-field"
                    value={formManufactura.precioVenta}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                        handleManufacturaChange({
                          target: {
                            name: e.target.name,
                            value: value,
                          },
                        })
                      }
                    }}
                    required
                    disabled={submitting}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">Lista de materiales</h2>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={agregarMaterial}
                  disabled={submitting}
                >
                  <FiPlus className="btn-icon" /> Agregar material
                </button>
              </div>

              {formManufactura.materiales.length > 0 ? (
                <div className="materiales-table-container">
                  <table className="materiales-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Descripción</th>
                        <th>Tipo</th>
                        <th>Costo</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formManufactura.materiales.map((material) => (
                        <tr key={material.id}>
                          <td>
                            <select
                              className="input-field"
                              value={material.productoId}
                              onChange={(e) => actualizarMaterial(material.id, "productoId", e.target.value)}
                              disabled={submitting}
                            >
                              <option value="">Seleccionar producto</option>
                              {productos && productos.length > 0 ? (
                                productos.map((producto) => (
                                  <option key={producto.id} value={producto.id}>
                                    {producto.nombre}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  No hay productos disponibles
                                </option>
                              )}
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="input-field"
                              value={material.descripcion}
                              onChange={(e) => actualizarMaterial(material.id, "descripcion", e.target.value)}
                              disabled={submitting}
                            />
                          </td>
                          <td>{material.tipo}</td>
                          <td>{material.costo.toFixed(2)}</td>
                          <td>
                            <input
                              type="text"
                              className="input-field"
                              value={material.cantidad}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                                  actualizarMaterial(
                                    material.id,
                                    "cantidad",
                                    value === "" ? 0 : Number.parseFloat(value),
                                  )
                                }
                              }}
                              disabled={submitting}
                              placeholder="0.00"
                            />
                          </td>
                          <td>{material.subtotal.toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-icon-only"
                              onClick={() => eliminarMaterial(material.id)}
                              disabled={submitting}
                            >
                              <FiTrash2 className="icon-delete" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="5" className="total-label">
                          Total de costo:
                        </td>
                        <td colSpan="2" className="total-value">
                          ${calcularTotalCostoMateriales().toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="empty-message">
                  No hay materiales agregados. Haga clic en "Agregar material" para comenzar.
                </p>
              )}
            </div>

            <div className="form-section">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="enInventario"
                    checked={formManufactura.enInventario}
                    onChange={handleManufacturaChange}
                    disabled={submitting}
                  />
                  El producto pertenece a un inventario
                </label>
              </div>

              {formManufactura.enInventario && (
                <div className="inventario-section">
                  <h2 className="section-title">Información de inventario</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="minimo">Mínimo</label>
                      <input
                        type="text"
                        id="minimo"
                        name="minimo"
                        className="input-field"
                        value={formManufactura.minimo}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            handleManufacturaChange({
                              target: {
                                name: e.target.name,
                                value: value,
                              },
                            })
                          }
                        }}
                        disabled={submitting}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="maximo">Máximo</label>
                      <input
                        type="text"
                        id="maximo"
                        name="maximo"
                        className="input-field"
                        value={formManufactura.maximo}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            handleManufacturaChange({
                              target: {
                                name: e.target.name,
                                value: value,
                              },
                            })
                          }
                        }}
                        disabled={submitting}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="existencia">En existencia</label>
                      <input
                        type="text"
                        id="existencia"
                        name="existencia"
                        className="input-field"
                        value={formManufactura.existencia}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            handleManufacturaChange({
                              target: {
                                name: e.target.name,
                                value: value,
                              },
                            })
                          }
                        }}
                        disabled={submitting}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="valorTotal">Valor total</label>
                      <input
                        type="text"
                        id="valorTotal"
                        name="valorTotal"
                        className="input-field"
                        value={formManufactura.valorTotal}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            handleManufacturaChange({
                              target: {
                                name: e.target.name,
                                value: value,
                              },
                            })
                          }
                        }}
                        disabled={submitting}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="fechaInicio">A partir de</label>
                      <input
                        type="date"
                        id="fechaInicio"
                        name="fechaInicio"
                        className="input-field"
                        value={formManufactura.fechaInicio}
                        onChange={handleManufacturaChange}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <FiLoader className="btn-icon spinner" /> Guardando...
                  </>
                ) : (
                  <>
                    <FiSave className="btn-icon" /> Guardar
                  </>
                )}
              </button>
              <button type="button" className="btn btn-outline" onClick={handleReset} disabled={submitting}>
                <FiX className="btn-icon" /> Cancelar
              </button>
            </div>
          </motion.form>
        )}

        {tipoSeleccionado === "servicio" && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="producto-form"
            onSubmit={handleSubmit}
          >
            <div className="form-section">
              <h2 className="section-title">Información del servicio</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre del servicio *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className="input-field"
                    value={formServicio.nombre}
                    onChange={handleServicioChange}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label>Estado *</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="estado"
                        value="activo"
                        checked={formServicio.estado === "activo"}
                        onChange={handleServicioChange}
                        disabled={submitting}
                      />
                      Activo
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="estado"
                        value="inactivo"
                        checked={formServicio.estado === "inactivo"}
                        onChange={handleServicioChange}
                        disabled={submitting}
                      />
                      Inactivo
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción del servicio</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  className="input-field textarea"
                  value={formServicio.descripcion}
                  onChange={handleServicioChange}
                  disabled={submitting}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="precio">Precio del servicio *</label>
                <input
                  type="text"
                  id="precio"
                  name="precio"
                  className="input-field"
                  value={formServicio.precio}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                      handleServicioChange({
                        target: {
                          name: e.target.name,
                          value: value,
                        },
                      })
                    }
                  }}
                  required
                  disabled={submitting}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <FiLoader className="btn-icon spinner" /> Guardando...
                  </>
                ) : (
                  <>
                    <FiSave className="btn-icon" /> Guardar
                  </>
                )}
              </button>
              <button type="button" className="btn btn-outline" onClick={handleReset} disabled={submitting}>
                <FiX className="btn-icon" /> Cancelar
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </Layout>
  )
}

export default AgregarProductoPage
