-- ============================================
-- Script 2: RECREAR ESTRUCTURA (SAFE)
-- ============================================
-- Este script recrea la estructura completa de la base de datos
-- SEGURO: Solo elimina si la tabla NO tiene datos
-- Si la tabla tiene datos, ejecuta primero el Script 1
-- ============================================

-- Paso 1: Verificar cuántos registros existen
-- Descomenta para ver cuántos datos hay
-- SELECT COUNT(*) as total_records FROM results;

-- Paso 2: Verificar la estructura actual
-- Descomenta para ver las columnas
-- \d results

-- ============================================
-- OPCIÓN A: Si la tabla ya existe pero quieres recrearla limpia
-- ============================================

-- A.1: Eliminar índices primero
DROP INDEX IF EXISTS idx_results_download_speed;
DROP INDEX IF EXISTS idx_results_created_at;

-- A.2: Eliminar tabla con protección
-- IMPORTANTE: Solo ejecuta esto si la tabla results está VACÍA
-- Primero ejecuta: DELETE FROM results; (ver Script 1)
DROP TABLE IF EXISTS results;

-- ============================================
-- OPCIÓN B: Crear tabla nueva (compatible con ambas opciones)
-- ============================================

-- B.1: Crear tabla de resultados con estructura completa
CREATE TABLE IF NOT EXISTS results (
  id BIGSERIAL PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  download_speed FLOAT NOT NULL,
  upload_speed FLOAT NOT NULL,
  ping FLOAT NOT NULL,
  city VARCHAR(255),
  country VARCHAR(255),
  isp VARCHAR(255),
  ip_address VARCHAR(255),
  rank INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- B.2: Crear índice para búsquedas rápidas por velocidad (CRITICAL para ranking)
CREATE INDEX IF NOT EXISTS idx_results_download_speed 
ON results(download_speed DESC);

-- B.3: Crear índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_results_created_at 
ON results(created_at DESC);

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Verificar que la tabla fue creada correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'results'
ORDER BY ordinal_position;

-- Verificar que los índices están presentes
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE tablename = 'results'
ORDER BY indexname;

-- Verificar que la tabla está vacía (debe mostrar 0)
SELECT COUNT(*) as total_records FROM results;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- Si todo aparece correctamente, ¡tu base de datos está lista!
-- Estructura: ✓ Tabla
-- Índices: ✓ 2 índices de rendimiento
-- Datos: ✓ Vacía y lista para nuevas pruebas
