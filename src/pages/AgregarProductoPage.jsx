"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/layout/Layout"
import { motion } from "framer-motion"
import { FiSave, FiX, FiPlus, FiTrash2 } from "react-icons/fi"
import { productosService, clasificacionesService, proveedoresService } from "../services/api"
import "../styles/agregar-producto.css"

const AgregarProductoPage = () => {
  const navigate = useNavigate()
  const [tipoSeleccionado, setTipoSeleccionado] = useState("")
  const [clasificaciones, setClasificaciones] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)

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
    minimo: "",
    maximo: "",
    existencia: "",
    valorTotal: "",
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
    minimo: "",
    maximo: "",
    existencia: "",
    valorTotal: "",
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
          productosService.getAll(),
        ])

        setClasificaciones(clasificacionesRes.data || [])
        setProveedores(proveedoresRes.data || [])
        setProductos(productosRes.data || [])
      } catch (error) {
        console.error("Error al cargar datos:", error)
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

        // Si se actualiza el productoId o la cantidad, recalcular subtotal
        if (campo === "productoId") {
          const productoSeleccionado = productos.find((p) => p.id === valor)
          if (productoSeleccionado) {
            materialActualizado.costo = productoSeleccionado.costo || 0
            materialActualizado.tipo = productoSeleccionado.tipo || "N/A"
            materialActualizado.subtotal = materialActualizado.costo * materialActualizado.cantidad
          }
        } else if (campo === "cantidad") {
          materialActualizado.subtotal = materialActualizado.costo * valor
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

  // Manejadores para formulario de Servicio
  const handleServicioChange = (e) => {
    const { name, value } = e.target
    setFormServicio({
      ...formServicio,
      [name]: value,
    })
  }

  // Manejador para enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let response

      switch (tipoSeleccionado) {
        case "compra-venta":
          response = await productosService.create({
            ...formCompraVenta,
            tipo: "compra-venta",
          })
          break
        case "manufactura":
          response = await productosService.create({
            ...formManufactura,
            tipo: "manufactura",
          })
          break
        case "servicio":
          // Aquí usaríamos el servicio para servicios
          // response = await serviciosService.create(formServicio);
          break
        default:
          throw new Error("Tipo de producto no válido")
      }

      alert("Producto guardado con éxito")
      handleReset()
    } catch (error) {
      console.error("Error al guardar:", error)
      alert("Error al guardar el producto")
    } finally {
      setLoading(false)
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
      minimo: "",
      maximo: "",
      existencia: "",
      valorTotal: "",
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
      minimo: "",
      maximo: "",
      existencia: "",
      valorTotal: "",
      fechaInicio: new Date().toISOString().split("T")[0],
    })
    setFormServicio({
      nombre: "",
      estado: "activo",
      descripcion: "",
      precio: "",
    })
  }

  return (
    <Layout>
      <div className="agregar-producto-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header"
        >
          <h1 className="page-title">Agregar Producto o Servicio</h1>
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
              <h2 className="section-title">Información General</h2>
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
                  />
                  Subproducto de
                </label>

                {formCompraVenta.esSubproducto && (
                  <select
                    name="clasificacionId"
                    className="input-field"
                    value={formCompraVenta.clasificacionId}
                    onChange={handleCompraVentaChange}
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
              <h2 className="section-title">Información de Compra</h2>
              <div className="form-group">
                <label htmlFor="descripcionCompra">Descripción del producto al comprarlo</label>
                <textarea
                  id="descripcionCompra"
                  name="descripcionCompra"
                  className="input-field textarea"
                  value={formCompraVenta.descripcionCompra}
                  onChange={handleCompraVentaChange}
                ></textarea>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="costo">Costo *</label>
                  <input
                    type="number"
                    id="costo"
                    name="costo"
                    className="input-field"
                    value={formCompraVenta.costo}
                    onChange={handleCompraVentaChange}
                    step="0.01"
                    min="0"
                    required
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
                  >
                    <option value="">Seleccione un proveedor</option>
                    {proveedores.map((proveedor) => (
                      <option key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">Información de Venta</h2>
              <div className="form-group">
                <label htmlFor="descripcionVenta">Descripción del producto al venderlo</label>
                <textarea
                  id="descripcionVenta"
                  name="descripcionVenta"
                  className="input-field textarea"
                  value={formCompraVenta.descripcionVenta}
                  onChange={handleCompraVentaChange}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="precioVenta">Precio de venta *</label>
                <input
                  type="number"
                  id="precioVenta"
                  name="precioVenta"
                  className="input-field"
                  value={formCompraVenta.precioVenta}
                  onChange={handleCompraVentaChange}
                  step="0.01"
                  min="0"
                  required
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
                  />
                  El producto pertenece a un inventario
                </label>
              </div>

              {formCompraVenta.enInventario && (
                <div className="inventario-section">
                  <h2 className="section-title">Información de Inventario</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="minimo">Mínimo</label>
                      <input
                        type="number"
                        id="minimo"
                        name="minimo"
                        className="input-field"
                        value={formCompraVenta.minimo}
                        onChange={handleCompraVentaChange}
                        step="0.0001"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="maximo">Máximo</label>
                      <input
                        type="number"
                        id="maximo"
                        name="maximo"
                        className="input-field"
                        value={formCompraVenta.maximo}
                        onChange={handleCompraVentaChange}
                        step="0.0001"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="existencia">En existencia</label>
                      <input
                        type="number"
                        id="existencia"
                        name="existencia"
                        className="input-field"
                        value={formCompraVenta.existencia}
                        onChange={handleCompraVentaChange}
                        step="0.0001"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="valorTotal">Valor total</label>
                      <input
                        type="number"
                        id="valorTotal"
                        name="valorTotal"
                        className="input-field"
                        value={formCompraVenta.valorTotal}
                        onChange={handleCompraVentaChange}
                        step="0.01"
                        min="0"
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
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <FiSave className="btn-icon" /> Guardar
              </button>
              <button type="button" className="btn btn-outline" onClick={handleReset}>
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
              <h2 className="section-title">Información General</h2>
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
                  />
                  Subproducto de
                </label>

                {formManufactura.esSubproducto && (
                  <select
                    name="clasificacionId"
                    className="input-field"
                    value={formManufactura.clasificacionId}
                    onChange={handleManufacturaChange}
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
                ></textarea>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="costo">Costo *</label>
                  <input
                    type="number"
                    id="costo"
                    name="costo"
                    className="input-field"
                    value={formManufactura.costo}
                    onChange={handleManufacturaChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="precioVenta">Precio de venta *</label>
                  <input
                    type="number"
                    id="precioVenta"
                    name="precioVenta"
                    className="input-field"
                    value={formManufactura.precioVenta}
                    onChange={handleManufacturaChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">Lista de Materiales</h2>
                <button type="button" className="btn btn-outline btn-sm" onClick={agregarMaterial}>
                  <FiPlus className="btn-icon" /> Agregar Material
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
                            >
                              <option value="">Seleccionar producto</option>
                              {productos.map((producto) => (
                                <option key={producto.id} value={producto.id}>
                                  {producto.nombre}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="input-field"
                              value={material.descripcion}
                              onChange={(e) => actualizarMaterial(material.id, "descripcion", e.target.value)}
                            />
                          </td>
                          <td>{material.tipo}</td>
                          <td>{material.costo.toFixed(2)}</td>
                          <td>
                            <input
                              type="number"
                              className="input-field"
                              value={material.cantidad}
                              onChange={(e) =>
                                actualizarMaterial(material.id, "cantidad", Number.parseFloat(e.target.value))
                              }
                              step="0.0001"
                              min="0"
                            />
                          </td>
                          <td>{material.subtotal.toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-icon-only"
                              onClick={() => eliminarMaterial(material.id)}
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
                  No hay materiales agregados. Haga clic en "Agregar Material" para comenzar.
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
                  />
                  El producto pertenece a un inventario
                </label>
              </div>

              {formManufactura.enInventario && (
                <div className="inventario-section">
                  <h2 className="section-title">Información de Inventario</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="minimo">Mínimo</label>
                      <input
                        type="number"
                        id="minimo"
                        name="minimo"
                        className="input-field"
                        value={formManufactura.minimo}
                        onChange={handleManufacturaChange}
                        step="0.0001"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="maximo">Máximo</label>
                      <input
                        type="number"
                        id="maximo"
                        name="maximo"
                        className="input-field"
                        value={formManufactura.maximo}
                        onChange={handleManufacturaChange}
                        step="0.0001"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="existencia">En existencia</label>
                      <input
                        type="number"
                        id="existencia"
                        name="existencia"
                        className="input-field"
                        value={formManufactura.existencia}
                        onChange={handleManufacturaChange}
                        step="0.0001"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="valorTotal">Valor total</label>
                      <input
                        type="number"
                        id="valorTotal"
                        name="valorTotal"
                        className="input-field"
                        value={formManufactura.valorTotal}
                        onChange={handleManufacturaChange}
                        step="0.01"
                        min="0"
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
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <FiSave className="btn-icon" /> Guardar
              </button>
              <button type="button" className="btn btn-outline" onClick={handleReset}>
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
              <h2 className="section-title">Información del Servicio</h2>
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
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="precio">Precio del servicio *</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  className="input-field"
                  value={formServicio.precio}
                  onChange={handleServicioChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <FiSave className="btn-icon" /> Guardar
              </button>
              <button type="button" className="btn btn-outline" onClick={handleReset}>
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

