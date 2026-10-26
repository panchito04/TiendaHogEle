# TiendaHogEle - Catálogo Exclusivo y Venta Directa con QR

Tienda web moderna orientada a la venta directa de piezas y productos exclusivos para **Hogar Elegante**, con pago inmediato por código QR y retiro en tiempo real de los artículos adquiridos.

---

## 🌟 Características Principales

1. **Catálogo Exclusivo:**
   - Visualización por categorías con conteos en vivo.
   - Buscador en tiempo real por título o descripción.
   - Soporte para galería de fotos múltiples en alta definición y videos demostrativos (reproductor integrado).

2. **Compra Directa con Código QR:**
   - Temporizador de reserva de 15 minutos mientras el cliente escanea y paga.
   - Generación automática de QR para transferencias bancarias o Simple QR.
   - Código único de referencia de pedido (`HE-XXXXXX`).

3. **Retiro Automático en Tiempo Real (Supabase Realtime):**
   - En cuanto un usuario confirma el pago, la base de datos actualiza el estado a `vendido`.
   - Mediante websockets de Supabase, el producto desaparece automáticamente de la pantalla de todos los visitantes simultáneos sin recargar la página.
   - Botón directo para enviar comprobante de pago por WhatsApp con mensaje pre-rellenado.

4. **Compatibilidad Híbrida con la Base de Datos:**
   - Si se ejecuta el script [`database/init_catalogo_web.sql`](./database/init_catalogo_web.sql), utiliza la tabla especializada `catalogo_web` con fotos y videos exclusivos.
   - Si aún no se ha ejecutado el script, se conecta en modo fallback automático a la tabla `producto`, garantizando que la tienda funcione desde el primer segundo con los productos que ya tienes.

---

## 🚀 Cómo Iniciar el Proyecto

### 1. Variables de Entorno
El archivo `.env` ya se encuentra configurado con tu proyecto Supabase:
```env
VITE_SUPABASE_URL=https://tyxwdutvujcnktxdxxjs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
VITE_API_URL=https://backhogele.onrender.com
VITE_WHATSAPP_NUMBER=59170000000
```

### 2. Ejecución en Desarrollo
```bash
npm run dev
```
La aplicación iniciará en `http://localhost:5173`.

### 3. Compilación para Producción
```bash
npm run build
```
Genera la carpeta optimizada `dist/` lista para ser desplegada en **Vercel** o cualquier CDN.

---

## 🗄️ Configuración en Supabase (Opcional pero Recomendado)

Para habilitar la tabla dedicada con fotos independientes y videos:
1. Abre tu [Supabase Dashboard](https://supabase.com/dashboard).
2. Entra a tu proyecto `tyxwdutvujcnktxdxxjs`.
3. Dirígete a la pestaña **SQL Editor**.
4. Pega el contenido de [`database/init_catalogo_web.sql`](./database/init_catalogo_web.sql) y pulsa **Run**.
5. ¡Listo! La tabla quedará creada con la réplica Realtime activa.
