// api/failure.js
export default function handler(req, res) {
  res
    .status(200)
    .json({ response: "El pago falló, por favor intenta nuevamente" });
}
