import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

async function handler(req, res) {
  const handled = await cors(req, res);
  if (handled) return;

  const path = "businesses/mb_salon/activeAppointments";

  // GET - Obtener todas las citas
  if (req.method === "GET") {
    try {
      const snapshot = await db.ref(path).once("value");

      if (snapshot.exists()) {
        const appointments = snapshot.val();
        const appointmentsArray = Object.entries(appointments).map(
          ([id, apt]) => ({
            id,
            ...apt,
          }),
        );
        return success(res, { appointments: appointmentsArray }, 200);
      } else {
        return success(res, null);
      }
    } catch (error) {
      console.error("Error en getAppointments:", error);
      return fail(res, "Error al obtener las citas", 500);
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
