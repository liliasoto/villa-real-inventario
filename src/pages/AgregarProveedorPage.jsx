"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/layout/Layout"
import { motion } from "framer-motion"
import { FiSave, FiX, FiArrowRight, FiLoader } from "react-icons/fi"
import { proveedoresService } from "../services/api"
import { showToast } from "../utils/toast"
import "../styles/agregar-proveedor.css"
import "../styles/toast.css"

const AgregarProveedorPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("direccion")
  const [submitting, setSubmitting] = useState(false)

  // Estado para el formulario de proveedor
  const [formProveedor, setFormProveedor] = useState({
    // Información de dirección
    nombre_compania: "",
    nombre_completo: "",
    puesto: "",
    telefono_principal: "",
    telefono_otro1: "",
    telefono_otro2: "",
    telefono_otro3: "",
    email: "",
    website: "",
    otro1: "",
    otro2: "",
    direccion_cliente: "",
    direccion_entrega: "",

    // Información de pago
    rfc: "",
    cuenta_banco: "",
    clabe: "",
    nombre_banco: "",
    limite_credito: "",
    condiciones_pago: "Pago al recibir",

    // Estado
    estado: "activo",
  })

  // Manejador para cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormProveedor({
      ...formProveedor,
      [name]: value,
    })
  }

  // Manejador para copiar dirección del cliente a dirección de entrega
  const handleCopyAddress = () => {
    setFormProveedor({
      ...formProveedor,
      direccion_entrega: formProveedor.direccion_cliente,
    })

    showToast({
      type: "info",
      title: "Dirección copiada",
      message: "La dirección del cliente ha sido copiada a la dirección de entrega.",
    })
  }

  // Manejador para cambiar de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab)

    showToast({
      type: "info",
      title: "Cambio de sección",
      message:
        tab === "direccion"
          ? "Ahora está en la sección de información de dirección."
          : "Ahora está en la sección de información de pago.",
    })
  }

  // Validar formulario
  const validarFormulario = () => {
    // Campos obligatorios según la estructura de la tabla
    if (!formProveedor.nombre_compania.trim()) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El nombre de la compañía es obligatorio.",
      })
      setActiveTab("direccion")
      return false
    }

    if (!formProveedor.nombre_completo.trim()) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El nombre completo es obligatorio.",
      })
      setActiveTab("direccion")
      return false
    }

    if (!formProveedor.telefono_principal.trim()) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El teléfono principal es obligatorio.",
      })
      setActiveTab("direccion")
      return false
    }

    if (!formProveedor.email.trim()) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El correo electrónico es obligatorio.",
      })
      setActiveTab("direccion")
      return false
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formProveedor.email.trim())) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El formato del correo electrónico no es válido.",
      })
      setActiveTab("direccion")
      return false
    }

    return true
  }

  // Manejador para enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) return

    setSubmitting(true)

    try {
      // Preparar datos para enviar al backend
      const datosParaEnviar = {
        ...formProveedor,
        limite_credito: formProveedor.limite_credito ? Number.parseFloat(formProveedor.limite_credito) : null,
      }

      console.log("Enviando datos de proveedor:", datosParaEnviar)
      const response = await proveedoresService.create(datosParaEnviar)
      console.log("Respuesta del servidor:", response.data)

      showToast({
        type: "success",
        title: "Guardado exitoso",
        message: `El proveedor "${formProveedor.nombre_compania}" ha sido guardado correctamente.`,
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
    setFormProveedor({
      nombre_compania: "",
      nombre_completo: "",
      puesto: "",
      telefono_principal: "",
      telefono_otro1: "",
      telefono_otro2: "",
      telefono_otro3: "",
      email: "",
      website: "",
      otro1: "",
      otro2: "",
      direccion_cliente: "",
      direccion_entrega: "",
      rfc: "",
      cuenta_banco: "",
      clabe: "",
      nombre_banco: "",
      limite_credito: "",
      condiciones_pago: "Pago al recibir",
      estado: "activo",
    })
    setActiveTab("direccion")
  }

  return (
    <Layout>
      <div className="agregar-proveedor-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header"
        >
          <h1 className="page-title">Agregar proveedor</h1>
          <p className="page-subtitle">Complete el formulario para agregar un nuevo proveedor al sistema</p>
        </motion.div>

        <div className="proveedor-form-container">
          <div className="tabs-container">
            <div
              className={`tab ${activeTab === "direccion" ? "active" : ""}`}
              onClick={() => handleTabChange("direccion")}
            >
              Información de dirección
            </div>
            <div className={`tab ${activeTab === "pago" ? "active" : ""}`} onClick={() => handleTabChange("pago")}>
              Información de pago
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="proveedor-form"
            onSubmit={handleSubmit}
          >
            {activeTab === "direccion" && (
              <div className="tab-content">
                <div className="form-grid">
                  <div className="form-column">
                    <div className="form-group">
                      <label htmlFor="nombre_compania">Nombre de la compañía *</label>
                      <input
                        type="text"
                        id="nombre_compania"
                        name="nombre_compania"
                        className="input-field"
                        value={formProveedor.nombre_compania}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="nombre_completo">Nombre completo *</label>
                      <input
                        type="text"
                        id="nombre_completo"
                        name="nombre_completo"
                        className="input-field"
                        value={formProveedor.nombre_completo}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="puesto">Puesto</label>
                      <input
                        type="text"
                        id="puesto"
                        name="puesto"
                        className="input-field"
                        value={formProveedor.puesto}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="telefono_principal">Teléfono principal *</label>
                      <input
                        type="tel"
                        id="telefono_principal"
                        name="telefono_principal"
                        className="input-field"
                        value={formProveedor.telefono_principal}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="telefono_otro1">Otro teléfono 1</label>
                      <input
                        type="tel"
                        id="telefono_otro1"
                        name="telefono_otro1"
                        className="input-field"
                        value={formProveedor.telefono_otro1}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="telefono_otro2">Otro teléfono 2</label>
                      <input
                        type="tel"
                        id="telefono_otro2"
                        name="telefono_otro2"
                        className="input-field"
                        value={formProveedor.telefono_otro2}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="telefono_otro3">Otro teléfono 3</label>
                      <input
                        type="tel"
                        id="telefono_otro3"
                        name="telefono_otro3"
                        className="input-field"
                        value={formProveedor.telefono_otro3}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="form-column">
                    <div className="form-group">
                      <label htmlFor="email">Correo electrónico *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="input-field"
                        value={formProveedor.email}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="website">Website</label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        className="input-field"
                        value={formProveedor.website}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="otro1">Otro 1</label>
                      <input
                        type="text"
                        id="otro1"
                        name="otro1"
                        className="input-field"
                        value={formProveedor.otro1}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="otro2">Otro 2</label>
                      <input
                        type="text"
                        id="otro2"
                        name="otro2"
                        className="input-field"
                        value={formProveedor.otro2}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="direcciones-container">
                  <h3 className="direcciones-title">Detalles de la dirección</h3>
                  <div className="direcciones-grid">
                    <div className="form-group">
                      <label htmlFor="direccion_cliente">Dirección del cliente</label>
                      <textarea
                        id="direccion_cliente"
                        name="direccion_cliente"
                        className="input-field textarea"
                        value={formProveedor.direccion_cliente}
                        onChange={handleChange}
                        disabled={submitting}
                      ></textarea>
                    </div>

                    <div className="copy-button-container">
                      <button
                        type="button"
                        className="copy-button"
                        onClick={handleCopyAddress}
                        disabled={submitting || !formProveedor.direccion_cliente}
                      >
                        <FiArrowRight className="copy-icon" />
                      </button>
                    </div>

                    <div className="form-group">
                      <label htmlFor="direccion_entrega">Dirección de entrega</label>
                      <textarea
                        id="direccion_entrega"
                        name="direccion_entrega"
                        className="input-field textarea"
                        value={formProveedor.direccion_entrega}
                        onChange={handleChange}
                        disabled={submitting}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pago" && (
              <div className="tab-content">
                <div className="form-grid">
                  <div className="form-column">
                    <div className="form-group">
                      <label htmlFor="rfc">RFC</label>
                      <input
                        type="text"
                        id="rfc"
                        name="rfc"
                        className="input-field"
                        value={formProveedor.rfc}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="cuenta_banco">Cuenta de banco</label>
                      <input
                        type="text"
                        id="cuenta_banco"
                        name="cuenta_banco"
                        className="input-field"
                        value={formProveedor.cuenta_banco}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="clabe">CLABE interbancaria</label>
                      <input
                        type="text"
                        id="clabe"
                        name="clabe"
                        className="input-field"
                        value={formProveedor.clabe}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="nombre_banco">Nombre del banco</label>
                      <input
                        type="text"
                        id="nombre_banco"
                        name="nombre_banco"
                        className="input-field"
                        value={formProveedor.nombre_banco}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="form-column">
                    <div className="form-group">
                      <label htmlFor="limite_credito">Límite de crédito</label>
                      <input
                        type="text"
                        id="limite_credito"
                        name="limite_credito"
                        className="input-field"
                        value={formProveedor.limite_credito}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                            handleChange({
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
                      <label htmlFor="condiciones_pago">Condiciones de pago</label>
                      <select
                        id="condiciones_pago"
                        name="condiciones_pago"
                        className="input-field"
                        value={formProveedor.condiciones_pago}
                        onChange={handleChange}
                        disabled={submitting}
                      >
                        <option value="Consignacion">Consignación</option>
                        <option value="Pago al recibir">Pago al recibir</option>
                        <option value="Pago a 15 dias">Pago a 15 días</option>
                        <option value="Pago a 30 dias">Pago a 30 días</option>
                        <option value="Pago a 60 dias">Pago a 60 días</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.form>
        </div>

        <div className="form-footer">
          <div className="estado-container">
            <label>Estado</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="estado"
                  value="activo"
                  checked={formProveedor.estado === "activo"}
                  onChange={handleChange}
                  disabled={submitting}
                />
                Activo
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="estado"
                  value="inactivo"
                  checked={formProveedor.estado === "inactivo"}
                  onChange={handleChange}
                  disabled={submitting}
                />
                Inactivo
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
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
        </div>
      </div>
    </Layout>
  )
}

export default AgregarProveedorPage
