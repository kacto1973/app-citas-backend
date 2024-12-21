import { MercadoPagoConfig } from "mercadopago";
//import { getAccessToken } from "../firebaseFunctions.js";

export default async function handler(req, res) {
  // Permitir solicitudes desde cualquier origen (puedes restringirlo a tu dominio)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // Responde a las preflight requests de CORS
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { external_reference } = req.body;

      const business_id = external_reference.business_id;

      const client = new MercadoPagoConfig({
        accessToken:
          "TEST-4686380160898466-121322-59ec321e1a8fe1b378d177e6d9419378-238335945", //configuramos mi access token
      });

      // Crear el preapproval
      const body = {
        back_url: "https://mb-salon-citas.netlify.app/",
        reason: "Suscripción Mensual del Administrador de Citas", // Motivo del cobro recurrente
        external_reference: business_id,
        auto_recurring: {
          frequency: 1, // Frecuencia (cada 1 mes)
          frequency_type: "months", // Tipo de frecuencia (meses)
          transaction_amount: 250, // Monto a cobrar
          currency_id: "MXN", // Moneda
          start_date: new Date().toISOString(), // Fecha de inicio
          end_date: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ).toISOString(), // Opcional: fecha de fin
        },
        notification_url:
          "https://9c81-2806-2f0-2461-f100-4c0c-4d33-a2ed-e083.ngrok-free.app/api/webhook", // URL para recibir notificaciones
      };

      await client.preapproval.create({ body }).then((response) => {
        console.log("sandbox init point: ", response.sandbox_init_point);
        res.status(200).json({
          //init_point: response.init_point,
          sandbox_init_point: response.sandbox_init_point,
        });
      });

      //regresar el init point
    } catch (error) {
      console.error("Error creando la suscripción de pago: ", error);
      res.status(500).json({ error: "Error al crear la suscripción de pago" });
    }
  } else {
    res
      .status(405)
      .json({ error: "Método no permitido, esa no es una solicitud POST" });
  }
} //FIN FUNCION HANDLER
