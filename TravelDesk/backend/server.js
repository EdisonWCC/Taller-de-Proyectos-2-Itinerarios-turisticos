// backend/server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
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
      "SELECT id_usuario AS id, nombre_usuario AS name, email, rol, created_at FROM usuarios"
    );
    // Normaliza el rol a mayúsculas y agrega estado activo por defecto
    const users = rows.map(u => ({
      ...u,
      role: u.rol ? u.rol.toUpperCase() : "CLIENTE",
      active: true // Por defecto todos los usuarios están activos
    }));
    res.json(users);
  } catch (err) {
    console.error("❌ Error al obtener usuarios:", err.message);
    res.status(500).json({ error: "Error al obtener usuarios." });
  }
});

// Endpoint para cambiar el estado de un usuario (activar/desactivar)
app.put("/api/usuarios/:id/status", requireRole(["ADMIN"]), async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: "El estado 'active' debe ser true o false." });
  }
  try {
    const [result] = await pool.query(
      "UPDATE usuarios SET updated_at = NOW() WHERE id_usuario = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error al cambiar estado del usuario:", err.message);
    res.status(500).json({ error: "Error al cambiar estado del usuario." });
  }
});

// Listar turistas activos
app.get("/api/turistas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         t.id_turista AS id,
         t.nombre,
         t.apellido,
         t.dni,
         t.pasaporte,
         t.nacionalidad,
         t.fecha_nacimiento,
         t.genero,
         u.email
       FROM turistas t
       LEFT JOIN usuarios u ON u.id_usuario = t.id_usuario
       WHERE t.activo = 1`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener turistas:", err.message);
    res.status(500).json({ ok: false, error: "Error al obtener turistas" });
  }
});

// Borrado lógico de turista
app.delete("/api/turistas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el turista existe y está activo
    const [rows] = await pool.query(
      "SELECT id_turista, activo FROM turistas WHERE id_turista = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Turista no encontrado" });
    }
    if (rows[0].activo === 0) {
      return res.status(400).json({ error: "El turista ya fue eliminado" });
    }

    // Borrado lógico
    await pool.query(
      "UPDATE turistas SET activo = 0 WHERE id_turista = ?",
      [id]
    );

    res.json({ ok: true, message: "Turista eliminado lógicamente" });
  } catch (err) {
    console.error("❌ Error al eliminar turista:", err.message);
    res.status(500).json({ error: "Error al eliminar turista" });
  }
});


// Endpoint para eliminar un usuario (borrado lógico)
app.delete("/api/usuarios/:id", requireRole(["ADMIN"]), async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si el usuario existe
    const [rows] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error al eliminar usuario:", err.message);
    res.status(500).json({ error: "Error al eliminar usuario." });
  }
});
app.post("/api/usuarios/registro-completo", async (req, res) => {
  const { usuario, turista } = req.body;
  if (!usuario || !turista) {
    return res.status(400).json({ ok: false, error: "Payload inválido" });
  }
  const { nombre_usuario, email, password, rol = "cliente" } = usuario;
  const { nombre, apellido, dni, pasaporte, nacionalidad, fecha_nacimiento, genero } = turista;

  if (!nombre_usuario || !email || !password) {
    return res.status(400).json({ ok: false, error: "Faltan datos de usuario" });
  }
  if (!nombre || !apellido || !nacionalidad || !fecha_nacimiento || !genero) {
    return res.status(400).json({ ok: false, error: "Faltan datos de turista" });
  }
  if (!dni && !pasaporte) {
    return res.status(400).json({ ok: false, error: "Debe ingresar DNI o Pasaporte" });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1) Crear USUARIO primero (según tu esquema)
    const hashed = await bcrypt.hash(password, 10);
    const [usuarioResult] = await conn.query(
      `INSERT INTO usuarios (nombre_usuario, email, password, rol)
       VALUES (?, ?, ?, ?)`,
      [nombre_usuario, email.toLowerCase(), hashed, (rol || "cliente").toLowerCase()]
    );
    const usuarioId = usuarioResult.insertId;

    // 2) Crear TURISTA vinculado a usuario mediante id_usuario
    const [turistaResult] = await conn.query(
      `INSERT INTO turistas (nombre, apellido, dni, pasaporte, nacionalidad, fecha_nacimiento, genero, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, dni || null, pasaporte || null, nacionalidad, fecha_nacimiento, genero, usuarioId]
    );
    const turistaId = turistaResult.insertId;

    await conn.commit();
    return res.json({
      ok: true,
      usuario: { id: usuarioId, nombre_usuario, email: email.toLowerCase(), rol: (rol || "cliente").toUpperCase() },
      turista: { id: turistaId, nombre, apellido }
    });
  } catch (err) {
    if (conn) await conn.rollback();
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, error: "Dato duplicado (email, usuario, dni o pasaporte)" });
    }
    console.error("❌ Error en registro-completo:", err.message);
    return res.status(500).json({ ok: false, error: "Error en el servidor" });
  } finally {
    if (conn) conn.release();
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
