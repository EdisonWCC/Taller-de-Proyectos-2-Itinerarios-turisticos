// backend/server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool, { testConnection } from "./src/config/db.js";
import PDFDocument from 'pdfkit';
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

// Listar grupos
app.get("/api/grupos", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_grupo, nombre, descripcion FROM grupos ORDER BY id_grupo DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener grupos:", err.message);
    res.status(500).json({ ok: false, error: "Error al obtener grupos" });
  }
});

// Dashboard: ingresos por tipo de programa por mes
app.get('/api/dashboard/revenue-by-type', requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req);
    const [rows] = await pool.query(
      `SELECT ym, tipo, SUM(revenue) AS revenue
       FROM (
         SELECT 
           DATE_FORMAT(ip.fecha, '%Y-%m') AS ym,
           p.tipo AS tipo,
           SUM(p.costo) AS revenue
         FROM itinerario_programas ip
         JOIN programas p ON p.id_programa = ip.id_programa
         WHERE ip.fecha IS NOT NULL AND ip.fecha BETWEEN ? AND ?
         GROUP BY ym, p.tipo
         UNION ALL
         SELECT 
           DATE_FORMAT(i.fecha_inicio, '%Y-%m') AS ym,
           p.tipo AS tipo,
           SUM(p.costo) AS revenue
         FROM itinerario_programas ip
         JOIN programas p ON p.id_programa = ip.id_programa
         JOIN itinerarios i ON i.id_itinerario = ip.id_itinerario
         WHERE ip.fecha IS NULL AND i.fecha_inicio BETWEEN ? AND ?
         GROUP BY ym, p.tipo
       ) t
       GROUP BY ym, tipo
       ORDER BY ym`,
      [startDate, endDate, startDate, endDate]
    );

    // Armar meses completos y pivotear tipos
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const byYm = new Map();
    for (const r of rows) {
      const cur = byYm.get(r.ym) || { tour: 0, actividad: 0, machupicchu: 0 };
      const tipo = String(r.tipo || '').toLowerCase();
      const amount = Number(r.revenue || 0);
      if (tipo === 'tour') cur.tour += amount;
      else if (tipo === 'actividad') cur.actividad += amount;
      else if (tipo === 'machupicchu') cur.machupicchu += amount;
      byYm.set(r.ym, cur);
    }
    const result = [];
    const cursor = new Date(start);
    cursor.setDate(1);
    while (cursor <= end) {
      const ym = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}`;
      const label = cursor.toLocaleDateString('es-PE', { month: 'short' });
      const val = byYm.get(ym) || { tour: 0, actividad: 0, machupicchu: 0 };
      result.push({
        month: label.charAt(0).toUpperCase() + label.slice(1),
        ...val
      });
      cursor.setMonth(cursor.getMonth()+1);
    }
    return res.json(result);
  } catch (e) {
    console.error('❌ /api/dashboard/revenue-by-type error:', e.message);
    return res.status(500).json({ ok: false, error: 'Error obteniendo ingresos por tipo' });
  }
});

// Crear grupo
app.post("/api/grupos", async (req, res) => {
  const { nombre, descripcion } = req.body || {};
  if (!nombre) return res.status(400).json({ ok: false, error: "Nombre requerido" });
  try {
    const [r] = await pool.query(
      "INSERT INTO grupos (nombre, descripcion) VALUES (?, ?)",
      [nombre, descripcion || null]
    );
    res.json({ ok: true, id_grupo: r.insertId, nombre, descripcion: descripcion || null });
  } catch (err) {
    console.error("❌ Error al crear grupo:", err.message);
    res.status(500).json({ ok: false, error: "Error al crear grupo" });
  }
});

// Actualizar grupo
app.put("/api/grupos/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body || {};
  if (!nombre) return res.status(400).json({ ok: false, error: "Nombre requerido" });
  try {
    const [result] = await pool.query(
      "UPDATE grupos SET nombre = ?, descripcion = ? WHERE id_grupo = ?",
      [nombre, descripcion || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Grupo no encontrado" });
    }
    res.json({ ok: true, id_grupo: Number(id), nombre, descripcion: descripcion || null });
  } catch (err) {
    console.error("❌ Error al actualizar grupo:", err.message);
    res.status(500).json({ ok: false, error: "Error al actualizar grupo" });
  }
});

// Estados de presupuesto
app.get("/api/estados-presupuesto", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_estado, nombre_estado FROM estados_presupuesto ORDER BY id_estado"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener estados de presupuesto:", err.message);
    res.status(500).json({ ok: false, error: "Error al obtener estados de presupuesto" });
  }
});

// Transportes
app.get("/api/transportes", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_transporte, empresa, tipo, capacidad, contacto FROM transportes ORDER BY id_transporte DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener transportes:", err.message);
    res.status(500).json({ ok: false, error: "Error al obtener transportes" });
  }
});

// Programas
app.get("/api/programas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_programa, nombre, descripcion, tipo, duracion, costo FROM programas ORDER BY id_programa DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener programas:", err.message);
    res.status(500).json({ ok: false, error: "Error al obtener programas" });
  }
});

// Turistas de un grupo (turistas que ya participaron en itinerarios de ese grupo)
app.get("/api/grupos/:id/turistas", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT t.*
       FROM itinerarios i
       JOIN itinerario_turistas it ON it.id_itinerario = i.id_itinerario
       JOIN turistas t ON t.id_turista = it.id_turista
       WHERE i.id_grupo = ?`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener turistas del grupo:", err.message);
    res.status(500).json({ ok: false, error: "Error al obtener turistas del grupo" });
  }
});

// Crear itinerario completo con todas sus relaciones (transaccional)
app.post("/api/itinerarios", async (req, res) => {
  const payload = req.body || {};
  const {
    grupo,
    datosItinerario,
    turistas = [],
    programas = [],
    transportes = [],
    detallesMachu = []
  } = payload;

  if (!datosItinerario?.fecha_inicio || !datosItinerario?.fecha_fin || !datosItinerario?.estado_presupuesto_id) {
    return res.status(400).json({ ok: false, error: "Datos del itinerario incompletos" });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1) Grupo (crear si no trae id)
    let id_grupo = null;
    if (grupo?.id_grupo || grupo?.id) {
      id_grupo = grupo.id_grupo || grupo.id;
    } else if (grupo?.nombre_grupo) {
      const [g] = await conn.query(
        `INSERT INTO grupos (nombre, descripcion) VALUES (?, ?)`,
        [grupo.nombre_grupo, grupo.descripcion || null]
      );
      id_grupo = g.insertId;
    }

    // 2) Itinerario
    const [it] = await conn.query(
      `INSERT INTO itinerarios (id_grupo, fecha_inicio, fecha_fin, estado_presupuesto_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [id_grupo || null, datosItinerario.fecha_inicio, datosItinerario.fecha_fin, datosItinerario.estado_presupuesto_id]
    );
    const id_itinerario = it.insertId;

    // 3) Turistas
    if (Array.isArray(turistas) && turistas.length > 0) {
      const values = turistas.filter(t => t?.id_turista).map(t => [id_itinerario, t.id_turista]);
      if (values.length > 0) {
        await conn.query(`INSERT INTO itinerario_turistas (id_itinerario, id_turista) VALUES ?`, [values]);
      }
    }

    // 4) Programas base + itinerario_programas (mapear IDs temporales)
    const ipIdMap = new Map();
    for (const itp of programas || []) {
      const info = itp.programa_info || {};
      let id_programa = info.id_programa;
      // Si viene un id_programa, validar existencia; si no existe, crearlo
      if (id_programa) {
        const [chk] = await conn.query(`SELECT id_programa FROM programas WHERE id_programa = ?`, [id_programa]);
        if (!Array.isArray(chk) || chk.length === 0) {
          id_programa = undefined; // forzar creación
        }
      }
      if (!id_programa) {
        const [p] = await conn.query(
          `INSERT INTO programas (nombre, descripcion, tipo, duracion, costo) VALUES (?, ?, ?, ?, ?)`,
          [info.nombre, info.descripcion || null, info.tipo, parseInt(info.duracion || 0) || 0, parseFloat(info.costo || 0) || 0]
        );
        id_programa = p.insertId;
      }
      const [ip] = await conn.query(
        `INSERT INTO itinerario_programas (id_itinerario, id_programa, fecha, hora_inicio, hora_fin) VALUES (?, ?, ?, ?, ?)`,
        [id_itinerario, id_programa, itp.fecha, itp.hora_inicio, itp.hora_fin]
      );
      if (itp.id_itinerario_programa) ipIdMap.set(String(itp.id_itinerario_programa), ip.insertId);
    }

    // 5) Detalle transportes
    for (const d of transportes || []) {
      const realIp = ipIdMap.get(String(d.id_itinerario_programa));
      if (!realIp || !d.id_transporte) continue;
      const [insDTI] = await conn.query(
        `INSERT INTO detalle_transporte_itinerario (id_itinerario_programa, id_transporte, horario_recojo, lugar_recojo) VALUES (?, ?, ?, ?)`,
        [realIp, d.id_transporte, d.horario_recojo, d.lugar_recojo]
      );
      console.log("INSERT detalle_transporte_itinerario rows:", insDTI?.affectedRows);
    }

    // 6) Detalle Machu Picchu
    for (const m of detallesMachu || []) {
      const realIp = ipIdMap.get(String(m.id_itinerario_programa));
      if (!realIp) continue;
      await conn.query(
        `INSERT INTO detalle_machu_itinerario (id_itinerario_programa, empresa_tren, horario_tren_ida, horario_tren_retor, nombre_guia, ruta, tiempo_visita)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [realIp, m.empresa_tren, m.horario_tren_ida, m.horario_tren_retor, m.nombre_guia, m.ruta, m.tiempo_visita]
      );
    }

    await conn.commit();
    res.json({ ok: true, id_itinerario });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("❌ Error creando itinerario:", err.message);
    res.status(500).json({ ok: false, error: "Error al crear itinerario" });
  } finally {
    if (conn) conn.release();
  }
});

