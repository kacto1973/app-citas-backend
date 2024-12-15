import { MercadoPagoConfig, Preference } from "mercadopago";

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
      const client = new MercadoPagoConfig({
        accessToken:
          "TEST-4686380160898466-121322-59ec321e1a8fe1b378d177e6d9419378-238335945",
      });

      const preference = new Preference(client);

      //const { amount } = req.body;

      const body = {
        items: [
          {
            title: "Anticipo de Cita",
            description: "anticipo de los servicios de su cita",
            quantity: 1,
            currency_id: "MXN",
            unit_price: 102,
          },
        ],
        back_urls: {
          success: "http://localhost:3000/api/success",
          failure: "http://localhost:3000/api/failure",
          pending: "http://localhost:3000/api/pending",
        },
        auto_return: "approved",
        notification_url:
          "https://69ec-2806-2f0-2461-f100-3439-25c7-af0e-a6e8.ngrok-free.app/api/webhook",
      };

      await preference.create({ body }).then((response) => {
        res.status(200).json({
          init_point: response.init_point,
          sandbox_init_point: response.sandbox_init_point,
        });
      });

      //regresar el init point
    } catch (error) {
      console.error("Error creando la preferencia: ", error);
      res.status(500).json({ error: "Error al crear la preferencia de pago" });
    }
  } else {
    res
      .status(405)
      .json({ error: "Método no permitido, esa no es una solicitud POST" });
  }
} //FIN FUNCION HANDLER
