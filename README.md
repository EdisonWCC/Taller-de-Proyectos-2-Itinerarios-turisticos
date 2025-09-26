#📦 Política de Respaldo de Datos#

La Aplicación de Gestión de Itinerarios Turísticos implementa una política de respaldo para proteger la información crítica y cumplir con la normativa vigente.

🔄 Frecuencia de Respaldo

Respaldo completo: diario, en horarios de baja actividad.

Respaldo incremental: cada 4 horas durante el día.

🗂 Retención de Respaldos

Completos: se conservan durante 30 días.

Incrementales: se conservan durante 7 días.

📜 Cumplimiento Normativo

Conforme a la Ley N° 29733 – Ley de Protección de Datos Personales (Perú).

Garantiza integridad, confidencialidad y recuperación de datos en incidentes.

💾 Almacenamiento

Verificación rápida:

```powershell
where mysql
where mysqldump
```

### 2) Configurar los scripts de respaldo

Edita `TravelDesk/backend/scripts/backup/backup.config.ps1` y ajusta:

```powershell
# Base de datos
$DB_HOST = "localhost"
$DB_PORT = 3306
$DB_NAME = "itinerarios_turisticos"
$DB_USER = "root"
$DB_PASSWORD = ""  # Cambia si corresponde

# Rutas de MySQL (ajusta si es diferente en tu equipo)
$MYSQL_BIN = "C:\\Program Files\\MySQL\\MySQL Server 9.2\\bin"  # o C:\\xampp\\mysql\\bin

# Carpetas de Trabajo (los respaldos se guardan dentro del repo)
$BACKUP_DIR = Join-Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) "backups"

# Incrementales (binlogs)
$MYSQL_DATA_DIR = "C:\\xampp\\mysql\\data"    # datadir real de tu servidor
$BINLOG_BASENAME = "mysql-bin"                    # debe coincidir con log-bin en my.ini

# Retención (días)
$RETENCION_DIAS_COMPLETOS = 30
$RETENCION_DIAS_INCREMENTALES = 7
```

Nota: este archivo se ejecuta por dot-sourcing desde los scripts; por eso puede marcar como “variables asignadas y no usadas” dentro del mismo archivo.

### 3) Habilitar binlogs (requerido para incrementales)

Si usas XAMPP/MariaDB, edita `C:\xampp\mysql\bin\my.ini` y en la sección `[mysqld]` activa:

```
[mysqld]
server-id=1
log-bin=mysql-bin
binlog_format=ROW
binlog_expire_logs_seconds=604800
datadir=C:/xampp/mysql/data
```

Reinicia MySQL desde XAMPP Control Panel (Stop/Start). Verificación:

```powershell
mysql -h localhost -P 3306 -u root -p"" -e "SHOW VARIABLES LIKE 'log_bin%'; SHOW VARIABLES LIKE 'log_bin_basename'; SHOW VARIABLES LIKE 'datadir';"
```

Debes ver `log_bin = ON` y `log_bin_basename` apuntando a tu `datadir` + `mysql-bin`.

### 4) Ejecutar respaldos

Abre PowerShell en `TravelDesk/backend/scripts/backup/`.

- **Respaldo completo** (.sql):

```powershell
.\backup-full.ps1
```

Resultado: crea `TravelDesk/backend/backups/full/<db>_YYYYMMDD_HHMMSS.sql` y limpia según retención.

- **Incremental** (binlogs):

```powershell
.\backup-incremental.ps1
```

Resultado: copia `mysql-bin.00000X` desde `MYSQL_DATA_DIR` a `backups/incremental/` y aplica retención.

- **Verificar/restaurar de prueba**:

```powershell
.\backup-verify-restore.ps1
```

Acciones: crea DB `${DB_NAME}_prueba_restore` e importa el último `.sql` de `backups/full/`.

### 5) Programación (tareas automáticas)

Puedes usar el Programador de tareas de Windows para ejecutar los scripts en los horarios deseados.

Ejemplo de acción:

- Programa diario: `powershell -ExecutionPolicy Bypass -File "<ruta>\backup-full.ps1"`
- Programa cada 4 horas: `powershell -ExecutionPolicy Bypass -File "<ruta>\backup-incremental.ps1"`

### 6) Solución de problemas

- **mysqldump/mysql no encontrados**: ajusta `MYSQL_BIN` en `backup.config.ps1` o agrega a `PATH` y abre nueva PowerShell.
- **ERROR 1045 Access denied**: revisa `DB_USER`/`DB_PASSWORD` y permisos necesarios.
- **No se generan incrementales**: habilita `log-bin` (ver paso 3) y genera actividad en la DB (INSERT/UPDATE/DDL) para que aparezcan binlogs nuevos.
- **Éxito falso en respaldo completo**: si `mysqldump` falla por conexión, valida el tamaño del `.sql` generado; corrige host/puerto/credenciales y vuelve a ejecutar.

### 7) Buenas prácticas

- Usa un usuario dedicado para respaldos con los permisos mínimos necesarios.
- Copia los respaldos off-site (NAS/nube) además del repositorio local.
- Prueba restauraciones periódicamente (script `backup-verify-restore.ps1`).