// Endpoint de registro
app.post("/api/registro", async (req, res) => {
  const { nombre, apellido, email, usuario, contrasena, fecha_nac, genero } = req.body;

  if (!nombre || !apellido || !email || !usuario || !contrasena || !fecha_nac) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const hashed = await bcrypt.hash(contrasena, 10);
    await pool.query(
      "INSERT INTO usuarios (nombre_usuario, email, password) VALUES (?, ?, ?)",
      [usuario, email.toLowerCase(), hashed]
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
    const stored = user.password;

    // Requerir hash bcrypt en la base de datos; no permitir fallback a plain-text.
    if (typeof stored !== 'string' || !stored.startsWith('$2')) {
      console.warn(`Intento de login con usuario que tiene password no-hasheada en DB: ${usuario}`);
      return res.status(401).json({ error: "Credenciales incorrectas. Por seguridad, restablezca la contraseña." });
    }

    const match = await bcrypt.compare(contrasena, stored);
    if (!match) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    const role = (user.rol || "CLIENTE").toString().toUpperCase();
    const token = jwt.sign(
      { id: user.id_usuario, usuario: user.nombre_usuario, role },
      SECRET,
      { expiresIn: '2h' }
    );
    res.json({ ok: true, usuario: user.nombre_usuario, role, token });
  } catch (err) {
    console.error("❌ Error en login:", err.message);
    res.status(500).json({ error: "Error en el servidor." });
  }
});

// Cambiar estado activo/inactivo de turista
app.put("/api/turistas/:id/status", async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  if (typeof activo !== 'boolean') {
    return res.status(400).json({ ok: false, error: "El campo 'activo' debe ser true o false." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE turistas SET activo = ? WHERE id_turista = ?",
      [activo ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Turista no encontrado." });
    }

    res.json({ ok: true, message: `Turista ${activo ? 'activado' : 'desactivado'} correctamente` });
  } catch (err) {
    console.error("❌ Error al cambiar estado del turista:", err.message);
    res.status(500).json({ ok: false, error: "Error al cambiar estado del turista" });
  }
});

// Listar todos los turistas (activos e inactivos)
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
         t.activo,
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

// Actualizar datos de un turista y su email (usuario asociado)
app.put("/api/turistas/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, dni, pasaporte, nacionalidad, fecha_nacimiento, genero, email } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1️⃣ Obtener el id_usuario vinculado al turista
    const [rows] = await conn.query(
      "SELECT id_usuario FROM turistas WHERE id_turista = ?",
      [id]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ ok: false, error: "Turista no encontrado" });
    }
    const idUsuario = rows[0].id_usuario;

    // 2️⃣ Actualizar datos del turista
    const [updateTurista] = await conn.query(
      `UPDATE turistas 
       SET nombre = ?, apellido = ?, dni = ?, pasaporte = ?, nacionalidad = ?, fecha_nacimiento = ?, genero = ?
       WHERE id_turista = ?`,
      [nombre, apellido, dni || null, pasaporte || null, nacionalidad, fecha_nacimiento, genero, id]
    );

    // 3️⃣ Si se envía email, actualizarlo también en usuarios
    if (email && idUsuario) {
      await conn.query(
        "UPDATE usuarios SET email = ? WHERE id_usuario = ?",
        [email.toLowerCase(), idUsuario]
      );
    }

    await conn.commit();
    res.json({ ok: true, message: "Turista actualizado correctamente" });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("❌ Error al actualizar turista:", err.message);
    res.status(500).json({ ok: false, error: "Error al actualizar turista" });
  } finally {
    if (conn) conn.release();
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

// Listar todos los turistas (activos e inactivos)
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
         t.activo,
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

// Listado de itinerarios con relaciones anidadas (grupos, programas, transportes y turistas)
app.get("/api/itinerarios", async (req, res) => {
  try {
    const [base] = await pool.query(
      `SELECT 
         i.id_itinerario AS id,
         i.id_grupo,
         i.fecha_inicio,
         i.fecha_fin,
         i.estado_presupuesto_id,
         e.nombre_estado AS estado_presupuesto,
         g.nombre AS grupo_nombre,
         g.descripcion AS grupo_descripcion
       FROM itinerarios i
       LEFT JOIN grupos g ON g.id_grupo = i.id_grupo
       LEFT JOIN estados_presupuesto e ON e.id_estado = i.estado_presupuesto_id
       ORDER BY i.id_itinerario DESC`
    );

    if (!Array.isArray(base) || base.length === 0) return res.json([]);

    const ids = base.map(r => r.id);

    // Programas + info + detalle Machu
    const [prog] = await pool.query(
      `SELECT 
         ip.id_itinerario,
         ip.id_itinerario_programa,
         ip.fecha,
         ip.hora_inicio,
         ip.hora_fin,
         p.id_programa,
         p.nombre,
         p.tipo,
         p.descripcion,
         p.duracion,
         p.costo,
         dm.empresa_tren,
         dm.horario_tren_ida,
         dm.horario_tren_retor,
         dm.nombre_guia,
         dm.ruta,
         dm.tiempo_visita
       FROM itinerario_programas ip
       JOIN programas p ON p.id_programa = ip.id_programa
       LEFT JOIN detalle_machu_itinerario dm ON dm.id_itinerario_programa = ip.id_itinerario_programa
       WHERE ip.id_itinerario IN (?)`, [ids]
    );

    // Transportes
    const [transp] = await pool.query(
      `SELECT 
         ip.id_itinerario,
         dti.id_detalle_transporte,
         dti.id_itinerario_programa,
         dti.id_transporte,
         dti.horario_recojo,
         dti.lugar_recojo,
         t.empresa,
         t.tipo,
         t.capacidad,
         t.contacto
       FROM detalle_transporte_itinerario dti
       JOIN itinerario_programas ip ON ip.id_itinerario_programa = dti.id_itinerario_programa
       JOIN transportes t ON t.id_transporte = dti.id_transporte
       WHERE ip.id_itinerario IN (?)`, [ids]
    );

    // Turistas
    const [turs] = await pool.query(
      `SELECT it.id_itinerario, t.*
       FROM itinerario_turistas it
       JOIN turistas t ON t.id_turista = it.id_turista
       WHERE it.id_itinerario IN (?)`, [ids]
    );

    // Armar respuesta
    const byId = new Map();
    base.forEach(r => {
      byId.set(r.id, {
        id: r.id,
        grupo: r.id_grupo ? { id_grupo: r.id_grupo, nombre_grupo: r.grupo_nombre, descripcion: r.grupo_descripcion } : null,
        fecha_inicio: r.fecha_inicio,
        fecha_fin: r.fecha_fin,
        estado_presupuesto_id: r.estado_presupuesto_id,
        estado_presupuesto: r.estado_presupuesto,
        programas: [],
        transportes: [],
        turistas: []
      });
    });

    for (const p of prog) {
      const it = byId.get(p.id_itinerario);
      if (!it) continue;
      const item = {
        id: p.id_itinerario_programa,
        fecha: p.fecha,
        hora_inicio: p.hora_inicio,
        hora_fin: p.hora_fin,
        programa_info: {
          id_programa: p.id_programa,
          nombre: p.nombre,
          tipo: p.tipo,
          descripcion: p.descripcion,
          duracion: p.duracion,
          costo: p.costo
        }
      };
      if (p.empresa_tren || p.horario_tren_ida || p.horario_tren_retor || p.nombre_guia || p.ruta || p.tiempo_visita) {
        item.detalles_machupicchu = {
          id_itinerario_programa: p.id_itinerario_programa,
          empresa_tren: p.empresa_tren,
          horario_tren_ida: p.horario_tren_ida,
          horario_tren_retor: p.horario_tren_retor,
          nombre_guia: p.nombre_guia,
          ruta: p.ruta,
          tiempo_visita: p.tiempo_visita
        };
      }
      it.programas.push(item);
    }

    for (const tr of transp) {
      const it = byId.get(tr.id_itinerario);
      if (!it) continue;
      it.transportes.push({
        id_detalle_transporte: tr.id_detalle_transporte,
        id_itinerario_programa: tr.id_itinerario_programa,
        id_transporte: tr.id_transporte,
        horario_recojo: tr.horario_recojo,
        lugar_recojo: tr.lugar_recojo,
        transporte_info: {
          id_transporte: tr.id_transporte,
          empresa: tr.empresa,
          tipo: tr.tipo,
          capacidad: tr.capacidad,
          contacto: tr.contacto
        }
      });
    }

    for (const t of turs) {
      const it = byId.get(t.id_itinerario);
      if (!it) continue;
      const { id_itinerario, ...rest } = t;
      it.turistas.push(rest);
    }

    res.json(Array.from(byId.values()));
  } catch (err) {
    console.error("❌ Error al listar itinerarios:", err.message);
    res.status(500).json({ ok: false, error: "Error al listar itinerarios" });
  }
});

// Obtener 1 itinerario por id con relaciones
app.get("/api/itinerarios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT 
         i.id_itinerario AS id,
         i.id_grupo,
         i.fecha_inicio,
         i.fecha_fin,
         i.estado_presupuesto_id,
         e.nombre_estado AS estado_presupuesto,
         g.nombre AS grupo_nombre,
         g.descripcion AS grupo_descripcion
       FROM itinerarios i
       LEFT JOIN grupos g ON g.id_grupo = i.id_grupo
       LEFT JOIN estados_presupuesto e ON e.id_estado = i.estado_presupuesto_id
       WHERE i.id_itinerario = ?`, [id]
    );
    if (rows.length === 0) return res.status(404).json({ ok: false, error: "Itinerario no encontrado" });

    const base = rows[0];
    const resp = {
      id: base.id,
      grupo: base.id_grupo ? { id_grupo: base.id_grupo, nombre_grupo: base.grupo_nombre, descripcion: base.grupo_descripcion } : null,
      fecha_inicio: base.fecha_inicio,
      fecha_fin: base.fecha_fin,
      estado_presupuesto_id: base.estado_presupuesto_id,
      estado_presupuesto: base.estado_presupuesto,
      programas: [],
      transportes: [],
      turistas: []
    };

    const [prog] = await pool.query(
      `SELECT 
         ip.id_itinerario_programa,
         ip.fecha,
         ip.hora_inicio,
         ip.hora_fin,
         p.id_programa,
         p.nombre,
         p.tipo,
         p.descripcion,
         p.duracion,
         p.costo,
         dm.empresa_tren,
         dm.horario_tren_ida,
         dm.horario_tren_retor,
         dm.nombre_guia,
         dm.ruta,
         dm.tiempo_visita
       FROM itinerario_programas ip
       JOIN programas p ON p.id_programa = ip.id_programa
       LEFT JOIN detalle_machu_itinerario dm ON dm.id_itinerario_programa = ip.id_itinerario_programa
       WHERE ip.id_itinerario = ?`, [id]
    );
    for (const p of prog) {
      const item = {
        id: p.id_itinerario_programa,
        fecha: p.fecha,
        hora_inicio: p.hora_inicio,
        hora_fin: p.hora_fin,
        programa_info: {
          id_programa: p.id_programa,
          nombre: p.nombre,
          tipo: p.tipo,
          descripcion: p.descripcion,
          duracion: p.duracion,
          costo: p.costo
        }
      };
      if (p.empresa_tren || p.horario_tren_ida || p.horario_tren_retor || p.nombre_guia || p.ruta || p.tiempo_visita) {
        item.detalles_machupicchu = {
          id_itinerario_programa: p.id_itinerario_programa,
          empresa_tren: p.empresa_tren,
          horario_tren_ida: p.horario_tren_ida,
          horario_tren_retor: p.horario_tren_retor,
          nombre_guia: p.nombre_guia,
          ruta: p.ruta,
          tiempo_visita: p.tiempo_visita
        };
      }
      resp.programas.push(item);
    }

    const [transp] = await pool.query(
      `SELECT 
         dti.id_detalle_transporte,
         dti.id_itinerario_programa,
         dti.id_transporte,
         dti.horario_recojo,
         dti.lugar_recojo,
         t.empresa,
         t.tipo,
         t.capacidad,
         t.contacto
       FROM detalle_transporte_itinerario dti
       JOIN itinerario_programas ip ON ip.id_itinerario_programa = dti.id_itinerario_programa
       JOIN transportes t ON t.id_transporte = dti.id_transporte
       WHERE ip.id_itinerario = ?`, [id]
    );
    for (const tr of transp) {
      resp.transportes.push({
        id_detalle_transporte: tr.id_detalle_transporte,
        id_itinerario_programa: tr.id_itinerario_programa,
        id_transporte: tr.id_transporte,
        horario_recojo: tr.horario_recojo,
        lugar_recojo: tr.lugar_recojo,
        transporte_info: {
          id_transporte: tr.id_transporte,
          empresa: tr.empresa,
          tipo: tr.tipo,
          capacidad: tr.capacidad,
          contacto: tr.contacto
        }
      });
    }

    const [turs] = await pool.query(
      `SELECT t.*
       FROM itinerario_turistas it
       JOIN turistas t ON t.id_turista = it.id_turista
       WHERE it.id_itinerario = ?`, [id]
    );
    resp.turistas = turs;

    res.json(resp);
  } catch (err) {
    console.error("❌ Error al obtener itinerario:", err.message);
    res.status(500).json({ ok: false, error: "Error al obtener itinerario" });
  }
});

// Eliminar itinerario solo si no tiene turistas asociados
app.delete("/api/itinerarios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si tiene turistas asociados
    const [chk] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM itinerario_turistas WHERE id_itinerario = ?`,
      [id]
    );
    const cnt = Array.isArray(chk) && chk[0]?.cnt ? Number(chk[0].cnt) : 0;
    if (cnt > 0) {
      return res.status(400).json({ ok: false, error: "No se puede eliminar: el itinerario tiene turistas asociados" });
    }

    // Eliminar relaciones dependientes
    await pool.query(
      `DELETE dmi FROM detalle_machu_itinerario dmi
       JOIN itinerario_programas ip ON ip.id_itinerario_programa = dmi.id_itinerario_programa
       WHERE ip.id_itinerario = ?`,
      [id]
    );
    await pool.query(
      `DELETE dti FROM detalle_transporte_itinerario dti
       JOIN itinerario_programas ip ON ip.id_itinerario_programa = dti.id_itinerario_programa
       WHERE ip.id_itinerario = ?`,
      [id]
    );
    await pool.query(`DELETE FROM itinerario_programas WHERE id_itinerario = ?`, [id]);

    // Borrar el itinerario
    const [delIt] = await pool.query(`DELETE FROM itinerarios WHERE id_itinerario = ?`, [id]);
    if (!delIt?.affectedRows) {
      return res.status(404).json({ ok: false, error: "Itinerario no encontrado" });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Error al eliminar itinerario:", err.message);
    res.status(500).json({ ok: false, error: "Error al eliminar itinerario" });
  }
});

