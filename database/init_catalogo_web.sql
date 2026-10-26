-- ========================================================
-- TABLA EXCLUSIVA PARA EL CATÁLOGO WEB DE HOGAR ELEGANTE
-- Ejecuta este script en Supabase -> SQL Editor -> Run
-- ========================================================

-- 1. Crear tabla catalogo_web si no existe
CREATE TABLE IF NOT EXISTS catalogo_web (
  id_catalogo SERIAL PRIMARY KEY,
  id_producto INT NULL REFERENCES producto(id_producto) ON DELETE SET NULL, -- Opcional: puede ser NULL si el producto no está en almacén
  titulo_comercial VARCHAR(255) NOT NULL,
  descripcion_detallada TEXT,
  precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  precio_anterior NUMERIC(10, 2),
  id_categoria INT NULL REFERENCES categoria(id_categoria) ON DELETE SET NULL,
  fotos TEXT[] DEFAULT '{}',
  video_url TEXT,
  qr_pago_url TEXT,
  estado VARCHAR(30) DEFAULT 'disponible', -- 'disponible', 'pausado', 'vendido'
  activo BOOLEAN DEFAULT TRUE,
  vistas INT DEFAULT 0,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_venta TIMESTAMP WITH TIME ZONE
);

-- 2. Habilitar Row Level Security (RLS) permisivo para anon key
ALTER TABLE catalogo_web ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Lectura pública de productos disponibles
DROP POLICY IF EXISTS "Lectura publica catalogo" ON catalogo_web;
CREATE POLICY "Lectura publica catalogo"
  ON catalogo_web FOR SELECT
  USING (true);

-- Política INSERT: Permitir insertar productos desde admin
DROP POLICY IF EXISTS "Insertar productos catalogo" ON catalogo_web;
CREATE POLICY "Insertar productos catalogo"
  ON catalogo_web FOR INSERT
  WITH CHECK (true);

-- Política UPDATE: Permitir actualizar estado o datos
DROP POLICY IF EXISTS "Actualizar productos catalogo" ON catalogo_web;
CREATE POLICY "Actualizar productos catalogo"
  ON catalogo_web FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política DELETE: Permitir retirar productos
DROP POLICY IF EXISTS "Eliminar productos catalogo" ON catalogo_web;
CREATE POLICY "Eliminar productos catalogo"
  ON catalogo_web FOR DELETE
  USING (true);

-- 3. Habilitar Supabase Realtime para que los clientes vean cuando se vende un producto
ALTER PUBLICATION supabase_realtime ADD TABLE catalogo_web;
