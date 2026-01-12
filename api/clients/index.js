import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

async function handler(req, res) {
  await cors(req, res);

  const path = "businesses/mb_salon/clients";

  // GET - Obtener todos los clientes
  if (req.method === "GET") {
    try {
      const snapshot = await db.ref(path).once("value");

      if (snapshot.exists()) {
        const clients = snapshot.val();
        const clientsArray = Object.entries(clients).map(([id, client]) => ({
          id,
          ...client,
        }));

        return success(res, { clients: clientsArray }, 200);
      } else {
        return success(res, null);
      }
    } catch (error) {
      console.error("Error en getAllClients:", error);
      return fail(res, "Error interno del servidor", 500);
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
