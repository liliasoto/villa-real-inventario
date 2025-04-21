"use client"

// src/pages/LoginPage.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { motion } from "framer-motion"
import "../styles/login.css"
import "../styles/toast.css"
import logo from "../assets/logo.png"
import { showToast } from "../utils/toast"

const LoginPage = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!username || !password) {
      showToast({
        type: "error",
        title: "Error de validación",
        message: "Por favor ingresa usuario y contraseña",
      })
      return
    }

    const success = login(username, password)

    if (success) {
      showToast({
        type: "success",
        title: "Inicio de sesión exitoso",
        message: "Bienvenido al sistema de inventario Villa Real",
      })
      navigate("/")
    } else {
      showToast({
        type: "error",
        title: "Error de autenticación",
        message: "Usuario o contraseña incorrectos",
      })
    }
  }

  return (
    <div className="login-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="login-container"
      >
        <div className="login-logo">
          <img src={logo || "/placeholder.svg"} alt="Villa Real Logo" />
        </div>
        <h2 className="login-title">Iniciar sesión</h2>
        <p className="login-subtitle">Sistema de Inventario Villa Real</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              className="input-field"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <br></br>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input-field"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary login-button">
            Iniciar sesión
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default LoginPage
