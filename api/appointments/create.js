import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";

async function handler(req, res) {
  // POST - Crear nueva cita
  if (req.method === "POST") {
    try {
      const {
        servicesCart,
        totalCost,
        selectedDate,
        selectedTime,
        username,
        userFullName,
        totalDurationOfAppointment,
        cellphone,
      } = req.body;

      const path = "businesses/mb_salon/activeAppointments";

      // Validaciones
      if (
        !servicesCart ||
        !Array.isArray(servicesCart) ||
        servicesCart.length === 0
      ) {
        return res.status(400).json({
          success: false,
          error: "El carrito de servicios no puede estar vacío",
        });
      }

      if (!cellphone) {
        return res.status(400).json({
          success: false,
          error: "Número de teléfono requerido",
        });
      }

      // Crear referencia y objeto de cita
      const newAppointmentRef = db.ref(path).push();
      const dateString = new Date(selectedDate).toISOString().split("T")[0];

      const appointmentObject = {
        servicesCart,
        totalCost: Number(totalCost),
        selectedDate: dateString,
        selectedTime,
        username: username || "",
        userFullName,
        totalDurationOfAppointment: Number(totalDurationOfAppointment),
        id: newAppointmentRef.key,
        cellphone,
        state: "no pagado",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(
          new Date().setHours(new Date().getHours() + 12)
        ).toISOString(),
      };

      // Guardar en Firebase
      await newAppointmentRef.set(appointmentObject);

      return res.status(201).json({
        success: true,
        message: "Cita creada exitosamente",
        appointmentId: newAppointmentRef.key,
        data: appointmentObject,
      });
    } catch (error) {
      console.error("Error en addAppointment:", error);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: "Método no permitido",
  });
}

export default cors(handler);
