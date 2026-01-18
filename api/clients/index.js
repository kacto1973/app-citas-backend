// api/clients.js
import { db } from "../lib/firebase-admin.js";
import cors from "../_middlewares/cors.js";
import { success, fail } from "../utils/response.js";

export default async function handler(req, res) {
  const handled = await cors(req, res);
  if (handled) return;

  const { phone } = req.query;
  const path = "businesses/mb_salon/clients";

  // 1. GET TODOS los clientes
  if (req.method === "GET" && !phone) {
    try {
      const snapshot = await db.ref(path).once("value");

      if (snapshot.exists()) {
        const clients = snapshot.val();
        const clientsArray = Object.entries(clients).map(([id, client]) => ({
          id,
          ...client,
        }));

        return success(res, { clients: clientsArray }, 200);
      } else {
        return success(res, null);
      }
    } catch (error) {
      console.error("Error:", error);
      return fail(res, "Error", 500);
    }
  }

  // 2. GET cliente por teléfono
  if (req.method === "GET" && phone) {
    try {
      const snapshot = await db
        .ref(path)
        .orderByChild("cellphone")
        .equalTo(phone)
        .once("value");

      if (snapshot.exists()) {
        const clients = snapshot.val();
        const clientId = Object.keys(clients)[0];
        const clientData = clients[clientId];

        return success(res, { id: clientId, ...clientData });
      } else {
        return fail(res, "Cliente no encontrado", 404);
      }
    } catch (error) {
      console.error("Error:", error);
      return fail(res, "Error", 500);
    }
  }

  // 3. POST registrar cliente
  if (req.method === "POST") {
    try {
      const { fullName, cellphone } = req.body;

      if (!fullName?.trim()) {
        return fail(res, "Nombre requerido", 400);
      }

      if (!cellphone?.trim()) {
        return fail(res, "Teléfono requerido", 400);
      }

      // Verificar si ya existe
      const existingSnapshot = await db
        .ref(path)
        .orderByChild("cellphone")
        .equalTo(cellphone)
        .once("value");

      if (existingSnapshot.exists()) {
        return fail(res, "Cliente ya existe", 409);
      }

      // Crear cliente
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

      const newClientRef = db.ref(path).push();
      await newClientRef.set(clientObject);

      return success(res, { id: newClientRef.key, ...clientObject }, 201);
    } catch (error) {
      console.error("Error:", error);
      return fail(res, "Error", 500);
    }
  }

  // 4. POST validar cliente (sin crear)
  if (req.method === "POST" && req.query.action === "validate") {
    try {
      const { cellphone } = req.body;

      if (!cellphone) {
        return fail(res, "Teléfono requerido", 400);
      }

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
      console.error("Error:", error);
      return fail(res, "Error", 500);
    }
  }

  return fail(res, "Método no permitido", 405);
}
