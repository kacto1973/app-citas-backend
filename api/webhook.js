// export const receiveWebhook = async (req, res) => {
//   const payment = req.query;

//   if (payment.type === "payment") {
//     const paymentInfo = new Payment(payment.id);
//     console.log("si entre al receiveWebhook en el if de payment");
//     console.log(paymentInfo);
//   }

//   res.send("webhook recibido");
// };
export default async function handler(req, res) {
  if (req.method === "POST") {
    const paymentData = req.body;

    //verificamos el estado del pago
    if (paymentData.status === "approved") {
      console.log("Pago aprobado: ", paymentData);
    } else if (paymentData.status === "pending") {
      console.log("Pago pendiente: ", paymentData);
    } else {
      console.log("Pago rechazado: ", paymentData);
    }

    res.status(200).send("OK");
  } else {
    res.status(405).send("Método no permitido, eso no es una solicitud POST");
  }
}
