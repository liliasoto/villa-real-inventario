"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/layout/Layout"
import { motion } from "framer-motion"
import { FiSearch, FiX, FiTrash2, FiDownload, FiLoader } from "react-icons/fi"
import { productosCompraVentaService, productosManufacturaService, serviciosService } from "../services/api"
import { showToast } from "../utils/toast"
import "../styles/ver-productos.css"
import "../styles/toast.css"

const VerProductosPage = () => {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [productosFiltrados, setProductosFiltrados] = useState([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)
  const [exportando, setExportando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [seleccionados, setSeleccionados] = useState([])
  const [todosLosProductos, setTodosLosProductos] = useState({
    compraVenta: [],
    manufactura: [],
    servicios: [],
  })

  // Cargar todos los productos al iniciar
  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true)
      try {
        // Obtener todos los productos de los tres tipos
        const [compraVentaRes, manufacturaRes, serviciosRes] = await Promise.all([
          productosCompraVentaService.getAll(),
          productosManufacturaService.getAll(),
          serviciosService.getAll(),
        ])

        // Guardar todos los productos para la exportación a Excel
        setTodosLosProductos({
          compraVenta: compraVentaRes.data || [],
          manufactura: manufacturaRes.data || [],
          servicios: serviciosRes.data || [],
        })

        // Formatear los productos para la tabla
        const productosFormateados = [
          ...(compraVentaRes.data || []).map((p) => ({
            id: p.id,
            itemId: p.item_id,
            nombre: p.nombre,
            precio: p.precio_venta,
            tipo: "compra_venta",
          })),
          ...(manufacturaRes.data || []).map((p) => ({
            id: p.id,
            itemId: p.item_id,
            nombre: p.nombre,
            precio: p.precio_venta,
            tipo: "manufactura",
          })),
          ...(serviciosRes.data || []).map((p) => ({
            id: p.id,
            itemId: p.item_id,
            nombre: p.nombre,
            precio: p.precio_venta,
            tipo: "servicio",
          })),
        ]

        setProductos(productosFormateados)
        setProductosFiltrados(productosFormateados)

      } catch (error) {
        console.error("Error al cargar productos:", error)
        showToast({
          type: "error",
          title: "Error",
          message: "No se pudieron cargar los productos. Por favor, intente nuevamente.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [])

  // Filtrar productos según la búsqueda
  useEffect(() => {
    if (busqueda.trim() === "") {
      setProductosFiltrados(productos)
    } else {
      const filtrados = productos.filter((producto) => producto.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      setProductosFiltrados(filtrados)

      if (filtrados.length === 0 && busqueda.trim() !== "") {
        showToast({
          type: "info",
          title: "Búsqueda",
          message: "No se encontraron productos que coincidan con su búsqueda.",
        })
      }
    }
  }, [busqueda, productos])

  // Manejar cambios en la búsqueda
  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value)
  }

  // Limpiar búsqueda
  const handleLimpiarBusqueda = () => {
    setBusqueda("")
    showToast({
      type: "info",
      title: "Búsqueda limpiada",
      message: "Se ha limpiado el filtro de búsqueda.",
    })
  }

  // Manejar selección de producto
  const handleSeleccionarProducto = (producto) => {
    if (seleccionados.some((p) => p.id === producto.id && p.tipo === producto.tipo)) {
      setSeleccionados(seleccionados.filter((p) => !(p.id === producto.id && p.tipo === producto.tipo)))
    } else {
      setSeleccionados([...seleccionados, producto])

      if (seleccionados.length === 0) {
        showToast({
          type: "info",
          title: "Producto seleccionado",
          message: "Puede seleccionar más productos o realizar acciones con el seleccionado.",
        })
      }
    }
  }

  // Eliminar productos seleccionados
  const handleEliminarSeleccionados = async () => {
    if (seleccionados.length === 0) {
      showToast({
        type: "warning",
        title: "Advertencia",
        message: "No hay productos seleccionados para eliminar.",
      })
      return
    }

    // Usar SweetAlert2 para la confirmación
    const Swal = (await import("sweetalert2")).default
    const result = await Swal.fire({
      title: "¿Está seguro?",
      text: `¿Desea eliminar ${seleccionados.length} producto(s) seleccionado(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (!result.isConfirmed) {
      return
    }

    setEliminando(true)

    try {
      // Eliminar cada producto seleccionado según su tipo
      for (const producto of seleccionados) {
        switch (producto.tipo) {
          case "compra_venta":
            await productosCompraVentaService.delete(producto.id)
            break
          case "manufactura":
            await productosManufacturaService.delete(producto.id)
            break
          case "servicio":
            await serviciosService.delete(producto.id)
            break
          default:
            console.error("Tipo de producto desconocido:", producto.tipo)
        }
      }

      // Actualizar la lista de productos
      const nuevosProductos = productos.filter((p) => !seleccionados.some((s) => s.id === p.id && s.tipo === p.tipo))
      setProductos(nuevosProductos)
      setProductosFiltrados(
        nuevosProductos.filter((producto) => producto.nombre.toLowerCase().includes(busqueda.toLowerCase())),
      )
      setSeleccionados([])

      showToast({
        type: "success",
        title: "Éxito",
        message: `${seleccionados.length} producto(s) han sido eliminados correctamente.`,
      })
    } catch (error) {
      console.error("Error al eliminar productos:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "No se pudieron eliminar algunos productos. Por favor, intente nuevamente.",
      })
    } finally {
      setEliminando(false)
    }
  }

  // Exportar a Excel
  const handleExportarExcel = async () => {
    setExportando(true)

    try {
      // Importar la biblioteca xlsx dinámicamente
      const XLSX = await import("xlsx")

      // Crear hojas de trabajo para cada tipo de producto
      const wsCompraVenta = XLSX.utils.json_to_sheet(todosLosProductos.compraVenta)
      const wsManufactura = XLSX.utils.json_to_sheet(todosLosProductos.manufactura)
      const wsServicios = XLSX.utils.json_to_sheet(todosLosProductos.servicios)

      // Crear libro de trabajo y añadir las hojas
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, wsCompraVenta, "Productos compra-venta")
      XLSX.utils.book_append_sheet(wb, wsManufactura, "Productos manufactura")
      XLSX.utils.book_append_sheet(wb, wsServicios, "Servicios")

      // Generar el archivo Excel y descargarlo
      XLSX.writeFile(wb, "Productos_Inventario.xlsx")

      showToast({
        type: "success",
        title: "Éxito",
        message: "El archivo Excel ha sido generado y descargado correctamente.",
      })
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "No se pudo generar el archivo Excel. Por favor, intente nuevamente.",
      })
    } finally {
      setExportando(false)
    }
  }

  return (
    <Layout>
      <div className="ver-productos-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header"
        >
          <h1 className="page-title">Productos y servicios</h1>
          <p className="page-subtitle">Gestione todos los productos y servicios del inventario</p>
        </motion.div>

        <div className="search-container">
          <div className="search-input-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar productos por nombre..."
              value={busqueda}
              onChange={handleBusquedaChange}
            />
            {busqueda && (
              <button className="clear-search-button" onClick={handleLimpiarBusqueda}>
                <FiX />
              </button>
            )}
          </div>
        </div>

        <div className="productos-table-container">
          {loading ? (
            <div className="loading-container">
              <FiLoader className="spinner" />
              <p>Cargando productos...</p>
            </div>
          ) : productosFiltrados.length > 0 ? (
            <table className="productos-table">
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={productosFiltrados.length > 0 && seleccionados.length === productosFiltrados.length}
                      onChange={() => {
                        if (seleccionados.length === productosFiltrados.length) {
                          setSeleccionados([])
                        } else {
                          setSeleccionados([...productosFiltrados])
                          showToast({
                            type: "info",
                            title: "Selección",
                            message: `Se han seleccionado todos los productos (${productosFiltrados.length}).`,
                          })
                        }
                      }}
                    />
                  </th>
                  <th>Nombre</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((producto) => (
                  <tr
                    key={`${producto.tipo}-${producto.id}`}
                    className={
                      seleccionados.some((p) => p.id === producto.id && p.tipo === producto.tipo) ? "selected" : ""
                    }
                    onClick={() => handleSeleccionarProducto(producto)}
                  >
                    <td className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={seleccionados.some((p) => p.id === producto.id && p.tipo === producto.tipo)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSeleccionarProducto(producto)
                        }}
                      />
                    </td>
                    <td>{producto.nombre}</td>
                    <td>${producto.precio ? Number.parseFloat(producto.precio).toFixed(2) : "0.00"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              <p>No se encontraron productos que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>

        <div className="actions-container">
          <button
            className="btn btn-danger"
            onClick={handleEliminarSeleccionados}
            disabled={eliminando || seleccionados.length === 0}
          >
            {eliminando ? (
              <>
                <FiLoader className="btn-icon spinner" /> Eliminando...
              </>
            ) : (
              <>
                <FiTrash2 className="btn-icon" /> Eliminar
              </>
            )}
          </button>
          <button className="btn btn-primary" onClick={handleExportarExcel} disabled={exportando}>
            {exportando ? (
              <>
                <FiLoader className="btn-icon spinner" /> Exportando...
              </>
            ) : (
              <>
                <FiDownload className="btn-icon" /> Exportar a Excel
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default VerProductosPage
