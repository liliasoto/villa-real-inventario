import Swal from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"

export const showToast = ({ type, title, message }) => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer)
      toast.addEventListener("mouseleave", Swal.resumeTimer)
    },
  })

  const iconColors = {
    success: "#4ade80", // Verde
    error: "#f87171", // Rojo
    warning: "#fbbf24", // Amarillo
    info: "#60a5fa", // Azul
  }

  Toast.fire({
    icon: type,
    title: `<span style="color: #333">${title}</span>`,
    html: `<span style="color: #555">${message}</span>`,
    background: "#fff",
    iconColor: iconColors[type] || "#60a5fa",
    customClass: {
      popup: "custom-toast-popup",
      title: "custom-toast-title",
      htmlContainer: "custom-toast-message",
    },
  })
}
