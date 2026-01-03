import { MercadoPagoConfig, Preference } from "mercadopago";
import cors from "../_middlewares/cors.js";

export default async function handler(req, res) {
  await cors(req, res);

  if (req.method === "OPTIONS") {
    // Responde a las preflight requests de CORS
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { amount, description, external_reference } = req.body;

      const business_id = external_reference.business_id.toLowerCase();
      const expirationExactTime = external_reference.expirationExactTime;

      console.log("expirationExactTime en ISO: ", expirationExactTime);

      const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN,
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
        expires: true,
        date_of_expiration: expirationExactTime,
        //expiration_date_to: expirationExactTime,
        external_reference: external_reference,
        back_urls: {
          success: "https://reservacitas.netlify.app/",
          failure: "https://reservacitas.netlify.app/",
          pending: "https://reservacitas.netlify.app/",
        },
        auto_return: "approved",
        payment_methods: {
          excluded_payment_types: [
            { id: "ticket" }, // Excluir pagos en efectivo como OXXO
            { id: "atm" }, // Excluir pagos en cajeros automáticos
          ],
          installments: 1, // Solo una cuota, elimina la opción de cuotas
          //excluded_payment_types: [{ id: "credit_card" }], // Excluir tarjetas de crédito para evitar cuotas
        },
        notification_url: "https://app-citas-backend.vercel.app/api/webhook",
        business_id: business_id,
      };

      console.log(
        "se recibe este business id del front para hacerlo una orden en mercado pago: ",
        business_id
      );

      await preference.create({ body }).then((response) => {
        //console.log("sandbox init point: ", response.sandbox_init_point);
        console.log("init point: ", response.init_point);
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
