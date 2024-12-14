const express = require("express");
const mercadopago = require("mercadopago");
const app = express();
const port = process.env.PORT || 3000;

// Configura tu access token de Mercado Pago
mercadopago.configurations.setAccessToken(
  process.env.MERCADO_PAGO_ACCESS_TOKEN
);

// Middleware para permitir el procesamiento de JSON en las solicitudes
app.use(express.json());

// Ruta para crear la preferencia de Mercado Pago
app.post("/", async (req, res) => {
  try {
    // Configura los encabezados CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Obtener los datos del producto desde el frontend
    const preferenceData = req.body;

    // Crear la preferencia en Mercado Pago
    const preferenceResponse = await mercadopago.preferences.create(
      preferenceData
    );
    const preferenceId = preferenceResponse.body.id;

    // Responder con el ID de la preferencia para que el frontend lo use
    res.status(200).json({ preferenceId });
  } catch (error) {
    console.error("Error al crear la preferencia:", error);
    res.status(500).json({ error: "Hubo un problema al crear la preferencia" });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