// Actualizar un único programa de un itinerario (sin reconstruir todas las relaciones)
app.patch("/api/itinerarios/:id/programas/:ipId", async (req, res) => {
  const { id, ipId } = req.params;
  const {
    fecha,
    hora_inicio,
    hora_fin,
    programa_info = {}
  } = req.body || {};

  let conn;
  try {
    console.log("PATCH /api/itinerarios/%s/programas/%s - body:", id, ipId, req.body);
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Verificar que el item pertenece al itinerario
    const [rows] = await conn.query(
      `SELECT ip.id_itinerario_programa, ip.id_itinerario, ip.id_programa
       FROM itinerario_programas ip
       WHERE ip.id_itinerario_programa = ?`,
      [ipId]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ ok: false, error: "Programa del itinerario no encontrado" });
    }
    const current = rows[0];
    if (String(current.id_itinerario) !== String(id)) {
      await conn.rollback();
      return res.status(400).json({ ok: false, error: "El programa no pertenece a este itinerario" });
    }

    // Snapshot previo del ip y del programa para auditoría
    let prevIp = null;
    try {
      const [rPrev] = await conn.query(
        `SELECT fecha, hora_inicio, hora_fin FROM itinerario_programas WHERE id_itinerario_programa = ?`,
        [ipId]
      );
      prevIp = Array.isArray(rPrev) && rPrev[0] ? rPrev[0] : null;
    } catch {}

    // Actualizar campos del itinerario_programas si fueron provistos
    const updates = [];
    const params = [];
    if (typeof fecha !== 'undefined') { updates.push('fecha = ?'); params.push(fecha); }
    if (typeof hora_inicio !== 'undefined') { updates.push('hora_inicio = ?'); params.push(hora_inicio); }
    if (typeof hora_fin !== 'undefined') { updates.push('hora_fin = ?'); params.push(hora_fin); }
    if (updates.length > 0) {
      params.push(ipId);
      const [upRes] = await conn.query(
        `UPDATE itinerario_programas SET ${updates.join(', ')} WHERE id_itinerario_programa = ?`,
        params
      );
      console.log("itinerario_programas UPDATE affectedRows:", upRes?.affectedRows);
    }

    // Auditoría de cambios en itinerario_programas (si se enviaron campos)
    try {
      if (prevIp) {
        const ch = [];
        if (typeof fecha !== 'undefined' && String(fecha) !== String(prevIp.fecha)) ch.push(`fecha: ${prevIp.fecha || ''} → ${fecha}`);
        if (typeof hora_inicio !== 'undefined' && String(hora_inicio || '') !== String(prevIp.hora_inicio || '')) ch.push(`hora_inicio: ${prevIp.hora_inicio || ''} → ${hora_inicio || ''}`);
        if (typeof hora_fin !== 'undefined' && String(hora_fin || '') !== String(prevIp.hora_fin || '')) ch.push(`hora_fin: ${prevIp.hora_fin || ''} → ${hora_fin || ''}`);
        if (ch.length > 0) {
          await conn.query(
            `INSERT INTO itinerario_cambios (id_itinerario, tipo_cambio, referencia_id, detalle) VALUES (?, 'programa', ?, ?)`,
            [current.id_itinerario, ipId, `Horario de programa actualizado (${ch.join('; ')})`]
          );
        }
      }
    } catch (e) { console.warn('Audit ip change skip:', e?.message); }

    // Actualizar datos del programa vinculado si se enviaron
    if (programa_info && Object.keys(programa_info).length > 0) {
      const pUpdates = [];
      const pParams = [];
      let prevProg = null;
      try {
        const [prow] = await conn.query(`SELECT nombre, descripcion, tipo, duracion, costo FROM programas WHERE id_programa = ?`, [current.id_programa]);
        prevProg = Array.isArray(prow) && prow[0] ? prow[0] : null;
      } catch {}
      if (typeof programa_info.nombre !== 'undefined') { pUpdates.push('nombre = ?'); pParams.push(programa_info.nombre); }
      if (typeof programa_info.descripcion !== 'undefined') { pUpdates.push('descripcion = ?'); pParams.push(programa_info.descripcion); }
      if (typeof programa_info.tipo !== 'undefined') { pUpdates.push('tipo = ?'); pParams.push(programa_info.tipo); }
      if (typeof programa_info.duracion !== 'undefined') { pUpdates.push('duracion = ?'); pParams.push(parseInt(programa_info.duracion || 0) || 0); }
      if (typeof programa_info.costo !== 'undefined') { pUpdates.push('costo = ?'); pParams.push(parseFloat(programa_info.costo || 0) || 0); }
      if (pUpdates.length > 0) {
        pParams.push(current.id_programa);
        const [pRes] = await conn.query(
          `UPDATE programas SET ${pUpdates.join(', ')} WHERE id_programa = ?`,
          pParams
        );
        console.log("programas UPDATE affectedRows:", pRes?.affectedRows);
      }
    }

    // Auditoría de cambios en programa_info
    try {
      if (programa_info && prevProg) {
        const cambios = [];
        if (typeof programa_info.nombre !== 'undefined' && programa_info.nombre !== prevProg.nombre) cambios.push(`nombre: ${prevProg.nombre || ''} → ${programa_info.nombre || ''}`);
        if (typeof programa_info.tipo !== 'undefined' && programa_info.tipo !== prevProg.tipo) cambios.push(`tipo: ${prevProg.tipo || ''} → ${programa_info.tipo || ''}`);
        if (typeof programa_info.duracion !== 'undefined' && (parseInt(programa_info.duracion||0)||0) !== (parseInt(prevProg.duracion||0)||0)) cambios.push(`duracion: ${prevProg.duracion || 0} → ${parseInt(programa_info.duracion||0)||0}`);
        if (typeof programa_info.costo !== 'undefined' && Number(programa_info.costo||0) !== Number(prevProg.costo||0)) cambios.push(`costo: ${prevProg.costo || 0} → ${Number(programa_info.costo||0)}`);
        if (typeof programa_info.descripcion !== 'undefined' && programa_info.descripcion !== prevProg.descripcion) cambios.push('descripcion cambiada');
        if (cambios.length > 0) {
          await conn.query(
            `INSERT INTO itinerario_cambios (id_itinerario, tipo_cambio, referencia_id, detalle) VALUES (?, 'programa', ?, ?)`,
            [current.id_itinerario, current.id_programa, `Programa actualizado (${cambios.join('; ')})`]
          );
        }
      }
    } catch (e) { console.warn('Audit programa_info skip:', e?.message); }

    await conn.commit();
    console.log("PATCH commit ok for ipId=", ipId);
    return res.json({ ok: true });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("❌ Error actualizando programa del itinerario:", err.message);
    return res.status(500).json({ ok: false, error: "Error al actualizar el programa" });
  } finally {
    if (conn) conn.release();
  }
});

