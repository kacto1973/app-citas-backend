const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Para parsear JSON en el body

// Ruta básica para comprobar que el backend funciona
app.get("/", (req, res) => {
  res.send("¡Backend de Mercado Pago funcionando!");
});

// Ruta para Mercado Pago (esto lo harás luego con más detalle)
app.post("/api/createpreference", (req, res) => {
  res.json({ message: "Aquí se creará la preferencia de Mercado Pago" });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
