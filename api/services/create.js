import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

async function handler(req, res) {
  await cors(req, res);

  const path = "businesses/mb_salon/menu/services";

  // POST - Crear o actualizar servicio
  if (req.method === "POST") {
    try {
      const { service, serviceOldName } = req.body;

      // Validaciones
      if (!service?.name) {
        return fail(res, "El nombre del servicio es requerido");
      }

      if (!service?.price || service.price <= 0) {
        return fail(res, "El precio debe ser mayor a 0");
      }

      // Si se está actualizando un servicio existente
      if (serviceOldName && serviceOldName !== service.name) {
        // Eliminar el servicio antiguo
        await db.ref(`${path}/${serviceOldName}`).remove();
      }

      // Crear objeto completo del servicio
      const serviceData = {
        name: service.name,
        price: Number(service.price),
        duration: Number(service.duration) || 60,
        description: service.description || "",
        active: service.active !== undefined ? service.active : true,
        createdAt: service.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Guardar en Firebase
      await db.ref(`${path}/${service.name}`).set(serviceData);

      return success(res, serviceData);
    } catch (error) {
      console.error("Error en addService:", error);

      return fail(res, "Error interno del servidor");
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
