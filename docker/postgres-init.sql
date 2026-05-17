-- Script de inicialización para PostgreSQL
-- Este script se ejecuta automáticamente al crear la base de datos

-- Índice único parcial para garantizar un solo dueño activo por vehículo
-- Esto complementa la lógica de negocio en el código
CREATE UNIQUE INDEX IF NOT EXISTS uq_vso_owner_actual
ON "Vinculo_Sujeto_Objeto"(vso_ovp_id)
WHERE vso_responsable = 'S' AND vso_fecha_fin IS NULL AND vso_tipo_vinculo = 'DUENO';

-- Verificar que el índice se creó correctamente
--SELECT indexname, indexdef FROM pg_indexes WHERE indexname = 'uq_vso_owner_actual';