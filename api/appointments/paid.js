import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

async function handler(req, res) {
  await cors(req, res);

  // GET - Obtener citas pagadas
  if (req.method === "GET") {
    try {
      const path = "businesses/mb_salon/activeAppointments";
      const snapshot = await db.ref(path).once("value");

      if (snapshot.exists()) {
        const appointments = snapshot.val();
        const appointmentsArray = Object.entries(appointments).map(
          ([id, apt]) => ({
            id,
            ...apt,
          })
        );

        const paidAppointments = appointmentsArray.filter(
          (appointment) => appointment.state === "pagado"
        );

        return success(res, { appointments: paidAppointments }, 200);
      } else {
        return success(res, null);
      }
    } catch (error) {
      console.error("Error en getPaidAppointments:", error);
      return fail(res, "Error al obtener las citas pagadas.", 500);
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
