import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

async function handler(req, res) {
  await cors(req, res);

  const path = "businesses/mb_salon/menu/services";

  // GET - Obtener todos los servicios
  if (req.method === "GET") {
    try {
      const snapshot = await db.ref(path).once("value");

      if (snapshot.exists()) {
        return success(res, snapshot.val());
      } else {
        return success(res, null);
      }
    } catch (error) {
      console.error("Error en getServices:", error);

      return fail(res, "Error al obtener los servicios");
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
