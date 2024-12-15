// api/success.js
export default function handler(req, res) {
  res.status(200).json({ response: "Pago exitoso, gracias por tu compra" });
}