// Actualizar itinerario y reemplazar relaciones (transaccional)
app.put("/api/itinerarios/:id", async (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};
  const {
    grupo,
    datosItinerario,
    turistas = [],
    programas = [],
    transportes = [],
    detallesMachu = []
  } = payload;

  if (!datosItinerario?.fecha_inicio || !datosItinerario?.fecha_fin || !datosItinerario?.estado_presupuesto_id) {
    return res.status(400).json({ ok: false, error: "Datos del itinerario incompletos" });
  }

  let conn;
  try {
    console.log("PUT /api/itinerarios/%s - payload sizes:", id, {
      turistas: Array.isArray(turistas) ? turistas.length : 0,
      programas: Array.isArray(programas) ? programas.length : 0,
      transportes: Array.isArray(transportes) ? transportes.length : 0,
      detallesMachu: Array.isArray(detallesMachu) ? detallesMachu.length : 0,
    });
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Snapshot previo del itinerario
    let prevIt = null;
    try {
      const [prow] = await conn.query(`SELECT id_grupo, fecha_inicio, fecha_fin, estado_presupuesto_id FROM itinerarios WHERE id_itinerario = ?`, [id]);
      prevIt = Array.isArray(prow) && prow[0] ? prow[0] : null;
    } catch {}

    // Actualizar datos base
    let id_grupo = null;
    if (grupo?.id_grupo || grupo?.id) id_grupo = grupo.id_grupo || grupo.id;
    await conn.query(
      `UPDATE itinerarios 
       SET id_grupo = ?, fecha_inicio = ?, fecha_fin = ?, estado_presupuesto_id = ?, updated_at = NOW()
       WHERE id_itinerario = ?`,
      [id_grupo || null, datosItinerario.fecha_inicio, datosItinerario.fecha_fin, datosItinerario.estado_presupuesto_id, id]
    );

    // Limpiar relaciones existentes
    const [delMachu] = await conn.query(`DELETE dmi FROM detalle_machu_itinerario dmi JOIN itinerario_programas ip ON ip.id_itinerario_programa = dmi.id_itinerario_programa WHERE ip.id_itinerario = ?`, [id]);
    const [delTrans] = await conn.query(`DELETE dti FROM detalle_transporte_itinerario dti JOIN itinerario_programas ip ON ip.id_itinerario_programa = dti.id_itinerario_programa WHERE ip.id_itinerario = ?`, [id]);
    const [delTurs] = await conn.query(`DELETE FROM itinerario_turistas WHERE id_itinerario = ?`, [id]);
    const [delProg] = await conn.query(`DELETE FROM itinerario_programas WHERE id_itinerario = ?`, [id]);
    console.log("DELETE counts:", { delMachu: delMachu?.affectedRows, delTrans: delTrans?.affectedRows, delTurs: delTurs?.affectedRows, delProg: delProg?.affectedRows });

    // Reinsertar relaciones
    if (Array.isArray(turistas) && turistas.length > 0) {
      const values = turistas.filter(t => t?.id_turista).map(t => [id, t.id_turista]);
      if (values.length > 0) {
        const [insT] = await conn.query(`INSERT INTO itinerario_turistas (id_itinerario, id_turista) VALUES ?`, [values]);
        console.log("INSERT itinerario_turistas rows:", insT?.affectedRows);
      }
    }

    const ipIdMap = new Map();
    for (const itp of programas || []) {
      const info = itp.programa_info || {};
      let id_programa = info.id_programa;
      // Si viene un id_programa, validar existencia; si no existe, crearlo
      if (id_programa) {
        const [chk] = await conn.query(`SELECT id_programa FROM programas WHERE id_programa = ?`, [id_programa]);
        if (!Array.isArray(chk) || chk.length === 0) {
          id_programa = undefined; // forzar creación
        }
      }
      if (!id_programa) {
        const [p] = await conn.query(
          `INSERT INTO programas (nombre, descripcion, tipo, duracion, costo) VALUES (?, ?, ?, ?, ?)`,
          [info.nombre, info.descripcion || null, info.tipo, parseInt(info.duracion || 0) || 0, parseFloat(info.costo || 0) || 0]
        );
        id_programa = p.insertId;
      }
      const [ip] = await conn.query(
        `INSERT INTO itinerario_programas (id_itinerario, id_programa, fecha, hora_inicio, hora_fin) VALUES (?, ?, ?, ?, ?)`,
        [id, id_programa, itp.fecha, itp.hora_inicio, itp.hora_fin]
      );
      if (itp.id_itinerario_programa) ipIdMap.set(String(itp.id_itinerario_programa), ip.insertId);
    }

    for (const d of transportes || []) {
      const realIp = ipIdMap.get(String(d.id_itinerario_programa));
      if (!realIp || !d.id_transporte) continue;
      await conn.query(
        `INSERT INTO detalle_transporte_itinerario (id_itinerario_programa, id_transporte, horario_recojo, lugar_recojo) VALUES (?, ?, ?, ?)`,
        [realIp, d.id_transporte, d.horario_recojo, d.lugar_recojo]
      );
    }

    for (const m of detallesMachu || []) {
      const realIp = ipIdMap.get(String(m.id_itinerario_programa));
      if (!realIp) continue;
      const [insDMI] = await conn.query(
        `INSERT INTO detalle_machu_itinerario (id_itinerario_programa, empresa_tren, horario_tren_ida, horario_tren_retor, nombre_guia, ruta, tiempo_visita)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [realIp, m.empresa_tren, m.horario_tren_ida, m.horario_tren_retor, m.nombre_guia, m.ruta, m.tiempo_visita]
      );
      console.log("INSERT detalle_machu_itinerario rows:", insDMI?.affectedRows);
    }

    await conn.commit();
    console.log("PUT commit ok for itinerario id=", id);
    res.json({ ok: true });
    // Auditoría fuera de la transacción principal
    try {
      // Cambios base del itinerario
      if (prevIt) {
        const baseCh = [];
        if ((prevIt.id_grupo || null) !== (id_grupo || null)) baseCh.push(`grupo: ${prevIt.id_grupo || '—'} → ${id_grupo || '—'}`);
        if (String(prevIt.fecha_inicio) !== String(datosItinerario.fecha_inicio)) baseCh.push(`fecha_inicio: ${prevIt.fecha_inicio} → ${datosItinerario.fecha_inicio}`);
        if (String(prevIt.fecha_fin) !== String(datosItinerario.fecha_fin)) baseCh.push(`fecha_fin: ${prevIt.fecha_fin} → ${datosItinerario.fecha_fin}`);
        if (prevIt.estado_presupuesto_id !== datosItinerario.estado_presupuesto_id) baseCh.push(`estado_presupuesto: ${prevIt.estado_presupuesto_id} → ${datosItinerario.estado_presupuesto_id}`);
        if (baseCh.length > 0) {
          await pool.query(
            `INSERT INTO itinerario_cambios (id_itinerario, tipo_cambio, detalle) VALUES (?, 'itinerario', ?)`,
            [id, `Itinerario actualizado (${baseCh.join('; ')})`]
          );
        }
      }
      // Altas en transportes
      for (const d of transportes || []) {
        await pool.query(
          `INSERT INTO itinerario_cambios (id_itinerario, tipo_cambio, referencia_id, detalle) VALUES (?, 'transporte', ?, ?)`,
          [id, d.id_transporte || 0, `Transporte agregado (id_programa_ref=${d.id_itinerario_programa || '—'}, transporte=${d.id_transporte || '—'})`]
        );
      }
      // Altas en Machu
      for (const m of detallesMachu || []) {
        await pool.query(
          `INSERT INTO itinerario_cambios (id_itinerario, tipo_cambio, detalle) VALUES (?, 'machu', ?)`,
          [id, `Detalle Machu agregado (empresa=${m.empresa_tren || '—'}, guia=${m.nombre_guia || '—'})`]
        );
      }
    } catch (e) { console.warn('Audit PUT skip:', e?.message); }
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("❌ Error actualizando itinerario:", err.message);
    res.status(500).json({ ok: false, error: "Error al actualizar itinerario" });
  } finally {
    if (conn) conn.release();
  }
});

// Iniciar servidor
app.get("/api/turista/itinerarios", requireRole(["CLIENTE","TURISTA","ADMIN"]), async (req, res) => {
try {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "No autenticado" });
  const [rowsTurista] = await pool.query(
    "SELECT id_turista FROM turistas WHERE id_usuario = ?",
    [userId]
  );
  if (!Array.isArray(rowsTurista) || rowsTurista.length === 0) {
    return res.json([]);
  }
  const idTurista = rowsTurista[0].id_turista;
  const [base] = await pool.query(
    `SELECT 
       i.id_itinerario AS id,
       i.id_grupo,
       i.fecha_inicio,
       i.fecha_fin,
       i.estado_presupuesto_id,
       e.nombre_estado AS estado_presupuesto,
       g.nombre AS grupo_nombre,
       g.descripcion AS grupo_descripcion
     FROM itinerarios i
     LEFT JOIN grupos g ON g.id_grupo = i.id_grupo
     LEFT JOIN estados_presupuesto e ON e.id_estado = i.estado_presupuesto_id
     JOIN itinerario_turistas it ON it.id_itinerario = i.id_itinerario
     WHERE it.id_turista = ?
     ORDER BY i.id_itinerario DESC`,
    [idTurista]
  );
  if (!Array.isArray(base) || base.length === 0) return res.json([]);
  const ids = base.map(r => r.id);
  const byId = new Map();
  base.forEach(r => {
    byId.set(r.id, {
      id: r.id,
      grupo: r.id_grupo ? { id_grupo: r.id_grupo, nombre_grupo: r.grupo_nombre, descripcion: r.grupo_descripcion } : null,
      fecha_inicio: r.fecha_inicio,
      fecha_fin: r.fecha_fin,
      estado_presupuesto_id: r.estado_presupuesto_id,
      estado_presupuesto: r.estado_presupuesto,
      programas: [],
      transportes: [],
      turistas: []
    });
  });
  const [prog] = await pool.query(
    `SELECT 
       ip.id_itinerario,
       ip.id_itinerario_programa,
       ip.fecha,
       ip.hora_inicio,
       ip.hora_fin,
       p.id_programa,
       p.nombre,
       p.tipo,
       p.descripcion,
       p.duracion,
       p.costo,
       dm.empresa_tren,
       dm.horario_tren_ida,
       dm.horario_tren_retor,
       dm.nombre_guia,
       dm.ruta,
       dm.tiempo_visita
     FROM itinerario_programas ip
     JOIN programas p ON p.id_programa = ip.id_programa
     LEFT JOIN detalle_machu_itinerario dm ON dm.id_itinerario_programa = ip.id_itinerario_programa
     WHERE ip.id_itinerario IN (?)`, [ids]
  );
  for (const p of prog) {
    const it = byId.get(p.id_itinerario);
    if (!it) continue;
    const item = {
      id: p.id_itinerario_programa,
      fecha: p.fecha,
      hora_inicio: p.hora_inicio,
      hora_fin: p.hora_fin,
      programa_info: {
        id_programa: p.id_programa,
        nombre: p.nombre,
        tipo: p.tipo,
        descripcion: p.descripcion,
        duracion: p.duracion,
        costo: p.costo
      }
    };
    if (p.empresa_tren || p.horario_tren_ida || p.horario_tren_retor || p.nombre_guia || p.ruta || p.tiempo_visita) {
      item.detalles_machupicchu = {
        id_itinerario_programa: p.id_itinerario_programa,
        empresa_tren: p.empresa_tren,
        horario_tren_ida: p.horario_tren_ida,
        horario_tren_retor: p.horario_tren_retor,
        nombre_guia: p.nombre_guia,
        ruta: p.ruta,
        tiempo_visita: p.tiempo_visita
      };
    }
    it.programas.push(item);
  }
  const [transp] = await pool.query(
    `SELECT 
       ip.id_itinerario,
       dti.id_detalle_transporte,
       dti.id_itinerario_programa,
       dti.id_transporte,
       dti.horario_recojo,
       dti.lugar_recojo,
       t.empresa,
       t.tipo,
       t.capacidad,
       t.contacto
     FROM detalle_transporte_itinerario dti
     JOIN itinerario_programas ip ON ip.id_itinerario_programa = dti.id_itinerario_programa
     JOIN transportes t ON t.id_transporte = dti.id_transporte
     WHERE ip.id_itinerario IN (?)`, [ids]
  );
  for (const tr of transp) {
    const it = byId.get(tr.id_itinerario);
    if (!it) continue;
    it.transportes.push({
      id_detalle_transporte: tr.id_detalle_transporte,
      id_itinerario_programa: tr.id_itinerario_programa,
      id_transporte: tr.id_transporte,
      horario_recojo: tr.horario_recojo,
      lugar_recojo: tr.lugar_recojo,
      transporte_info: {
        id_transporte: tr.id_transporte,
        empresa: tr.empresa,
        tipo: tr.tipo,
        capacidad: tr.capacidad,
        contacto: tr.contacto
      }
    });
  }
  const [turs] = await pool.query(
    `SELECT it.id_itinerario, t.*
     FROM itinerario_turistas it
     JOIN turistas t ON t.id_turista = it.id_turista
     WHERE it.id_itinerario IN (?)`, [ids]
  );
  for (const t of turs) {
    const it = byId.get(t.id_itinerario);
    if (!it) continue;
    const { id_itinerario, ...rest } = t;
    it.turistas.push(rest);
  }
  return res.json(Array.from(byId.values()));
} catch (err) {
  console.error("❌ Error al obtener itinerarios del turista:", err.message);
  return res.status(500).json({ ok: false, error: "Error al obtener itinerarios del turista" });
}
});

app.get("/api/turista/notificaciones", requireRole(["CLIENTE","TURISTA","ADMIN"]), async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "No autenticado" });
    const dias = Math.min(Math.max(parseInt(req.query?.dias || 14, 10) || 14, 1), 60);

    const [rowsTurista] = await pool.query(
      "SELECT id_turista FROM turistas WHERE id_usuario = ?",
      [userId]
    );
    if (!Array.isArray(rowsTurista) || rowsTurista.length === 0) {
      return res.json([]);
    }
    const idTurista = rowsTurista[0].id_turista;

    const [prog] = await pool.query(
      `SELECT 
         ip.id_itinerario,
         ip.id_itinerario_programa,
         ip.fecha,
         ip.hora_inicio,
         ip.hora_fin,
         p.nombre AS programa_nombre
       FROM itinerario_programas ip
       JOIN programas p ON p.id_programa = ip.id_programa
       JOIN itinerario_turistas it ON it.id_itinerario = ip.id_itinerario
       WHERE it.id_turista = ?
         AND ip.fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ORDER BY ip.fecha, ip.hora_inicio`,
      [idTurista, dias]
    );

    const [transp] = await pool.query(
      `SELECT 
         ip.id_itinerario,
         dti.id_detalle_transporte,
         dti.id_itinerario_programa,
         dti.horario_recojo,
         dti.lugar_recojo,
         ip.fecha,
         t.empresa,
         t.tipo
       FROM detalle_transporte_itinerario dti
       JOIN itinerario_programas ip ON ip.id_itinerario_programa = dti.id_itinerario_programa
       JOIN transportes t ON t.id_transporte = dti.id_transporte
       JOIN itinerario_turistas it ON it.id_itinerario = ip.id_itinerario
       WHERE it.id_turista = ?
         AND ip.fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ORDER BY ip.fecha, dti.horario_recojo`,
      [idTurista, dias]
    );

    const [updates] = await pool.query(
      `SELECT 
         i.id_itinerario,
         i.updated_at
       FROM itinerarios i
       JOIN itinerario_turistas it ON it.id_itinerario = i.id_itinerario
       WHERE it.id_turista = ?
         AND i.updated_at > i.created_at
         AND i.updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY i.updated_at DESC`,
      [idTurista, dias]
    );

    // Cambios recientes en programas del itinerario (requiere columna updated_at in itinerario_programas)
    let progUpdated = [];
    try {
      const [rows] = await pool.query(
        `SELECT 
           ip.id_itinerario,
           ip.id_itinerario_programa,
           ip.fecha,
           ip.hora_inicio,
           ip.hora_fin,
           ip.updated_at,
           p.nombre AS programa_nombre
         FROM itinerario_programas ip
         JOIN programas p ON p.id_programa = ip.id_programa
         JOIN itinerario_turistas it ON it.id_itinerario = ip.id_itinerario
         WHERE it.id_turista = ?
           AND ip.updated_at IS NOT NULL
           AND ip.updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         ORDER BY ip.updated_at DESC`,
        [idTurista, dias]
      );
      progUpdated = rows;
    } catch (e) {
      console.warn("Aviso: columna updated_at no encontrada en itinerario_programas o consulta falló");
    }

    // Cambios recientes en transportes del itinerario (requiere columna updated_at en detalle_transporte_itinerario)
    let transpUpdated = [];
    try {
      const [rows] = await pool.query(
        `SELECT 
           ip.id_itinerario,
           dti.id_detalle_transporte,
           dti.id_itinerario_programa,
           dti.horario_recojo,
           dti.lugar_recojo,
           dti.updated_at,
           ip.fecha,
           t.empresa,
           t.tipo
         FROM detalle_transporte_itinerario dti
         JOIN itinerario_programas ip ON ip.id_itinerario_programa = dti.id_itinerario_programa
         JOIN transportes t ON t.id_transporte = dti.id_transporte
         JOIN itinerario_turistas it ON it.id_itinerario = ip.id_itinerario
         WHERE it.id_turista = ?
           AND dti.updated_at IS NOT NULL
           AND dti.updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         ORDER BY dti.updated_at DESC`,
        [idTurista, dias]
      );
      transpUpdated = rows;
    } catch (e) {
      console.warn("Aviso: columna updated_at no encontrada en detalle_transporte_itinerario o consulta falló");
    }

    // Cambios recientes en la información base del programa (tabla programas)
    let progInfoUpdated = [];
    try {
      const [rows] = await pool.query(
        `SELECT 
           ip.id_itinerario,
           ip.id_itinerario_programa,
           p.id_programa,
           p.nombre,
           p.updated_at
         FROM itinerario_programas ip
         JOIN programas p ON p.id_programa = ip.id_programa
         JOIN itinerario_turistas it ON it.id_itinerario = ip.id_itinerario
         WHERE it.id_turista = ?
           AND p.updated_at IS NOT NULL
           AND p.updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         ORDER BY p.updated_at DESC`,
        [idTurista, dias]
      );
      progInfoUpdated = rows;
    } catch (e) {
      console.warn("Aviso: columna updated_at no encontrada en programas o consulta falló");
    }

    // Cambios recientes en detalle de Machu Picchu
    let machuUpdated = [];
    try {
      const [rows] = await pool.query(
        `SELECT 
           ip.id_itinerario,
           ip.id_itinerario_programa,
           ip.fecha,
           dm.updated_at,
           dm.empresa_tren,
           dm.horario_tren_ida,
           dm.horario_tren_retor,
           dm.nombre_guia,
           dm.ruta,
           dm.tiempo_visita
         FROM detalle_machu_itinerario dm
         JOIN itinerario_programas ip ON ip.id_itinerario_programa = dm.id_itinerario_programa
         JOIN itinerario_turistas it ON it.id_itinerario = ip.id_itinerario
         WHERE it.id_turista = ?
           AND dm.updated_at IS NOT NULL
           AND dm.updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         ORDER BY dm.updated_at DESC`,
        [idTurista, dias]
      );
      machuUpdated = rows;
    } catch (e) {
      console.warn("Aviso: columna updated_at no encontrada en detalle_machu_itinerario o consulta falló");
    }

    const items = [];
    for (const p of prog) {
      items.push({
        type: "programa_proximo",
        title: p.programa_nombre,
        date: p.fecha,
        hora_inicio: p.hora_inicio,
        hora_fin: p.hora_fin,
        itinerario_id: p.id_itinerario,
        id_itinerario_programa: p.id_itinerario_programa,
        sortKey: `${p.fecha} ${p.hora_inicio || "00:00:00"}`
      });
    }
    for (const tr of transp) {
      items.push({
        type: "transporte_recojo",
        title: `${tr.empresa} (${tr.tipo})`,
        date: tr.fecha,
        hora: tr.horario_recojo,
        lugar: tr.lugar_recojo,
        itinerario_id: tr.id_itinerario,
        id_itinerario_programa: tr.id_itinerario_programa,
        id_detalle_transporte: tr.id_detalle_transporte,
        sortKey: `${tr.fecha} ${tr.horario_recojo || "00:00:00"}`
      });
    }
    for (const u of updates) {
      items.push({
        type: "itinerario_actualizado",
        title: "Actualización de itinerario",
        updated_at: u.updated_at,
        itinerario_id: u.id_itinerario,
        sortKey: `${new Date(u.updated_at).toISOString()}`
      });
    }

    for (const pu of progUpdated) {
      items.push({
        type: "programa_actualizado",
        title: pu.programa_nombre,
        date: pu.fecha,
        hora_inicio: pu.hora_inicio,
        hora_fin: pu.hora_fin,
        updated_at: pu.updated_at,
        itinerario_id: pu.id_itinerario,
        id_itinerario_programa: pu.id_itinerario_programa,
        sortKey: `${new Date(pu.updated_at).toISOString()}`
      });
    }

    for (const tu of transpUpdated) {
      items.push({
        type: "transporte_actualizado",
        title: `${tu.empresa} (${tu.tipo})`,
        date: tu.fecha,
        hora: tu.horario_recojo,
        lugar: tu.lugar_recojo,
        updated_at: tu.updated_at,
        itinerario_id: tu.id_itinerario,
        id_itinerario_programa: tu.id_itinerario_programa,
        id_detalle_transporte: tu.id_detalle_transporte,
        sortKey: `${new Date(tu.updated_at).toISOString()}`
      });
    }

    for (const pi of progInfoUpdated) {
      items.push({
        type: "programa_actualizado",
        title: pi.nombre,
        updated_at: pi.updated_at,
        itinerario_id: pi.id_itinerario,
        id_itinerario_programa: pi.id_itinerario_programa,
        id_programa: pi.id_programa,
        sortKey: `${new Date(pi.updated_at).toISOString()}`
      });
    }

    for (const mu of machuUpdated) {
      items.push({
        type: "machu_actualizado",
        title: mu.empresa_tren || "Machu Picchu",
        date: mu.fecha,
        updated_at: mu.updated_at,
        itinerario_id: mu.id_itinerario,
        id_itinerario_programa: mu.id_itinerario_programa,
        detalles_machu: {
          empresa_tren: mu.empresa_tren,
          horario_tren_ida: mu.horario_tren_ida,
          horario_tren_retor: mu.horario_tren_retor,
          nombre_guia: mu.nombre_guia,
          ruta: mu.ruta,
          tiempo_visita: mu.tiempo_visita
        },
        sortKey: `${new Date(mu.updated_at).toISOString()}`
      });
    }

    // Deduplicar por (type, itinerario_id, referencia_id) conservando el más reciente
    const pickRef = (n) => n.id_itinerario_programa || n.id_detalle_transporte || n.id_programa || n.referencia_id || 0;
    const getTs = (n) => {
      const v = n.updated_at || n.created_at || n.date || n.hora || n.sortKey || 0;
      const d = new Date(v);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };
    const byKey = new Map();
    for (const n of items) {
      const key = `${n.type}|${n.itinerario_id || ''}|${pickRef(n)}`;
      const cur = byKey.get(key);
      if (!cur) {
        byKey.set(key, n);
      } else {
        if (getTs(n) >= getTs(cur)) byKey.set(key, n);
      }
    }
    const deduped = Array.from(byKey.values());
    deduped.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    let result = deduped.map(({ sortKey, ...rest }) => rest);

    // Agregar cambios detallados desde itinerario_cambios (si existe)
    try {
      const [changes] = await pool.query(
        `SELECT ic.id_cambio, ic.id_itinerario, ic.tipo_cambio, ic.referencia_id, ic.detalle, ic.created_at
         FROM itinerario_cambios ic
         JOIN itinerario_turistas it ON it.id_itinerario = ic.id_itinerario
         WHERE it.id_turista = ?
           AND ic.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         ORDER BY ic.created_at DESC`,
        [idTurista, dias]
      );
      for (const c of changes || []) {
        result.push({
          type: 'cambio_detallado',
          title: `${String(c.tipo_cambio).charAt(0).toUpperCase()}${String(c.tipo_cambio).slice(1)} actualizado`,
          detalle: c.detalle,
          itinerario_id: c.id_itinerario,
          referencia_id: c.referencia_id ?? 0,
          created_at: c.created_at
        });
      }
    } catch (e) {
      console.warn('Aviso: itinerario_cambios no disponible:', e?.message);
    }

    // Aplicar estados por usuario (leída/descartada) si existe tabla notificaciones_estado
    try {
      const userId = req.user?.id;
      if (userId) {
        const [states] = await pool.query(
          `SELECT tipo, itinerario_id, referencia_id, estado
           FROM notificaciones_estado
           WHERE id_usuario = ?`,
          [userId]
        );
        const stateMap = new Map();
        for (const s of states) {
          const key = `${s.tipo}|${s.itinerario_id || ''}|${(s.referencia_id ?? 0)}`;
          stateMap.set(key, s.estado);
        }
        result = result
          .filter(n => {
            const ref = n.id_itinerario_programa || n.id_detalle_transporte || n.id_programa || n.referencia_id || 0;
            const key = `${n.type}|${n.itinerario_id || ''}|${ref}`;
            return stateMap.get(key) !== 'descartada';
          })
          .map(n => {
            const ref = n.id_itinerario_programa || n.id_detalle_transporte || n.id_programa || n.referencia_id || 0;
            const key = `${n.type}|${n.itinerario_id || ''}|${ref}`;
            const st = stateMap.get(key);
            return st === 'leida' ? { ...n, read: true } : n;
          });
      }
    } catch (e) {
      // Si la tabla no existe o falla, ignorar estados
      console.warn('Estados de notificaciones no aplicados:', e?.message);
    }
    return res.json(result);
  } catch (err) {
    console.error("❌ Error al obtener notificaciones del turista:", err.message);
    return res.status(500).json({ ok: false, error: "Error al obtener notificaciones del turista" });
  }
});

// Persistencia de estados de notificaciones
app.post("/api/turista/notificaciones/leida", requireRole(["CLIENTE","TURISTA","ADMIN"]), async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ ok: false, error: "No autenticado" });
    const { tipo, itinerario_id, referencia_id } = req.body || {};
    if (!tipo || !itinerario_id) {
      return res.status(400).json({ ok: false, error: "tipo e itinerario_id son requeridos" });
    }
    const ref = (referencia_id === null || referencia_id === undefined) ? 0 : referencia_id;
    await pool.query(
      `INSERT INTO notificaciones_estado (id_usuario, tipo, itinerario_id, referencia_id, estado, updated_at)
       VALUES (?, ?, ?, ?, 'leida', NOW())
       ON DUPLICATE KEY UPDATE estado = VALUES(estado), updated_at = VALUES(updated_at)`,
      [userId, String(tipo), Number(itinerario_id), Number(ref)]
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error("❌ Error persistiendo notificación leída:", e.message);
    return res.status(500).json({ ok: false, error: "Error al persistir estado" });
  }
});

app.post("/api/turista/notificaciones/descartar", requireRole(["CLIENTE","TURISTA","ADMIN"]), async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ ok: false, error: "No autenticado" });
    const { tipo, itinerario_id, referencia_id } = req.body || {};
    if (!tipo || !itinerario_id) {
      return res.status(400).json({ ok: false, error: "tipo e itinerario_id son requeridos" });
    }
    const ref = (referencia_id === null || referencia_id === undefined) ? 0 : referencia_id;
    await pool.query(
      `INSERT INTO notificaciones_estado (id_usuario, tipo, itinerario_id, referencia_id, estado, updated_at)
       VALUES (?, ?, ?, ?, 'descartada', NOW())
       ON DUPLICATE KEY UPDATE estado = VALUES(estado), updated_at = VALUES(updated_at)`,
      [userId, String(tipo), Number(itinerario_id), Number(ref)]
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error("❌ Error descartando notificación:", e.message);
    return res.status(500).json({ ok: false, error: "Error al persistir estado" });
  }
});

// Generar PDF del itinerario con datos del turista (separado)
app.get('/api/pdf/itinerario', requireRole(["CLIENTE","TURISTA","ADMIN"]), async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ ok: false, error: 'No autenticado' });
    const itinerarioId = parseInt(req.query?.itinerario_id, 10);
    if (!itinerarioId) return res.status(400).json({ ok: false, error: 'itinerario_id requerido' });

    const [rowsTurista] = await pool.query('SELECT id_turista, nombre, apellido, dni, pasaporte, nacionalidad, fecha_nacimiento, genero FROM turistas WHERE id_usuario = ?', [userId]);
    if (!Array.isArray(rowsTurista) || rowsTurista.length === 0) return res.status(404).json({ ok: false, error: 'Turista no encontrado' });
    const turista = rowsTurista[0];

    if (req.user.role !== 'ADMIN') {
      const [check] = await pool.query('SELECT 1 FROM itinerario_turistas WHERE id_itinerario = ? AND id_turista = ?', [itinerarioId, turista.id_turista]);
      if (!Array.isArray(check) || check.length === 0) return res.status(403).json({ ok: false, error: 'No autorizado para este itinerario' });
    }

    const [itRows] = await pool.query(
      `SELECT i.id_itinerario, i.id_grupo, i.fecha_inicio, i.fecha_fin, e.nombre_estado AS estado_presupuesto, g.nombre AS grupo_nombre
       FROM itinerarios i
       LEFT JOIN grupos g ON g.id_grupo = i.id_grupo
       LEFT JOIN estados_presupuesto e ON e.id_estado = i.estado_presupuesto_id
       WHERE i.id_itinerario = ?`, [itinerarioId]
    );
    if (!Array.isArray(itRows) || itRows.length === 0) return res.status(404).json({ ok: false, error: 'Itinerario no encontrado' });
    const it = itRows[0];

    const [prog] = await pool.query(
      `SELECT ip.id_itinerario_programa, ip.fecha, ip.hora_inicio, ip.hora_fin, p.nombre, p.tipo
       FROM itinerario_programas ip
       JOIN programas p ON p.id_programa = ip.id_programa
       WHERE ip.id_itinerario = ?
       ORDER BY ip.fecha, ip.hora_inicio`, [itinerarioId]
    );
    const [transp] = await pool.query(
      `SELECT dti.id_detalle_transporte, dti.horario_recojo, dti.lugar_recojo, t.empresa, t.tipo
       FROM detalle_transporte_itinerario dti
       JOIN itinerario_programas ip ON ip.id_itinerario_programa = dti.id_itinerario_programa
       JOIN transportes t ON t.id_transporte = dti.id_transporte
       WHERE ip.id_itinerario = ?
       ORDER BY ip.fecha, dti.horario_recojo`, [itinerarioId]
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="itinerario_${itinerarioId}.pdf"`);
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text('Itinerario de viaje', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#666').text(`Generado: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1);

    doc.fillColor('#000').fontSize(14).text('Datos del Turista');
    doc.moveDown(0.3);
    doc.fontSize(11)
      .text(`Nombre: ${turista.nombre || ''} ${turista.apellido || ''}`)
      .text(`Documento: ${turista.dni || turista.pasaporte || ''}`)
      .text(`Nacionalidad: ${turista.nacionalidad || ''}`)
      .text(`Género: ${turista.genero || ''}`)
      .text(`Fecha de nacimiento: ${turista.fecha_nacimiento ? new Date(turista.fecha_nacimiento).toISOString().slice(0,10) : ''}`);
    doc.moveDown(1);

    doc.fontSize(14).text('Datos del Itinerario');
    doc.moveDown(0.3);
    doc.fontSize(11)
      .text(`ID: ${it.id_itinerario}`)
      .text(`Grupo: ${it.grupo_nombre || '—'}`)
      .text(`Fechas: ${it.fecha_inicio ? new Date(it.fecha_inicio).toISOString().slice(0,10) : ''} a ${it.fecha_fin ? new Date(it.fecha_fin).toISOString().slice(0,10) : ''}`)
      .text(`Estado: ${it.estado_presupuesto || '—'}`);
    doc.moveDown(1);

    doc.fontSize(14).text('Programas');
    doc.moveDown(0.3);
    if (Array.isArray(prog) && prog.length > 0) {
      prog.forEach((p, i) => {
        const fecha = p.fecha ? new Date(p.fecha).toISOString().slice(0,10) : '';
        doc.fontSize(11).text(`${i+1}. ${p.nombre} (${p.tipo || '—'}) - ${fecha} ${p.hora_inicio || ''}${p.hora_fin ? ' - ' + p.hora_fin : ''}`);
      });
    } else {
      doc.fontSize(11).fillColor('#666').text('Sin programas registrados');
      doc.fillColor('#000');
    }
    doc.moveDown(1);

    doc.fontSize(14).text('Transportes');
    doc.moveDown(0.3);
    if (Array.isArray(transp) && transp.length > 0) {
      transp.forEach((t, i) => {
        doc.fontSize(11).text(`${i+1}. ${t.empresa || '—'} (${t.tipo || '—'}) - ${t.horario_recojo || '—'} ${t.lugar_recojo ? ' — ' + t.lugar_recojo : ''}`);
      });
    } else {
      doc.fontSize(11).fillColor('#666').text('Sin transportes registrados');
      doc.fillColor('#000');
    }

    doc.end();
  } catch (e) {
    console.error('❌ Error generando PDF:', e.message);
    return res.status(500).json({ ok: false, error: 'Error al generar PDF' });
  }
});

// Utilidad: obtener rango de fechas (por defecto últimos 30 días)
function getDateRange(req) {
  const start = req.query?.startDate;
  const end = req.query?.endDate;
  // Normalizar a YYYY-MM-DD
  const toDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  };
  let startDate = toDate(start);
  let endDate = toDate(end);
  if (!endDate) endDate = new Date().toISOString().slice(0, 10);
  if (!startDate) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - 30);
    startDate = d.toISOString().slice(0, 10);
  }
  return { startDate, endDate };
}

