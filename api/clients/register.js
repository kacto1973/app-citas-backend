import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../../utils/response.js";

async function handler(req, res) {
  await cors(req, res);

  // POST - Registrar nuevo cliente
  if (req.method === "POST") {
    try {
      const { fullName, cellphone } = req.body;

      // Validaciones
      if (!fullName?.trim()) {
        return fail(res, "Nombre completo requerido", 400);
      }

      if (!cellphone?.trim()) {
        return fail(res, "Número de teléfono requerido", 400);
      }

      const path = "businesses/mb_salon/clients";

      // Verificar si ya existe un cliente con ese teléfono
      const existingSnapshot = await db
        .ref(path)
        .orderByChild("cellphone")
        .equalTo(cellphone)
        .once("value");

      if (existingSnapshot.exists()) {
        return fail(
          res,
          "Ya existe un cliente con este número de teléfono",
          409
        );
      }

      // Crear objeto del cliente
      const clientObject = {
        fullName: fullName.trim(),
        cellphone: cellphone.trim(),
        activeAppointments: [],
        totalAppointments: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        consent: true,
      };

      // Guardar en Firebase
      const newClientRef = db.ref(path).push();
      await newClientRef.set(clientObject);

      return success(res, { id: newClientRef.key, ...clientObject }, 201);
    } catch (error) {
      console.error("Error en registerClient:", error);

      return fail(res, "Error interno del servidor", 500);
    }
  }

  return fail(res, "Método no permitido", 405);
}

export default handler;
