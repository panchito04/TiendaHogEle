-- ========================================================
-- TABLA: catalogo_web (Hogar Elegante)
-- Ejecuta este script en Supabase -> SQL Editor
-- ========================================================

-- 1. Crear tabla si no existe
CREATE TABLE IF NOT EXISTS catalogo_web (
  id_catalogo SERIAL PRIMARY KEY,
  id_producto INT REFERENCES producto(id_producto) ON DELETE CASCADE,
  titulo_comercial VARCHAR(255) NOT NULL,
  descripcion_detallada TEXT,
  precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  precio_anterior NUMERIC(10, 2),
  id_categoria INT REFERENCES categoria(id_categoria),
  fotos TEXT[] DEFAULT '{}',
  video_url TEXT,
  qr_pago_url TEXT,
  estado VARCHAR(30) DEFAULT 'disponible', -- 'disponible', 'en_proceso_pago', 'vendido'
  activo BOOLEAN DEFAULT TRUE,
  vistas INT DEFAULT 0,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_venta TIMESTAMP WITH TIME ZONE
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE catalogo_web ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública: cualquiera puede ver los productos disponibles
CREATE POLICY "Lectura publica de productos disponibles"
  ON catalogo_web FOR SELECT
  USING (activo = true AND estado = 'disponible');

-- Política para actualización pública controlada (para reservar o confirmar compra)
CREATE POLICY "Permitir actualizar estado para compra"
  ON catalogo_web FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 3. Habilitar Supabase Realtime para que los clientes reciban actualizaciones en vivo
ALTER PUBLICATION supabase_realtime ADD TABLE catalogo_web;

-- 4. Opcional: Insertar productos existentes de la tabla 'producto' al catálogo web inicial
INSERT INTO catalogo_web (id_producto, titulo_comercial, descripcion_detallada, precio, id_categoria, fotos, estado)
SELECT 
  p.id_producto,
  p.nombre AS titulo_comercial,
  COALESCE(p.descripcion, 'Excelente producto garantizado por Hogar Elegante.') AS descripcion_detallada,
  p.precio,
  p.id_categoria,
  CASE 
    WHEN p.imagen_url IS NOT NULL THEN ARRAY[p.imagen_url]
    ELSE ARRAY['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800']
  END AS fotos,
  'disponible' AS estado
FROM producto p
WHERE p.cantidad > 0
ON CONFLICT DO NOTHING;