// Dashboard: métricas principales
app.get('/api/dashboard/stats', requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req);

    const [[itCount]] = await pool.query(
      `SELECT COUNT(*) AS total FROM itinerarios`
    );

    // Itinerarios activos en el rango: solapan con [startDate, endDate]
    const [[activeCount]] = await pool.query(
      `SELECT COUNT(*) AS activos
       FROM itinerarios
       WHERE fecha_inicio <= ? AND fecha_fin >= ?`,
      [endDate, startDate]
    );

    // Turistas únicos vinculados a itinerarios en el rango (por fechas de itinerario)
    const [[touristCount]] = await pool.query(
      `SELECT COUNT(DISTINCT it.id_turista) AS total
       FROM itinerario_turistas it
       JOIN itinerarios i ON i.id_itinerario = it.id_itinerario
       WHERE i.fecha_inicio <= ? AND i.fecha_fin >= ?`,
      [endDate, startDate]
    );

    // Programas totales
    const [[progCount]] = await pool.query(
      `SELECT COUNT(*) AS total FROM programas`
    );

    // Ingresos aproximados en el rango: suma de costo del programa agendado
    const [[revenueSum]] = await pool.query(
      `SELECT COALESCE(SUM(p.costo),0) AS revenue
       FROM itinerario_programas ip
       JOIN programas p ON p.id_programa = ip.id_programa
       JOIN itinerarios i ON i.id_itinerario = ip.id_itinerario
       WHERE COALESCE(ip.fecha, i.fecha_inicio) BETWEEN ? AND ?`,
      [startDate, endDate]
    );

    return res.json({
      totalItineraries: Number(itCount?.total || 0),
      activeItineraries: Number(activeCount?.activos || 0),
      totalTourists: Number(touristCount?.total || 0),
      totalPrograms: Number(progCount?.total || 0),
      revenue: Number(revenueSum?.revenue || 0)
    });
  } catch (e) {
    console.error('❌ /api/dashboard/stats error:', e.message);
    return res.status(500).json({ ok: false, error: 'Error obteniendo métricas' });
  }
});

