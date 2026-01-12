import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

async function handler(req, res) {
  await cors(req, res);

  // POST - Validar cliente por teléfono
  if (req.method === "POST") {
    try {
      const { cellphone } = req.body;

      if (!cellphone) {
        return fail(res, "Número de teléfono requerido", 400);
      }

      const path = "businesses/mb_salon/clients";
      const snapshot = await db
        .ref(path)
        .orderByChild("cellphone")
        .equalTo(cellphone)
        .once("value");

      if (snapshot.exists()) {
        const clients = snapshot.val();
        const clientId = Object.keys(clients)[0];
        const clientData = clients[clientId];

        return success(res, { id: clientId, ...clientData }, 200);
      } else {
        return success(res, null, 200);
      }
    } catch (error) {
      console.error("Error en validateClient:", error);

      return fail(res, "Error interno del servidor", 500);
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
