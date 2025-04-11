"use client"

import { useState, useEffect } from "react"
import Toast from "./Toast"

const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    // Suscribirse al evento personalizado para mostrar toasts
    const handleShowToast = (event) => {
      const { type, title, message, duration } = event.detail
      addToast({ type, title, message, duration })
    }

    window.addEventListener("showToast", handleShowToast)

    return () => {
      window.removeEventListener("showToast", handleShowToast)
    }
  }, [])

  const addToast = ({ type, title, message, duration }) => {
    const id = Date.now()
    setToasts((prevToasts) => [...prevToasts, { id, type, title, message, duration }])
  }

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}

export default ToastContainer

