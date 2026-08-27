# ============================================================
# actualizar_servidor.ps1
# Actualiza el servidor de una: trae el codigo nuevo de main,
# corre las migraciones SQL pendientes y reinicia PM2.
#
# Uso normal (valores por defecto = localhost\SQLEXPRESS / Autodata):
#   powershell -ExecutionPolicy Bypass -File scripts\actualizar_servidor.ps1
#
# Con otra instancia/base:
#   powershell -ExecutionPolicy Bypass -File scripts\actualizar_servidor.ps1 -SqlServer "MIHOST\INSTANCIA" -Database "Autodata"
#
# Solo correr las migraciones (sin git pull ni restart, por si ya
# actualizaste el codigo a mano):
#   powershell -ExecutionPolicy Bypass -File scripts\actualizar_servidor.ps1 -SkipGitPull -SkipRestart
# ============================================================

param(
    [string]$SqlServer = "localhost\SQLEXPRESS",
    [string]$Database = "Autodata",
    [switch]$SkipGitPull,
    [switch]$SkipMigrations,
    [switch]$SkipRestart
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

# ------------------------------------------------------------
# Lista de migraciones seguras para re-correr, EN ORDEN.
# Cada una chequea internamente si hace falta aplicarse (no rompe
# nada si ya se corrio antes). Cuando agregues un sql/misc/*.sql
# nuevo que sea idempotente, sumalo ACA para que quede cubierto
# por este script en el proximo "actualizar".
#
# NO agregues aca scripts historicos de setup inicial (create-usuario-table.sql,
# fix_ventas_tables.sql, add-codigo-autodata.sql): esos hacen DROP TABLE o
# reescriben codigos existentes, y re-correrlos en un servidor con datos
# reales borra usuarios/ventas o corrompe CodigoMarca/CodigoModelo. Ya se
# aplicaron una vez hace tiempo y no deben volver a ejecutarse.
# ------------------------------------------------------------
$migraciones = @(
    "sql\misc\add_precio_congelado_ventas_empadronamientos.sql",
    "sql\misc\remove_departamento_nacional.sql",
    "sql\misc\asiento_electrico_calef_masaje_a_texto.sql",
    "sql\misc\fix_familia_id_modelos.sql"
)

function Write-Step($msg) {
    Write-Host ""
    Write-Host "== $msg ==" -ForegroundColor Cyan
}

Set-Location $repoRoot

if (-not $SkipGitPull) {
    Write-Step "Actualizando codigo (git pull)"
    git pull
    if ($LASTEXITCODE -ne 0) {
        Write-Host "git pull fallo. Revisa conflictos o cambios locales antes de seguir." -ForegroundColor Red
        exit 1
    }
}

if (-not $SkipMigrations) {
    Write-Step "Corriendo migraciones SQL pendientes"
    foreach ($rel in $migraciones) {
        $path = Join-Path $repoRoot $rel
        if (-not (Test-Path $path)) {
            Write-Host "  (omitido, no existe todavia en este checkout: $rel)" -ForegroundColor DarkGray
            continue
        }
        Write-Host "  -> $rel"
        sqlcmd -S $SqlServer -d $Database -i $path -b -f 65001
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Fallo la migracion '$rel'. Se corta aca -- revisa el error antes de seguir." -ForegroundColor Red
            exit 1
        }
    }
    Write-Host "Todas las migraciones corrieron OK." -ForegroundColor Green
}

if (-not $SkipRestart) {
    Write-Step "Reiniciando PM2"
    npx pm2 restart ecosystem.config.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "pm2 restart fallo (puede que los procesos no estuvieran registrados). Probando 'pm2 start'..." -ForegroundColor Yellow
        npx pm2 start ecosystem.config.js
    }
}

Write-Step "Listo"
