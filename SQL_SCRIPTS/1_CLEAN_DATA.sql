-- ============================================
-- Script 1: LIMPIAR DATOS (SAFE)
-- ============================================
-- Este script elimina TODOS los registros de la tabla results
-- pero MANTIENE la estructura de la base de datos intacta
-- Los índices y columnas se conservan
-- ============================================

-- Opción 1: Simple - Elimina todos los datos
DELETE FROM results;

-- Opcional: Resetear la secuencia del ID a 1 (para que el próximo ID sea 1)
-- Descomenta la línea siguiente si quieres resetear los IDs
-- ALTER SEQUENCE results_id_seq RESTART WITH 1;

-- Verificar que la tabla esté vacía
SELECT COUNT(*) as total_records FROM results;

-- Verificar que los índices siguen presentes
SELECT indexname FROM pg_indexes WHERE tablename = 'results';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
