// api/services.js
import { db } from "../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../utils/response.js";

export default async function handler(req, res) {
  const handled = await cors(req, res);
  if (handled) return;

  const { name } = req.query;
  const path = "businesses/mb_salon/menu/services";

  // 1. GET TODOS los servicios
  if (req.method === "GET" && !name) {
    try {
      const snapshot = await db.ref(path).once("value");

      if (snapshot.exists()) {
        return success(res, snapshot.val());
      } else {
        return success(res, null);
      }
    } catch (error) {
      console.error("Error:", error);
      return fail(res, "Error al obtener servicios");
    }
  }

  // 2. DELETE eliminar servicio por nombre
  if (req.method === "DELETE" && name) {
    try {
      await db.ref(`${path}/${name}`).remove();
      return success(res, null);
    } catch (error) {
      console.error("Error:", error);
      return fail(res, "Error eliminando servicio");
    }
  }

  // 3. POST crear/actualizar servicio
  if (req.method === "POST") {
    try {
      const { service, serviceOldName } = req.body;

      if (!service?.name) {
        return fail(res, "Nombre del servicio requerido");
      }

      if (!service?.price || service.price <= 0) {
        return fail(res, "Precio debe ser mayor a 0");
      }

      // Si se actualiza y cambió el nombre, eliminar el viejo
      if (serviceOldName && serviceOldName !== service.name) {
        await db.ref(`${path}/${serviceOldName}`).remove();
      }

      // Crear objeto del servicio
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
      console.error("Error:", error);
      return fail(res, "Error");
    }
  }

  return fail(res, "Método no permitido", 405);
}
