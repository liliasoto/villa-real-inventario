// Utilidad para mostrar notificaciones toast
export const showToast = ({ type = "info", title, message, duration = 5000 }) => {
    // Crear y disparar un evento personalizado
    const event = new CustomEvent("showToast", {
      detail: { type, title, message, duration },
    })
  
    window.dispatchEvent(event)
  }
  
  