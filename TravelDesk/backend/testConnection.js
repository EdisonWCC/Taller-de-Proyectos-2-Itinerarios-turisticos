import pool, { testConnection } from "./src/config/db.js";

(async () => {
  console.log("🔄 Probando conexión a la base de datos...");
  
  // Probar la conexión usando la función testConnection
  const isConnected = await testConnection();
  
  if (isConnected) {
    try {
      // Realizar una consulta de prueba
      const [rows] = await pool.query("SELECT 1 + 1 AS result");
      console.log("✅ Consulta de prueba exitosa. Resultado:", rows[0].result);
      
      // Verificar si la base de datos existe
      const [databases] = await pool.query("SHOW DATABASES LIKE ?", [process.env.DB_NAME || "itinerarios_turisticos"]);
      if (databases.length > 0) {
        console.log("✅ Base de datos encontrada:", databases[0][`Database (${process.env.DB_NAME || "itinerarios_turisticos"})`]);
      } else {
        console.log("⚠️  Base de datos no encontrada. Necesitas crearla primero.");
      }
      
    } catch (err) {
      console.error("❌ Error en consulta:", err.message);
    }
  }
  
  // Cerrar el pool de conexiones
  await pool.end();
  console.log("🔚 Conexión cerrada.");
})();
