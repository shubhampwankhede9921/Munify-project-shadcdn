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
    Swal.fire({ icon: "success", title, text }),

  error: (title: string, text?: string) =>
    Swal.fire({ icon: "error", title, text }),

  info: (title: string, text?: string) =>
    Swal.fire({ icon: "info", title, text }),

  warn: (title: string, text?: string) =>
    Swal.fire({ icon: "warning", title, text }),

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
    }),
}
