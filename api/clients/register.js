import { db } from "../../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";

async function handler(req, res) {
  await cors(req, res);

  // POST - Registrar nuevo cliente
  if (req.method === "POST") {
    try {
      const { fullName, cellphone } = req.body;

      // Validaciones
      if (!fullName?.trim()) {
        return res.status(400).json({
          success: false,
          error: "Nombre completo requerido",
        });
      }

      if (!cellphone?.trim()) {
        return res.status(400).json({
          success: false,
          error: "Número de teléfono requerido",
        });
      }

      const path = "businesses/mb_salon/clients";

      // Verificar si ya existe un cliente con ese teléfono
      const existingSnapshot = await db
        .ref(path)
        .orderByChild("cellphone")
        .equalTo(cellphone)
        .once("value");

      if (existingSnapshot.exists()) {
        return res.status(409).json({
          success: false,
          error: "Ya existe un cliente con este número de teléfono",
        });
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

      return res.status(201).json({
        success: true,
        message: "Cliente registrado exitosamente",
        client: {
          id: newClientRef.key,
          ...clientObject,
        },
      });
    } catch (error) {
      console.error("Error en registerClient:", error);
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
