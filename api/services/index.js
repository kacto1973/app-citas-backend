// api/services.js
import { db } from "../../lib/firebase-admin.js";
import cors from "../../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

export default async function handler(req, res) {
  const handled = await cors(req, res);
  if (handled) return;

  const path = "businesses/mb_salon/menu/services";

  // 1. GET TODOS los servicios
  if (req.method === "GET") {
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

  // 2. POST crear servicio
  if (req.method === "POST") {
    try {
      const { service } = req.body;

      if (!service) {
        return fail(res, "Servicio no proporcionado");
      }

      // Crear objeto del servicio
      const serviceData = {
        duration: Number(service.duration),
        name: service.name,
        price: Number(service.price),
        restTime: Number(service.restTime),
      };

      // Guardar en Firebase
      await db.ref(`${path}/${service.name}`).set(serviceData);
      return success(res, null);
    } catch (error) {
      console.error("Error:", error);
      return fail(res, "Error agregando servicio");
    }
  }

  //3. PUT actualizar servicio
  if (req.method === "PUT") {
    try {
      const { service, serviceOldName } = req.body;
      if (!service) {
        return fail(res, "Servicio no proporcionado");
      }
      if (!serviceOldName) {
        return fail(res, "Nombre antiguo del servicio no proporcionado");
      }

      // Crear objeto del servicio
      const serviceData = {
        duration: Number(service.duration),
        name: service.name,
        price: Number(service.price),
        restTime: Number(service.restTime),
      };

      if (serviceOldName !== service.name) {
        // Guardar en Firebase bajo nuevo nombre y eliminar el antiguo
        await db.ref(`${path}/${service.name}`).set(serviceData);
        await db.ref(`${path}/${serviceOldName}`).remove();
      } else {
        // Actualizar en Firebase bajo el mismo nombre
        await db.ref(`${path}/${serviceOldName}`).set(serviceData);
      }

      return success(res, null);
    } catch (error) {
      console.error("Error:", error);
      return fail(res, "Error actualizando servicio");
    }
  }

  // 4. DELETE eliminar servicio por nombre
  if (req.method === "DELETE") {
    try {
      const { service } = req.body;
      const name = service.name;

      if (!name) {
        return fail(res, "Nombre del servicio no proporcionado");
      }

      await db.ref(`${path}/${name}`).remove();
      return success(res, null);
    } catch (error) {
      console.error("Error:", error);
      return fail(res, "Error eliminando servicio");
    }
  }

  return fail(res, "Método no permitido", 405);
}
