import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

async function handler(req, res) {
  const handled = await cors(req, res);
  if (handled) return;

  const { name } = req.query;
  const path = `businesses/mb_salon/menu/services`;

  // DELETE - Eliminar servicio
  if (req.method === "DELETE") {
    try {
      await db.ref(`${path}/${name}`).remove();

      return success(res, null);
    } catch (error) {
      console.error("Error en deleteService:", error);
      return fail(res, "Error eliminando el servicio");
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
