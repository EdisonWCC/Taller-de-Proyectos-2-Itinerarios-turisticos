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

// Listar turistas con email de usuario
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
       LEFT JOIN usuarios u ON u.id_usuario = t.id_usuario`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener turistas:", err.message);
    res.status(500).json({ ok: false, error: "Error al obtener turistas" });
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

// Registro combinado: crea Turista y Usuario en una sola transacción
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

// Actualizar datos de un turista (y opcionalmente email del usuario vinculado)
app.put("/api/turistas/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    dni,
    pasaporte,
    nacionalidad,
    fecha_nacimiento,
    genero,
    email, // opcional: actualizar email del usuario vinculado
  } = req.body || {};

  // Validaciones básicas
  if (!nombre || !apellido || !nacionalidad) {
    return res.status(400).json({
      ok: false,
      error: "Faltan campos obligatorios",
      fields: {
        nombre: !nombre ? "Requerido" : undefined,
        apellido: !apellido ? "Requerido" : undefined,
        nacionalidad: !nacionalidad ? "Requerido" : undefined,
      },
    });
  }
  // Regla: al menos uno entre DNI o Pasaporte si alguno cambia/está presente
  if ((dni === undefined && pasaporte === undefined) === false) {
    if (!dni && !pasaporte) {
      return res.status(400).json({ ok: false, error: "Debe ingresar DNI o Pasaporte" });
    }
  }

  // Normalizar strings vacíos a null
  const dniVal = dni === "" ? null : dni ?? undefined;
  const pasVal = pasaporte === "" ? null : pasaporte ?? undefined;
  const fechaVal = fecha_nacimiento === "" ? null : fecha_nacimiento ?? undefined;
  const generoVal = genero === "" ? null : genero ?? undefined;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Verificar existencia del turista y obtener id_usuario
    const [turRows] = await conn.query(
      "SELECT id_usuario FROM turistas WHERE id_turista = ?",
      [id]
    );
    if (turRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ ok: false, error: "Turista no encontrado" });
    }
    const idUsuario = turRows[0].id_usuario;

    // Construir actualización parcial de turista
    const setParts = [];
    const values = [];
    setParts.push("nombre = ?"); values.push(nombre);
    setParts.push("apellido = ?"); values.push(apellido);
    if (dniVal !== undefined) { setParts.push("dni = ?"); values.push(dniVal); }
    if (pasVal !== undefined) { setParts.push("pasaporte = ?"); values.push(pasVal); }
    if (nacionalidad !== undefined) { setParts.push("nacionalidad = ?"); values.push(nacionalidad); }
    if (fechaVal !== undefined) { setParts.push("fecha_nacimiento = ?"); values.push(fechaVal); }
    if (generoVal !== undefined) { setParts.push("genero = ?"); values.push(generoVal); }

    if (setParts.length === 0) {
      await conn.rollback();
      return res.status(400).json({ ok: false, error: "No hay campos para actualizar" });
    }

    const updateSql = `UPDATE turistas SET ${setParts.join(", ")} WHERE id_turista = ?`;
    values.push(id);
    const [updTur] = await conn.query(updateSql, values);
    if (updTur.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ ok: false, error: "Turista no encontrado" });
    }

    // Opcional: actualizar email del usuario
    if (email !== undefined) {
      const emailNorm = email ? String(email).toLowerCase() : null;
      await conn.query(
        "UPDATE usuarios SET email = ? WHERE id_usuario = ?",
        [emailNorm, idUsuario]
      );
    }

    await conn.commit();
    return res.json({ ok: true });
  } catch (err) {
    if (conn) await conn.rollback();
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, error: "Dato duplicado (email, dni o pasaporte)" });
    }
    console.error("❌ Error al actualizar turista:", err.message);
    return res.status(500).json({ ok: false, error: "Error en el servidor" });
  } finally {
    if (conn) conn.release();
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
