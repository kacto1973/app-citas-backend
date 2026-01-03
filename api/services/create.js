import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";

async function handler(req, res) {
  const path = "businesses/mb_salon/menu/services";

  // POST - Crear o actualizar servicio
  if (req.method === "POST") {
    try {
      const { service, serviceOldName } = req.body;

      // Validaciones
      if (!service?.name) {
        return res.status(400).json({
          success: false,
          error: "El nombre del servicio es requerido",
        });
      }

      if (!service?.price || service.price <= 0) {
        return res.status(400).json({
          success: false,
          error: "El precio debe ser mayor a 0",
        });
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

      return res.status(200).json({
        success: true,
        message: serviceOldName ? "Servicio actualizado" : "Servicio creado",
        data: serviceData,
      });
    } catch (error) {
      console.error("Error en addService:", error);
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

export default cors(handler);
