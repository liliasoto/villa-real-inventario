"use client"

import { useState } from "react"
import Layout from "../components/layout/Layout"
import { motion } from "framer-motion"
import { FiSave, FiX, FiLoader } from "react-icons/fi"
import { clasificacionesService } from "../services/api"
import { showToast } from "../utils/toast"
import "../styles/agregar-producto.css"
import "../styles/toast.css" 

const AgregarCategoriaPage = () => {
  const [submitting, setSubmitting] = useState(false)

  // Estado para formulario de Categoría
  const [formCategoria, setFormCategoria] = useState({
    nombre: "",
  })

  // Manejadores para formulario de Categoría
  const handleCategoriaChange = (e) => {
    const { name, value } = e.target
    setFormCategoria({
      ...formCategoria,
      [name]: value,
    })
  }

  // Validar formulario de Categoría
  const validarFormCategoria = () => {
    if (!formCategoria.nombre) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "El nombre de la categoría es obligatorio.",
      })
      return false
    }
    return true
  }

  // Preparar datos de Categoria para enviar al backend
  const prepararDatosCategoria = () => {
    return {
      nombre: formCategoria.nombre.trim(),
    }
  }

  // Manejador para enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar según el tipo seleccionado
    let esValido = false

    esValido = validarFormCategoria()

    if (!esValido) return

    setSubmitting(true)

    try {
      let response

      const datos = prepararDatosCategoria()
      console.log("Enviando datos de categoria:", datos)
      response = await clasificacionesService.create(datos)

      console.log("Respuesta del servidor:", response.data)

      showToast({
        type: "success",
        title: "Guardado exitoso",
        message: `La categoría "${formCategoria.nombre}" ha sido guardada correctamente.`,
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
    setFormCategoria({
      nombre: "",
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
          <h1 className="page-title">Agregar categorías</h1>
          <p className="page-subtitle">Complete el formulario para agregar una nueva categoría</p>
        </motion.div>
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="producto-form"
          onSubmit={handleSubmit}
        >
          <div className="form-section">
            <h2 className="section-title">Información de la categoría</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombre">Nombre de la categoría*</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className="input-field"
                  value={formCategoria.nombre}
                  onChange={handleCategoriaChange}
                  required
                  disabled={submitting}
                />
              </div>
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
      </div>
    </Layout>
  )
}

export default AgregarCategoriaPage