// Dashboard: tendencia mensual de itinerarios programados (por fecha de ip.fecha)
app.get('/api/dashboard/itinerary-trend', requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req);
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(COALESCE(ip.fecha, i.fecha_inicio), '%Y-%m') AS ym, COUNT(*) AS cnt
       FROM itinerario_programas ip
       JOIN itinerarios i ON i.id_itinerario = ip.id_itinerario
       WHERE COALESCE(ip.fecha, i.fecha_inicio) BETWEEN ? AND ?
       GROUP BY ym
       ORDER BY ym`,
      [startDate, endDate]
    );
    // Mapear a etiquetas abreviadas es-PE
    const labels = [];
    const data = [];
    // Generar meses entre el rango para rellenar ceros
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const map = new Map(rows.map(r => [r.ym, Number(r.cnt)]));
    const cursor = new Date(start);
    cursor.setDate(1);
    while (cursor <= end) {
      const ym = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}`;
      const label = cursor.toLocaleDateString('es-PE', { month: 'short' });
      labels.push(label.charAt(0).toUpperCase() + label.slice(1));
      data.push(map.get(ym) || 0);
      cursor.setMonth(cursor.getMonth()+1);
    }
    return res.json({ labels, data });
  } catch (e) {
    console.error('❌ /api/dashboard/itinerary-trend error:', e.message);
    return res.status(500).json({ ok: false, error: 'Error obteniendo tendencia' });
  }
});

