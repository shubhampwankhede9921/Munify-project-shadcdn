import Swal from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"

// const Swal = Swal.mixin({
//   toast: true,
//   position: "top-end",
//   showConfirmButton: false,
//   timer: 2500,
//   timerProgressBar: true,
// })

export const alerts = {
  success: (title: string, text?: string) =>
    Swal.fire({ 
      icon: "success", 
      title, 
      text,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true,
    }),

  error: (title: string, text?: string) =>
    Swal.fire({ 
      icon: "error", 
      title, 
      text,
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: true,
    }),

  info: (title: string, text?: string) =>
    Swal.fire({ 
      icon: "info", 
      title, 
      text,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true,
    }),

  warn: (title: string, text?: string) =>
    Swal.fire({ 
      icon: "warning", 
      title, 
      text,
      timer: 3500,
      timerProgressBar: true,
      showConfirmButton: true,
    }),

  // Dialogs
  confirm: (title: string, text?: string) =>
    Swal.fire({
      icon: "question",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      // No timer for confirm dialogs as they require user interaction
    }),
}
