$ErrorActionPreference = "Stop"
. "$PSScriptRoot\\backup.config.ps1"

# Verificación simple de restauración del último respaldo completo (.sql)
$mysql = Join-Path $MYSQL_BIN "mysql.exe"
if (!(Test-Path $mysql)) { throw "No se encontró mysql.exe en '$mysql'" }

$fullDir = Join-Path $BACKUP_DIR "full"
$ultimo = Get-ChildItem $fullDir -Filter "*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $ultimo) { throw "No se encontró ningún archivo .sql en '$fullDir'" }

$dbPrueba = "${DB_NAME}_prueba_restore"
& $mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -e "DROP DATABASE IF EXISTS ``$dbPrueba``; CREATE DATABASE ``$dbPrueba`` CHARACTER SET utf8mb4;" | Out-Null

# Importar el dump
# PowerShell no implementa el operador de redirección de entrada '<'. Usamos cmd.exe para hacer la redirección de forma segura.
$cmd = '"{0}" -h {1} -P {2} -u {3} -p{4} {5} < "{6}"' -f $mysql, $DB_HOST, $DB_PORT, $DB_USER, $DB_PASSWORD, $dbPrueba, $ultimo.FullName
cmd.exe /c $cmd

Write-Host "Restauración de prueba completada en: $dbPrueba (desde $($ultimo.Name))"
