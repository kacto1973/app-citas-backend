import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";

async function handler(req, res) {
  await cors(req, res);

  const path = "businesses/mb_salon/restdays";

  // GET - Obtener todos los días no laborales
  if (req.method === "GET") {
    try {
      const snapshot = await db.ref(path).once("value");

      if (snapshot.exists()) {
        const restDays = snapshot.val();
        const restDaysArray = Object.values(restDays);

        return res.status(200).json({
          success: true,
          data: restDays,
          array: restDaysArray,
          count: restDaysArray.length,
        });
      } else {
        return res.status(200).json({
          success: true,
          data: {},
          array: [],
          count: 0,
          message: "No hay días no laborales configurados",
        });
      }
    } catch (error) {
      console.error("Error en getAllRestDays:", error);
      return res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  }

  // POST - Agregar días no laborales
  if (req.method === "POST") {
    try {
      const { action, days } = req.body;

      if (!days || !Array.isArray(days) || days.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Se requiere un array de días válido",
        });
      }

      if (action === "add") {
        // Agregar días
        for (const day of days) {
          await db.ref(path).push().set(day);
        }

        return res.status(200).json({
          success: true,
          message: "Días no laborales agregados exitosamente",
          daysAdded: days.length,
        });
      }

      if (action === "remove") {
        // Eliminar días
        const snapshot = await db.ref(path).once("value");

        if (snapshot.exists()) {
          const restDays = snapshot.val();
          let removedCount = 0;

          for (const key in restDays) {
            if (restDays.hasOwnProperty(key)) {
              const day = restDays[key];
              if (days.includes(day)) {
                await db.ref(`${path}/${key}`).remove();
                removedCount++;
              }
            }
          }

          return res.status(200).json({
            success: true,
            message: "Días no laborales eliminados exitosamente",
            daysRemoved: removedCount,
          });
        } else {
          return res.status(200).json({
            success: true,
            message: "No hay días no laborales para eliminar",
          });
        }
      }

      return res.status(400).json({
        success: false,
        error: 'Acción no válida. Use "add" o "remove"',
      });
    } catch (error) {
      console.error("Error en add/removeRestDays:", error);
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
