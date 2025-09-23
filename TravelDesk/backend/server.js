const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 Backend TravelDesk funcionando!");
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
