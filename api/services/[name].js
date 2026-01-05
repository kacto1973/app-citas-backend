import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";

async function handler(req, res) {
  await cors(req, res);

  const { name } = req.query;
  const path = `businesses/mb_salon/menu/services`;

  // DELETE - Eliminar servicio
  if (req.method === "DELETE") {
    try {
      await db.ref(`${path}/${name}`).remove();

      return res.status(200).json({
        success: true,
        message: "Servicio eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error en deleteService:", error);
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
