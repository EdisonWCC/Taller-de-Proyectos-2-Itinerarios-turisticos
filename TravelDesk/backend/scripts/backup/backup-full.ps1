$ErrorActionPreference = "Stop"
. "$PSScriptRoot\\backup.config.ps1"

# Respaldo completo simple a .sql con retención básica
$fecha = Get-Date -Format "yyyyMMdd_HHmmss"
$dest = Join-Path (Join-Path $BACKUP_DIR "full") ("$($DB_NAME)_$fecha.sql")

$mysqldump = Join-Path $MYSQL_BIN "mysqldump.exe"
if (!(Test-Path $mysqldump)) { throw "No se encontró mysqldump.exe en '$mysqldump'" }

$dumpArgs = @(
  "--host=$DB_HOST",
  "--port=$DB_PORT",
  "--user=$DB_USER",
  "--password=$DB_PASSWORD",
  "--databases", $DB_NAME,
  "--single-transaction"
)

& $mysqldump @dumpArgs | Set-Content -Path $dest -Encoding UTF8

# Retener solo los últimos N días
Get-ChildItem (Join-Path $BACKUP_DIR "full") -Filter "*.sql" |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RETENCION_DIAS_COMPLETOS) } |
  Remove-Item -Force

Write-Host "Respaldo completo listo: $dest"
