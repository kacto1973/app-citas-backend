import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

async function handler(req, res) {
  const handled = await cors(req, res);
  if (handled) return;
  const { id } = req.query; // Vercel pasa parámetros dinámicos en req.query
  const path = `businesses/mb_salon/activeAppointments`;

  // GET - Buscar cita por ID
  if (req.method === "GET") {
    try {
      const snapshot = await db.ref(`${path}/${id}`).once("value");

      if (snapshot.exists()) {
        return success(res, { ...snapshot.val() }, 200);
      } else {
        /*// Buscar en todas las citas (por si el ID está en el objeto)
        const allSnap = await db.ref(path).once("value");
        if (allSnap.exists()) {
          const appointments = allSnap.val();
          const foundAppointment = Object.entries(appointments).find(
            ([key, apt]) => apt.id === id || key === id
          );

          if (foundAppointment) {
            return res.status(200).json({
              success: true,
              data: {
                id: foundAppointment[0],
                ...foundAppointment[1],
              },
            });
          }
        } */

        return fail(res, "Cita no encontrada", 404);
      }
    } catch (error) {
      console.error("Error en findAppointmentById:", error);
      return fail(res, "Error interno del servidor", 500);
    }
  }

  // DELETE - Cancelar cita
  if (req.method === "DELETE") {
    try {
      await db.ref(`${path}/${id}`).remove();

      return success(res, null, 200);
    } catch (error) {
      console.error("Error en cancelAppointment:", error);
      return fail(res, "Error interno del servidor", 500);
    }
  }

  // GET expiración de cita
  if (req.method === "GET" && req.query.action === "expiration") {
    try {
      const snapshot = await db.ref(`${path}/${id}`).once("value");

      if (snapshot.exists()) {
        const appointment = snapshot.val();
        return success(res, { expiresAt: appointment.expiresAt }, 200);
      } else {
        return fail(res, "Cita no encontrada", 404);
      }
    } catch (error) {
      console.error("Error en getAppointmentExpirationTime:", error);
      return fail(res, "Error interno del servidor", 500);
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
