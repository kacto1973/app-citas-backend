import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";

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

        return res.status(200).json({
          success: true,
          data: paidAppointments,
          count: paidAppointments.length,
        });
      } else {
        return res.status(200).json({
          success: true,
          data: [],
          count: 0,
          message: "No hay citas activas",
        });
      }
    } catch (error) {
      console.error("Error en getPaidAppointments:", error);
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

export default handler;
