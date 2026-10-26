import { supabase } from '../lib/supabaseClient'

const LOCAL_STORAGE_KEY = 'hogar_elegante_curated_catalog'
const WEB_PREFIX = '<!--HE_WEB-->'

// Función para parsear metadatos web incrustados en la descripción del producto
function parseWebMetadata(rawDescription, product) {
  if (!rawDescription) return null
  const idx = rawDescription.indexOf(WEB_PREFIX)
  if (idx === -1) return null

  try {
    const jsonStr = rawDescription.substring(idx + WEB_PREFIX.length).trim()
    const meta = JSON.parse(jsonStr)
    return {
      id: product.id_producto,
      id_producto: product.id_producto,
      titulo: product.nombre,
      descripcion: meta.desc || '',
      precio: parseFloat(product.precio) || 0,
      precioAnterior: meta.precioAnterior ? parseFloat(meta.precioAnterior) : null,
      id_categoria: product.id_categoria,
      categoriaNombre: product.categoria?.nombre || 'General',
      fotos: Array.isArray(meta.fotos) && meta.fotos.length > 0 
        ? meta.fotos 
        : (product.imagen_url ? [product.imagen_url] : []),
      videoUrl: meta.videoUrl || '',
      qrPagoUrl: meta.qrPagoUrl || '',
      estado: meta.estado || 'disponible',
      origen: 'supabase_producto'
    }
  } catch (e) {
    console.warn('Error al parsear metadatos web:', e)
    return null
  }
}

