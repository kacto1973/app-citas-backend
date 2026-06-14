import { db } from "../../lib/firebase-admin.js";
import cors from "../../_middlewares/cors.js";
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
      console.error("Error en get/restdays:", error);
      return fail(res, "Error interno del servidor", 500);
    }
  }

  // POST - Agregar días no laborales
  if (req.method === "POST") {
    try {
      const { days } = req.body;

      if (!days || !Array.isArray(days) || days.length === 0) {
        return fail(res, "Se requiere un array de días válido", 400);
      }

      for (const day of days) {
        await db.ref(path).push(day);
      }

      return success(res, null);
    } catch (error) {
      console.error("Error en add/restdays:", error);
      return fail(res, "Error interno del servidor", 500);
    }
  }

  if (req.method === "DELETE") {
    try {
      const { days } = req.body;

      if (!days || !Array.isArray(days) || days.length === 0) {
        return fail(res, "Debe proporcionar un array de días a eliminar");
      }

      const snapshot = await db.ref(path).once("value");
      let removedCount = 0;

      if (snapshot.exists()) {
        const restDays = snapshot.val();

        const daysToDelete = new Set(days);

        for (const key in restDays) {
          const dayValue = restDays[key];

          if (daysToDelete.has(dayValue)) {
            await db.ref(`${path}/${key}`).remove();
            removedCount++;
          }
        }
      }
      return success(res, { removedCount: removedCount });
    } catch (error) {
      console.error("Error en delete/restdays:", error);
      return fail(res, "Error interno del servidor", 500);
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
