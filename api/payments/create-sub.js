import { MercadoPagoConfig, Preference } from "mercadopago";
import cors from "../_middlewares/cors.js";

export default async function handler(req, res) {
  const handled = await cors(req, res);
  if (handled) return;

  if (req.method === "POST") {
    try {
      const { external_reference } = req.body;

      //const business_id = external_reference.business_id;

      const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN,
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
        notification_url: "https://app-citas-backend.vercel.app/api/webhook", // URL para recibir notificaciones
      };

      await preference.create({ body }).then((response) => {
        //console.log("sandbox init point: ", response.sandbox_init_point);
        res.status(200).json({
          init_point: response.init_point,
          //sandbox_init_point: response.sandbox_init_point,
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
