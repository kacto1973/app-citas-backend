import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

async function handler(req, res) {
  await cors(req, res);

  const { phone } = req.query;
  const path = "businesses/mb_salon/clients";

  // GET - Buscar cliente por número de teléfono
  if (req.method === "GET") {
    try {
      const snapshot = await db
        .ref(path)
        .orderByChild("cellphone")
        .equalTo(phone)
        .once("value");

      if (snapshot.exists()) {
        const clients = snapshot.val();
        const clientId = Object.keys(clients)[0];
        const clientData = clients[clientId];

        return success(res, { id: clientId, ...clientData });
      } else {
        return fail(res, "Cliente no encontrado", 404);
      }
    } catch (error) {
      console.error("Error en findClientByPhoneNumber:", error);
      return fail(res, "Error interno del servidor", 500);
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