// Dashboard: distribución por tipo de programa en el rango
app.get('/api/dashboard/program-distribution', requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req);
    const [rows] = await pool.query(
      `SELECT p.tipo AS label, COUNT(*) AS cnt
       FROM itinerario_programas ip
       JOIN programas p ON p.id_programa = ip.id_programa
       JOIN itinerarios i ON i.id_itinerario = ip.id_itinerario
       WHERE COALESCE(ip.fecha, i.fecha_inicio) BETWEEN ? AND ?
       GROUP BY p.tipo`,
      [startDate, endDate]
    );
    const labels = rows.map(r => r.label);
    const data = rows.map(r => Number(r.cnt));
    return res.json({ labels, data });
  } catch (e) {
    console.error('❌ /api/dashboard/program-distribution error:', e.message);
    return res.status(500).json({ ok: false, error: 'Error obteniendo distribución' });
  }
});

// Dashboard: demografía de turistas por nacionalidad en el rango (itinerarios en el rango)
app.get('/api/dashboard/tourist-demographics', requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { startDate, endDate } = getDateRange(req);
    const [rows] = await pool.query(
      `SELECT COALESCE(t.nacionalidad,'Otros') AS nacionalidad, COUNT(DISTINCT t.id_turista) AS cnt
       FROM itinerario_turistas it
       JOIN itinerarios i ON i.id_itinerario = it.id_itinerario
       JOIN turistas t ON t.id_turista = it.id_turista
       WHERE i.fecha_inicio <= ? AND i.fecha_fin >= ?
       GROUP BY COALESCE(t.nacionalidad,'Otros')
       ORDER BY cnt DESC LIMIT 10`,
      [endDate, startDate]
    );
    const labels = rows.map(r => r.nacionalidad);
    const data = rows.map(r => Number(r.cnt));
    return res.json({ labels, data });
  } catch (e) {
    console.error('❌ /api/dashboard/tourist-demographics error:', e.message);
    return res.status(500).json({ ok: false, error: 'Error obteniendo demografía' });
  }
});

