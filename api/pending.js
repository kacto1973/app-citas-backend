// api/pending.js
export default function handler(req, res) {
  res.status(200).json({
    response: "El pago está pendiente, por favor espera la confirmación",
  });
}
