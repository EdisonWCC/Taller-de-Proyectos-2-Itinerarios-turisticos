$ErrorActionPreference = "Stop"
. "$PSScriptRoot\\backup.config.ps1"

# Incremental simple: copia binlogs nuevos si existe $BINLOG_BASENAME
if ([string]::IsNullOrWhiteSpace($BINLOG_BASENAME)) {
  throw "Configura BINLOG_BASENAME y habilita log-bin en MySQL para usar incrementales."
}

$origen = Get-ChildItem -Path $MYSQL_DATA_DIR -Filter ("$BINLOG_BASENAME.*") | Sort-Object Name
if (-not $origen) { throw "No se encontraron binlogs en '$MYSQL_DATA_DIR'" }

$destDir = Join-Path $BACKUP_DIR "incremental"
foreach ($f in $origen) {
  $destFile = Join-Path $destDir $f.Name
  if (!(Test-Path $destFile)) {
    Copy-Item $f.FullName $destFile -Force
  }
}

# Retener solo los últimos N días por fecha de modificación
Get-ChildItem $destDir -File |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RETENCION_DIAS_INCREMENTALES) } |
  Remove-Item -Force

Write-Host "Incremental listo en: $destDir"