// Dashboard: actividades recientes desde tabla de auditoría (si existe)
app.get('/api/dashboard/recent-activities', requireRole(["ADMIN"]), async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query?.limit || '20', 10) || 20, 100);
    let rows = [];
    try {
      const [r] = await pool.query(
        `SELECT id_cambio AS id, id_itinerario, tipo_cambio, referencia_id, detalle, created_at
         FROM itinerario_cambios
         ORDER BY created_at DESC
         LIMIT ?`,
        [limit]
      );
      rows = r;
    } catch (e) {
      // Si la tabla no existe, devolver vacío sin romper
      console.warn('itinerario_cambios no disponible:', e?.message);
      rows = [];
    }
    // Mapear a modelo del front
    const mapType = (t) => {
      if (!t) return 'default';
      if (t === 'itinerario') return 'itinerary';
      if (t === 'turista') return 'tourist';
      if (t === 'programa') return 'program';
      if (t === 'transporte') return 'transport';
      if (t === 'machu') return 'program';
      return 'default';
    };
    const activities = rows.map(r => ({
      id: r.id,
      type: mapType(r.tipo_cambio),
      action: 'updated',
      title: r.detalle || 'Cambio registrado',
      date: r.created_at
    }));
    return res.json(activities);
  } catch (e) {
    console.error('❌ /api/dashboard/recent-activities error:', e.message);
    return res.status(500).json({ ok: false, error: 'Error obteniendo actividades' });
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
