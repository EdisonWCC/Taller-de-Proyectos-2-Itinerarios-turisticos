// backend/server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import pool, { testConnection } from "./src/config/db.js";
const SECRET = 'tu_clave_secreta'; // Usa una variable de entorno en producción

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // tu frontend
  credentials: true
}));
app.use(bodyParser.json());

// Probar conexión con la base de datos
testConnection();

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 Backend TravelDesk funcionando!");
});

// Endpoint de registro
app.post("/api/registro", async (req, res) => {
  const { nombre, apellido, email, usuario, contrasena, fecha_nac, genero } = req.body;

  if (!nombre || !apellido || !email || !usuario || !contrasena || !fecha_nac) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    // Aquí podrías hashear la contraseña con bcrypt
    await pool.query(
      "INSERT INTO usuarios (nombre_usuario, email, password) VALUES (?, ?, ?)",
      [usuario, email, contrasena]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error al registrar usuario:", err.message);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Endpoint de login
app.post("/api/login", async (req, res) => {
  const { usuario, contrasena } = req.body;
  if (!usuario || !contrasena) {
    return res.status(400).json({ error: "Usuario y contraseña requeridos." });
  }
  try {
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE nombre_usuario = ?",
      [usuario]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }
    const user = rows[0];
    if (user.password !== contrasena) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }
    // Genera el token con el rol
    const token = jwt.sign(
      { id: user.id_usuario, usuario: user.nombre_usuario, role: user.rol.toUpperCase() },
      SECRET,
      { expiresIn: '2h' }
    );
    res.json({ ok: true, usuario: user.nombre_usuario, role: user.rol.toUpperCase(), token });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor." });
  }
});

// Endpoint para actualizar el rol de un usuario
app.put("/api/usuarios/:id/rol", requireRole(["ADMIN"]), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: "El rol es obligatorio." });
  }
  try {
    const [result] = await pool.query(
      "UPDATE usuarios SET rol = ? WHERE id_usuario = ?",
      [role.toLowerCase(), id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error al actualizar rol:", err.message);
    res.status(500).json({ error: "Error al actualizar el rol." });
  }
});

// Endpoint para obtener la lista de usuarios y sus roles
app.get("/api/usuarios", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_usuario AS id, nombre_usuario AS name, email, rol FROM usuarios"
    );
    // Normaliza el rol a mayúsculas
    const users = rows.map(u => ({
      ...u,
      role: u.rol ? u.rol.toUpperCase() : "CLIENTE"
    }));
    res.json(users);
  } catch (err) {
    console.error("❌ Error al obtener usuarios:", err.message);
    res.status(500).json({ error: "Error al obtener usuarios." });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

function requireRole(roles) {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "Token requerido" });
    const token = auth.split(' ')[1];
    try {
      const decoded = jwt.verify(token, SECRET);
      req.user = decoded;
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: "No autorizado" });
      }
      next();
    } catch {
      return res.status(401).json({ error: "Token inválido" });
    }
  };
}