export const catalogService = {
  // Obtener categorías oficiales
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categoria')
        .select('id_categoria, nombre, descripcion')
        .order('id_categoria', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error al cargar categorías:', err.message)
      return []
    }
  },

  // Obtener inventario de almacén (tabla 'producto')
  async getWarehouseProducts() {
    try {
      const { data, error } = await supabase
        .from('producto')
        .select(`
          id_producto,
          nombre,
          descripcion,
          precio,
          id_categoria,
          imagen_url,
          cantidad,
          categoria:id_categoria (
            id_categoria,
            nombre
          )
        `)
        .order('id_producto', { ascending: false })

      if (error) throw error
      return (data || []).map((p) => {
        // Limpiar descripción si contiene metadatos web
        let cleanDesc = p.descripcion || ''
        const idx = cleanDesc.indexOf(WEB_PREFIX)
        if (idx !== -1) {
          try {
            const meta = JSON.parse(cleanDesc.substring(idx + WEB_PREFIX.length).trim())
            cleanDesc = meta.desc || ''
          } catch {
            cleanDesc = cleanDesc.substring(0, idx).trim()
          }
        }

        return {
          id_producto: p.id_producto,
          nombre: p.nombre,
          descripcion: cleanDesc,
          precio: parseFloat(p.precio) || 0,
          id_categoria: p.id_categoria,
          categoriaNombre: p.categoria?.nombre || 'General',
          imagen_url: p.imagen_url || '',
          cantidad: p.cantidad || 0
        }
      })
    } catch (err) {
      console.error('Error al obtener inventario de almacén:', err.message)
      return []
    }
  },

  // Obtener productos publicados y activos para el catálogo público
  async getPublishedCatalog() {
    try {
      // 1. Intentar consultar tabla dedicada catalogo_web si existe en Supabase
      const { data: webData, error: webError } = await supabase
        .from('catalogo_web')
        .select(`
          id_catalogo,
          id_producto,
          titulo_comercial,
          descripcion_detallada,
          precio,
          precio_anterior,
          id_categoria,
          fotos,
          video_url,
          qr_pago_url,
          estado,
          activo,
          categoria:id_categoria (
            id_categoria,
            nombre
          )
        `)
        .eq('activo', true)
        .eq('estado', 'disponible')
        .order('id_catalogo', { ascending: false })

      if (!webError && webData && webData.length > 0) {
        return webData.map((item) => ({
          id: item.id_catalogo,
          id_producto: item.id_producto,
          titulo: item.titulo_comercial,
          descripcion: item.descripcion_detallada,
          precio: parseFloat(item.precio),
          precioAnterior: item.precio_anterior ? parseFloat(item.precio_anterior) : null,
          id_categoria: item.id_categoria,
          categoriaNombre: item.categoria?.nombre || 'General',
          fotos: Array.isArray(item.fotos) && item.fotos.length > 0 ? item.fotos : [],
          videoUrl: item.video_url || '',
          qrPagoUrl: item.qr_pago_url || '',
          estado: item.estado,
          origen: 'catalogo_web'
        }))
      }

      // 2. Si catalogo_web no existe, consultar productos de Supabase con marca <!--HE_WEB-->
      const { data: prodData, error: prodError } = await supabase
        .from('producto')
        .select(`
          id_producto,
          nombre,
          descripcion,
          precio,
          id_categoria,
          imagen_url,
          cantidad,
          categoria:id_categoria (
            id_categoria,
            nombre
          )
        `)
        .like('descripcion', `%${WEB_PREFIX}%`)
        .gt('cantidad', 0)
        .order('id_producto', { ascending: false })

      if (!prodError && prodData && prodData.length > 0) {
        const parsedItems = prodData
          .map((p) => parseWebMetadata(p.descripcion, p))
          .filter((item) => item !== null && item.estado === 'disponible')

        if (parsedItems.length > 0) {
          return parsedItems
        }
      }

      // 3. Respaldo local si no hay conexión o se guardaron borradores locales
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (localData) {
        const parsed = JSON.parse(localData)
        return parsed.filter((item) => item.estado === 'disponible')
      }

      return []
    } catch (err) {
      console.warn('Cargando catálogo desde respaldo local:', err.message)
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
      return localData ? JSON.parse(localData).filter((item) => item.estado === 'disponible') : []
    }
  },

  // Obtener todos los productos del catálogo de administración
  async getAllCatalogItems() {
    try {
      // 1. Intentar de catalogo_web
      const { data: webData, error: webError } = await supabase
        .from('catalogo_web')
        .select(`
          id_catalogo,
          id_producto,
          titulo_comercial,
          descripcion_detallada,
          precio,
          precio_anterior,
          id_categoria,
          fotos,
          video_url,
          qr_pago_url,
          estado,
          activo,
          categoria:id_categoria (
            id_categoria,
            nombre
          )
        `)
        .order('id_catalogo', { ascending: false })

      if (!webError && webData && webData.length > 0) {
        return webData.map((item) => ({
          id: item.id_catalogo,
          id_producto: item.id_producto,
          titulo: item.titulo_comercial,
          descripcion: item.descripcion_detallada,
          precio: parseFloat(item.precio),
          precioAnterior: item.precio_anterior ? parseFloat(item.precio_anterior) : null,
          id_categoria: item.id_categoria,
          categoriaNombre: item.categoria?.nombre || 'General',
          fotos: Array.isArray(item.fotos) && item.fotos.length > 0 ? item.fotos : [],
          videoUrl: item.video_url || '',
          qrPagoUrl: item.qr_pago_url || '',
          estado: item.estado,
          origen: 'catalogo_web'
        }))
      }

      // 2. Si no, consultar productos con metadatos en Supabase
      const { data: prodData } = await supabase
        .from('producto')
        .select(`
          id_producto,
          nombre,
          descripcion,
          precio,
          id_categoria,
          imagen_url,
          cantidad,
          categoria:id_categoria (
            id_categoria,
            nombre
          )
        `)
        .like('descripcion', `%${WEB_PREFIX}%`)
        .order('id_producto', { ascending: false })

      if (prodData && prodData.length > 0) {
        const items = prodData
          .map((p) => parseWebMetadata(p.descripcion, p))
          .filter(Boolean)

        if (items.length > 0) {
          return items
        }
      }

      const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
      return localData ? JSON.parse(localData) : []
    } catch {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
      return localData ? JSON.parse(localData) : []
    }
  },

  // Guardar y publicar producto en la nube (Supabase) y en local
  async saveProductToCatalog(productData) {
    try {
      const meta = {
        web: true,
        desc: productData.descripcion || '',
        precioAnterior: productData.precioAnterior || null,
        fotos: productData.fotos || [],
        videoUrl: productData.videoUrl || '',
        qrPagoUrl: productData.qrPagoUrl || '',
        estado: productData.estado || 'disponible'
      }

      const packedDescription = `${WEB_PREFIX}${JSON.stringify(meta)}`

      // 1. Guardar directamente en la tabla 'producto' de Supabase (persistente en la nube)
      if (productData.id_producto) {
        await supabase
          .from('producto')
          .update({
            nombre: productData.titulo,
            precio: parseFloat(productData.precio) || 0,
            descripcion: packedDescription,
            imagen_url: (productData.fotos && productData.fotos[0]) || undefined
          })
          .eq('id_producto', productData.id_producto)
      } else {
        // Producto nuevo
        const { data: newProd } = await supabase
          .from('producto')
          .insert([{
            nombre: productData.titulo,
            precio: parseFloat(productData.precio) || 0,
            descripcion: packedDescription,
            id_categoria: productData.id_categoria,
            imagen_url: (productData.fotos && productData.fotos[0]) || null,
            cantidad: 1
          }])
          .select('id_producto')
          .single()

        if (newProd) {
          productData.id_producto = newProd.id_producto
        }
      }

      // 2. Intentar también guardar en catalogo_web si la tabla existe
      try {
        await supabase
          .from('catalogo_web')
          .insert([{
            id_producto: productData.id_producto,
            titulo_comercial: productData.titulo,
            descripcion_detallada: productData.descripcion,
            precio: parseFloat(productData.precio) || 0,
            precio_anterior: productData.precioAnterior ? parseFloat(productData.precioAnterior) : null,
            id_categoria: productData.id_categoria,
            fotos: productData.fotos || [],
            video_url: productData.videoUrl || '',
            qr_pago_url: productData.qrPagoUrl || '',
            estado: productData.estado || 'disponible',
            activo: true
          }])
      } catch {
        // Ignorar si la tabla aún no existe
      }

      // 3. Guardar en almacenamiento local como respaldo adicional
      const localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
      const targetId = productData.id || productData.id_producto || 'local_' + Date.now()
      const existingIdx = localList.findIndex((item) => item.id === targetId || item.id_producto === productData.id_producto)

      const newItem = {
        id: targetId,
        id_producto: productData.id_producto,
        ...productData,
        fotos: productData.fotos || [],
        estado: productData.estado || 'disponible'
      }

      if (existingIdx >= 0) {
        localList[existingIdx] = newItem
      } else {
        localList.unshift(newItem)
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localList))
      return { success: true }
    } catch (err) {
      console.error('Error al guardar producto:', err)
      return { success: false, error: err.message }
    }
  },

  // Cambiar estado (disponible / pausado / vendido)
  async updateStatus(id, newStatus) {
    try {
      // 1. En Supabase tabla 'producto'
      const { data: prod } = await supabase
        .from('producto')
        .select('descripcion')
        .eq('id_producto', id)
        .single()

      if (prod && prod.descripcion && prod.descripcion.includes(WEB_PREFIX)) {
        const meta = JSON.parse(prod.descripcion.substring(prod.descripcion.indexOf(WEB_PREFIX) + WEB_PREFIX.length).trim())
        meta.estado = newStatus
        await supabase
          .from('producto')
          .update({
            descripcion: `${WEB_PREFIX}${JSON.stringify(meta)}`,
            cantidad: newStatus === 'vendido' ? 0 : 1
          })
          .eq('id_producto', id)
      }

      // 2. En catalogo_web si existe
      await supabase
        .from('catalogo_web')
        .update({ estado: newStatus })
        .eq('id_catalogo', id)
    } catch (err) {
      console.warn('Actualización de estado remota:', err.message)
    }

    // Actualizar local
    const localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    const updated = localList.map((item) => 
      (item.id === id || item.id_producto === id) ? { ...item, estado: newStatus } : item
    )
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  },

  // Retirar producto del catálogo
  async removeFromCatalog(id) {
    try {
      // Limpiar metadatos en 'producto'
      const { data: prod } = await supabase
        .from('producto')
        .select('descripcion')
        .eq('id_producto', id)
        .single()

      if (prod && prod.descripcion && prod.descripcion.includes(WEB_PREFIX)) {
        const idx = prod.descripcion.indexOf(WEB_PREFIX)
        const originalDesc = prod.descripcion.substring(0, idx).trim()
        await supabase
          .from('producto')
          .update({ descripcion: originalDesc })
          .eq('id_producto', id)
      }

      // En catalogo_web si existe
      await supabase
        .from('catalogo_web')
        .delete()
        .eq('id_catalogo', id)
    } catch (err) {
      console.warn('Eliminación en Supabase:', err.message)
    }

    const localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    const updated = localList.filter((item) => item.id !== id && item.id_producto !== id)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  },

  // Registrar venta y retirar de catálogo
  async markAsSold(product, customerData = {}) {
    await this.updateStatus(product.id_producto || product.id, 'vendido')
    return {
      success: true,
      orderCode: 'HE-' + Math.floor(100000 + Math.random() * 900000)
    }
  }
}
