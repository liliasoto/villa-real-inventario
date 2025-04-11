"use client"

import { useState, useEffect } from "react"
import { FiX, FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo } from "react-icons/fi"
import "../../styles/toast.css"

const Toast = ({ id, type = "info", title, message, duration = 5000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(id)
    }, 300) // Duración de la animación de salida
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FiCheckCircle className="toast-icon" />
      case "error":
        return <FiAlertCircle className="toast-icon" />
      case "warning":
        return <FiAlertTriangle className="toast-icon" />
      case "info":
      default:
        return <FiInfo className="toast-icon" />
    }
  }

  return (
    <div className={`toast toast-${type} ${isExiting ? "toast-exit" : ""}`}>
      {getIcon()}
      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        {message && <div className="toast-message">{message}</div>}
      </div>
      <button className="toast-close" onClick={handleClose}>
        <FiX />
      </button>
    </div>
  )
}

export default Toast

