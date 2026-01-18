// api/appointments.js
import { db } from "../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../utils/response.js";

export default async function handler(req, res) {
  const handled = await cors(req, res);
  if (handled) return;

  const { id } = req.query;
  const path = `businesses/mb_salon/activeAppointments`;

  // 1. GET TODAS las citas
  if (req.method === "GET" && !id) {
    try {
      const snapshot = await db.ref(path).once("value");

      if (snapshot.exists()) {
        const appointments = snapshot.val();
        const appointmentsArray = Object.entries(appointments).map(
          ([id, apt]) => ({ id, ...apt }),
        );
        return success(res, { appointments: appointmentsArray }, 200);
      } else {
        return success(res, null);
      }
    } catch (error) {
      console.error("Error:", error);
      return fail(res, "Error al obtener citas", 500);
    }
  }

  // 2. GET UNA cita por ID
  if (req.method === "GET" && id) {
    try {
      const snapshot = await db.ref(`${path}/${id}`).once("value");

      if (snapshot.exists()) {
        return success(res, { ...snapshot.val() }, 200);
      } else {
        return fail(res, "Cita no encontrada", 404);
      }
    } catch (error) {
      console.error("Error:", error);
      return fail(res, "Error", 500);
    }
  }

  // 3. POST crear cita
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

      if (
        !servicesCart ||
        !Array.isArray(servicesCart) ||
        servicesCart.length === 0
      ) {
        return fail(res, "Carrito vacío", 400);
      }

      if (!cellphone) {
        return fail(res, "Teléfono requerido", 400);
      }

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
          new Date().setHours(new Date().getHours() + 12),
        ).toISOString(),
      };

      await newAppointmentRef.set(appointmentObject);
      return success(res, null, 201);
    } catch (error) {
      console.error("Error:", error);
      return fail(res, "Error al crear cita", 500);
    }
  }

  // 4. DELETE cancelar cita
  if (req.method === "DELETE" && id) {
    try {
      await db.ref(`${path}/${id}`).remove();
      return success(res, null, 200);
    } catch (error) {
      console.error("Error:", error);
      return fail(res, "Error", 500);
    }
  }

  return fail(res, "Método no permitido", 405);
}
