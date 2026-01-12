import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

async function handler(req, res) {
  await cors(req, res);

  // POST - Validar administrador
  if (req.method === "POST") {
    try {
      const { password } = req.body;

      if (!password) {
        return fail(res, "Falta la contraseña", 400);
      }

      const path = "businesses/mb_salon/admins";
      const snapshot = await db.ref(path).once("value");

      if (snapshot.exists()) {
        const admins = snapshot.val();
        const adminsArray = Object.values(admins);

        let adminUsername = "";
        const foundAdmin = adminsArray.some((admin) => {
          if (admin.password === password.toLowerCase()) {
            adminUsername = admin.username;
            return true;
          }
          return false;
        });

        if (foundAdmin) {
          return success(res, null, 200);
        } else {
          return fail(res, "Contraseña incorrecta", 401);
        }
      } else {
        return fail(res, "No hay administradores registrados", 404);
      }
    } catch (error) {
      console.error("Error en validateAdmin:", error);
      return fail(res, "Error del servidor", 500);
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
