export default async function handler(req, res) {
  if (req.method === "POST") {
    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      console.log("No se recibió el ID del pago");
      return res.status(400).send("Falta el ID del pago");
    }

    try {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer TEST-4686380160898466-121322-59ec321e1a8fe1b378d177e6d9419378-238335945`,
          },
        }
      );

      const paymentData = await response.json();

      if (response.ok) {
        console.log("Respuesta de la API de MercadoPago: ", paymentData);
        //verificamos el estado del pago
        if (paymentData.status === "approved") {
          console.log("Pago aprobado: ", paymentData);
        } else if (paymentData.status === "pending") {
          console.log("Pago pendiente: ", paymentData);
        } else {
          console.log("Pago rechazado o en otro estado: ", paymentData);
        }

        res.status(200).send("Webhook procesado correctamente");
      } else {
        console.error("Error al consultar el pago: ", paymentData);
        res.status(500).send("Error al consultar el estado del pago");
      }
    } catch (error) {
      console.error("Error al procesar el webhook: ", error);
      res.status(500).send("Error interno del servidor");
    }
  } else {
    res.status(405).send("Método no permitido, eso no es una solicitud POST");
  }
}
