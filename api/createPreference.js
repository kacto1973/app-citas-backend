const mercadopago = require("mercadopago");

// Configura tu access token de Mercado Pago
mercadopago.configurations.setAccessToken(
  process.env.MERCADO_PAGO_ACCESS_TOKEN
);

// Función para crear la preferencia
module.exports = async (req, res) => {
  if (req.method === "POST") {
    try {
      // Configura los encabezados CORS
      res.setHeader("Access-Control-Allow-Origin", "*"); // Permite todas las solicitudes
      res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      const preference = {
        items: [
          {
            title: "Anticipo de cita pref",
            unit_price: 100, // Aquí pones el precio del producto o servicio
            quantity: 1,
          },
        ],
        back_urls: {
          success: "https://mb-salon-citas.netlify.app/downpayment",
          failure: "https://mb-salon-citas.netlify.app/downpayment",
          pending: "https://mb-salon-citas.netlify.app/downpayment",
        },
        auto_return: "approved",
      };

      // Crea la preferencia en Mercado Pago
      const preferenceResponse = await mercadopago.preferences.create(
        preference
      );
      const preferenceId = preferenceResponse.body.id;

      // Responde con el ID de la preferencia para que el frontend lo use
      res.status(200).json({ preferenceId });
    } catch (error) {
      console.error("Error al crear la preferencia:", error);
      res
        .status(500)
        .json({ error: "Hubo un problema al crear la preferencia" });
    }
  } else if (req.method === "GET") {
    // Respuesta para solicitudes GET
    res
      .status(200)
      .send("Este es un backend para procesar pagos con Mercado Pago.");
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
