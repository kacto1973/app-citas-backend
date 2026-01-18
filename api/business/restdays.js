import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

async function handler(req, res) {
  const handled = await cors(req, res);
  if (handled) return;
  const path = "businesses/mb_salon/restdays";

  // GET - Obtener todos los días no laborales
  if (req.method === "GET") {
    try {
      const snapshot = await db.ref(path).once("value");

      if (snapshot.exists()) {
        const restDays = snapshot.val();
        const restDaysArray = Object.values(restDays);

        return success(res, { restDays: restDaysArray }, 200);
      } else {
        return success(res, null);
      }
    } catch (error) {
      console.error("Error en getAllRestDays:", error);
      return fail(res, "Error interno del servidor", 500);
    }
  }

  // POST - Agregar días no laborales
  if (req.method === "POST") {
    try {
      const { action, days } = req.body;

      if (!days || !Array.isArray(days) || days.length === 0) {
        return fail(res, "Se requiere un array de días válido", 400);
      }

      if (action === "add") {
        // Agregar días
        for (const day of days) {
          await db.ref(path).push().set(day);
        }

        return success(res, null);
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

          return success(res, null);
        } else {
          return success(res, null);
        }
      }

      return fail(res, "Acción no válida. Use 'add' o 'remove'", 400);
    } catch (error) {
      console.error("Error en add/removeRestDays:", error);
      return fail(res, "Error interno del servidor", 500);
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
