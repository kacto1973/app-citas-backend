import { MercadoPagoConfig, Preference } from "mercadopago";
import { getAccessToken } from "../firebaseFunctions.js";

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
      const { amount, description, external_reference } = req.body;

      const business_id = external_reference.business_id;

      console.log(
        "business_id que estamos pasando al getAccessToken: ",
        business_id
      );

      const mp_at = await getAccessToken(business_id);

      console.log("mp_at que se obtiene del getAccessToken: ", mp_at);

      const client = new MercadoPagoConfig({
        accessToken: mp_at,
      });

      const preference = new Preference(client);

      const body = {
        items: [
          {
            title: description,
            //description: description,
            quantity: 1,
            currency_id: "MXN",
            unit_price: amount,
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
          //excluded_payment_types: [{ id: "credit_card" }], // Excluir tarjetas de crédito para evitar cuotas
        },
        notification_url:
          "https://ab15-2806-2f0-2461-f100-f1cd-87ff-a4e4-b928.ngrok-free.app/api/webhook",
        business_id: business_id,
      };

      console.log(
        "se recibe este business id del front para hacerlo una orden en mercado pago: ",
        business_id
      );

      await preference.create({ body }).then((response) => {
        console.log("sandbox init point: ", response.sandbox_init_point);
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
