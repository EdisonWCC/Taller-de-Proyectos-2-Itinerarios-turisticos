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
      await conn.query(
        `INSERT INTO detalle_transporte_itinerario (id_itinerario_programa, id_transporte, horario_recojo, lugar_recojo) VALUES (?, ?, ?, ?)`,
        [realIp, d.id_transporte, d.horario_recojo, d.lugar_recojo]
      );
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
    conn = await pool.getConnection();
    await conn.beginTransaction();

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
    await conn.query(`DELETE dmi FROM detalle_machu_itinerario dmi JOIN itinerario_programas ip ON ip.id_itinerario_programa = dmi.id_itinerario_programa WHERE ip.id_itinerario = ?`, [id]);
    await conn.query(`DELETE dti FROM detalle_transporte_itinerario dti JOIN itinerario_programas ip ON ip.id_itinerario_programa = dti.id_itinerario_programa WHERE ip.id_itinerario = ?`, [id]);
    await conn.query(`DELETE FROM itinerario_turistas WHERE id_itinerario = ?`, [id]);
    await conn.query(`DELETE FROM itinerario_programas WHERE id_itinerario = ?`, [id]);

    // Reinsertar relaciones
    if (Array.isArray(turistas) && turistas.length > 0) {
      const values = turistas.filter(t => t?.id_turista).map(t => [id, t.id_turista]);
      if (values.length > 0) await conn.query(`INSERT INTO itinerario_turistas (id_itinerario, id_turista) VALUES ?`, [values]);
    }

    const ipIdMap = new Map();
    for (const itp of programas || []) {
      const info = itp.programa_info || {};
      let id_programa = info.id_programa;
      if (id_programa) {
        const [chk] = await conn.query(`SELECT id_programa FROM programas WHERE id_programa = ?`, [id_programa]);
        if (!Array.isArray(chk) || chk.length === 0) id_programa = undefined;
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
      await conn.query(
        `INSERT INTO detalle_machu_itinerario (id_itinerario_programa, empresa_tren, horario_tren_ida, horario_tren_retor, nombre_guia, ruta, tiempo_visita)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [realIp, m.empresa_tren, m.horario_tren_ida, m.horario_tren_retor, m.nombre_guia, m.ruta, m.tiempo_visita]
      );
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("❌ Error actualizando itinerario:", err.message);
    res.status(500).json({ ok: false, error: "Error al actualizar itinerario" });
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
