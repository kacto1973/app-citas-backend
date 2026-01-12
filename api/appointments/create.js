import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

async function handler(req, res) {
  await cors(req, res);

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
        return fail(res, "El carrito de servicios no puede estar vacío", 400);
      }

      if (!cellphone) {
        return fail(res, "Número de teléfono requerido", 400);
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

      return success(res, null, 201);
    } catch (error) {
      console.error("Error en addAppointment:", error);
      return fail(res, "Error al crear la cita", 500);
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
