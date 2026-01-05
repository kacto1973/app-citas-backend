import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";

async function handler(req, res) {
  await cors(req, res);

  // POST - Validar administrador
  if (req.method === "POST") {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: "Contraseña requerida",
        });
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
          // Generar token simple (en producción usar JWT)
          const token =
            Math.random().toString(36).substring(2) + Date.now().toString(36);

          return res.status(200).json({
            success: true,
            message: "Login exitoso",
            token,
            user: {
              username: adminUsername,
              role: "admin",
            },
          });
        } else {
          return res.status(401).json({
            success: false,
            error: "Credenciales incorrectas",
          });
        }
      } else {
        return res.status(404).json({
          success: false,
          error: "No hay administradores configurados",
        });
      }
    } catch (error) {
      console.error("Error en validateAdmin:", error);
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
