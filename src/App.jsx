import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/common/ProtectedRoute"
import ToastContainer from "./components/common/ToastContainer"
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import AgregarProductoPage from "./pages/AgregarProductoPage"
import "./styles/global.css"
import AgregarCategoriaPage from "./pages/AgregarCategoríaPage"
import AgregarProveedorPage from "./pages/AgregarProveedorPage"
import VerProductosPage from "./pages/VerProductosPage"

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agregar-producto"
            element={
              <ProtectedRoute>
                <AgregarProductoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute>
                <AgregarCategoriaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proveedores"
            element={
              <ProtectedRoute>
                <AgregarProveedorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <VerProductosPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

