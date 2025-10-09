const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const pool = require("./src/config/db.js").default;
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // Solo permite tu frontend
  credentials: true
}));

app.use(bodyParser.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 Backend TravelDesk funcionando!");
});

app.post("/api/registro", async (req, res) => {
  const { nombre, apellido, email, usuario, contrasena, fecha_nac, genero } = req.body;
  if (!nombre || !apellido || !email || !usuario || !contrasena || !fecha_nac) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  try {
    // Aquí deberías hashear la contraseña antes de guardar (usa bcrypt en producción)
    await pool.query(
      "INSERT INTO usuarios (nombre_usuario, email, password) VALUES (?, ?, ?)",
      [usuario, email, contrasena]
    );
    // Puedes insertar en otras tablas según tu modelo (turistas, etc.)
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
