[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseDeclaredVarsMoreThanAssignments', '', Justification='Variables are set here and used by other scripts via dot-sourcing.')]
param()

<#
  Configuración esencial de respaldos (MySQL) – Español
  Edita solo lo necesario para tu entorno.
#>

# Base de datos
$DB_HOST = "localhost"
$DB_PORT = 3306
$DB_NAME = "itinerarios_turisticos"
$DB_USER = "root"
$DB_PASSWORD = ""  # Puedes usar un usuario con permisos de solo lectura para el dump

# Rutas de MySQL (ajusta si es diferente en tu equipo)
$MYSQL_BIN = "C:\\Program Files\\MySQL\\MySQL Server 9.2\\bin"

# Carpetas de Trabajo (los respaldos se guardan dentro del repo)
$BACKUP_DIR = Join-Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) "backups"

# Incrementales (binlogs). Úsalos solo si están habilitados en my.ini (log-bin)
$MYSQL_DATA_DIR = "C:\\xampp\\mysql\\data"
$BINLOG_BASENAME = "mysql-bin"  # Debe coincidir con el valor de log-bin en my.ini

# Retención (días)
$RETENCION_DIAS_COMPLETOS = 30
$RETENCION_DIAS_INCREMENTALES = 7

# Asegurar carpetas mínimas
New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $BACKUP_DIR "full") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $BACKUP_DIR "incremental") | Out-Null
