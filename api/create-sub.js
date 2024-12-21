import { MercadoPagoConfig, Preference } from "mercadopago";
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

      //const business_id = external_reference.business_id;

      const client = new MercadoPagoConfig({
        accessToken:
          "TEST-4686380160898466-121322-59ec321e1a8fe1b378d177e6d9419378-238335945", //configuramos mi access token
      });

      const preference = new Preference(client);

      const body = {
        items: [
          {
            title: "Licencia Mensual del Administrador de Agenda",
            quantity: 1,
            currency_id: "MXN",
            unit_price: 299,
          },
        ],
        external_reference: external_reference,
        back_urls: {
          success: "https://mb-salon-citas.netlify.app/",
          failure: "https://mb-salon-citas.netlify.app/",
          pending: "https://mb-salon-citas.netlify.app/",
        },
        auto_return: "approved",
        payment_methods: {
          installments: 1, // Solo una cuota, elimina la opción de cuotas
          exclude_payment_types: [{ id: "credit_card" }], // Excluir tarjetas de crédito para evitar cuotas
        },
        notification_url:
          "https://ab15-2806-2f0-2461-f100-f1cd-87ff-a4e4-b928.ngrok-free.app/api/webhook", // URL para recibir notificaciones
      };

      await preference.create({ body }).then((response) => {
        console.log("sandbox init point: ", response.sandbox_init_point);
        res.status(200).json({
          init_point: response.init_point,
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
