import { supabase } from '../lib/supabaseClient'

const LOCAL_STORAGE_KEY = 'hogar_elegante_curated_catalog'

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

  // Obtener inventario de almacén (tabla 'producto') para que el administrador elija qué publicar
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
      return (data || []).map((p) => ({
        id_producto: p.id_producto,
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        precio: parseFloat(p.precio) || 0,
        id_categoria: p.id_categoria,
        categoriaNombre: p.categoria?.nombre || 'General',
        imagen_url: p.imagen_url || '',
        cantidad: p.cantidad || 0
      }))
    } catch (err) {
      console.error('Error al obtener inventario de almacén:', err.message)
      return []
    }
  },

  // Obtener únicamente los productos aprobados y publicados para el catálogo de venta al público
  async getPublishedCatalog() {
    try {
      // 1. Intentar consultar Supabase tabla 'catalogo_web'
      const { data, error } = await supabase
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

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id_catalogo,
          id_producto: item.id_producto,
          titulo: item.titulo_comercial,
          descripcion: item.descripcion_detallada,
          precio: parseFloat(item.precio),
          precioAnterior: item.precio_anterior ? parseFloat(item.precio_anterior) : null,
          id_categoria: item.id_categoria,
          categoriaNombre: item.categoria?.nombre || 'General',
          fotos: Array.isArray(item.fotos) && item.fotos.length > 0 ? item.fotos : (item.fotos ? [item.fotos] : []),
          videoUrl: item.video_url || '',
          qrPagoUrl: item.qr_pago_url || '',
          estado: item.estado,
          origen: 'supabase'
        }))
      }

      // 2. Si no hay tabla o no hay datos remotos, consultar almacenamiento local de curación
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (localData) {
        const parsed = JSON.parse(localData)
        return parsed.filter((item) => item.estado === 'disponible')
      }

      return []
    } catch (err) {
      console.warn('Consultando catálogo local:', err.message)
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (localData) {
        const parsed = JSON.parse(localData)
        return parsed.filter((item) => item.estado === 'disponible')
      }
      return []
    }
  },

  // Obtener todos los productos del catálogo de administración (incluyendo borradores, pausados y vendidos)
  async getAllCatalogItems() {
    try {
      const { data, error } = await supabase
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

      if (!error && data) {
        return data.map((item) => ({
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
          origen: 'supabase'
        }))
      }

      const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
      return localData ? JSON.parse(localData) : []
    } catch {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
      return localData ? JSON.parse(localData) : []
    }
  },

  // Guardar o publicar producto curado (desde el panel de administración)
  async saveProductToCatalog(productData) {
    try {
      const payload = {
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
      }

      // Intentar guardar en Supabase
      if (productData.id && productData.origen === 'supabase') {
        const { error } = await supabase
          .from('catalogo_web')
          .update(payload)
          .eq('id_catalogo', productData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('catalogo_web')
          .insert([payload])

        if (error) {
          console.warn('No se pudo guardar en Supabase, guardando en respaldo local:', error.message)
        }
      }

      // Guardar también en respaldo local para persistencia instantánea
      const localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
      const existingIndex = localList.findIndex((item) => item.id === productData.id)

      const newItem = {
        id: productData.id || 'local_' + Date.now(),
        ...productData,
        fotos: productData.fotos || [],
        estado: productData.estado || 'disponible'
      }

      if (existingIndex >= 0) {
        localList[existingIndex] = newItem
      } else {
        localList.unshift(newItem)
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localList))
      return { success: true }
    } catch (err) {
      console.error('Error al guardar en catálogo:', err)
      // Guardar localmente como fallback
      const localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
      const newItem = {
        id: productData.id || 'local_' + Date.now(),
        ...productData,
        fotos: productData.fotos || [],
        estado: productData.estado || 'disponible'
      }
      localList.unshift(newItem)
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localList))
      return { success: true }
    }
  },

  // Cambiar estado (disponible / pausado / vendido)
  async updateStatus(id, newStatus) {
    try {
      await supabase
        .from('catalogo_web')
        .update({ estado: newStatus })
        .eq('id_catalogo', id)
    } catch (err) {
      console.warn('Actualizando estado en local:', err.message)
    }

    const localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    const updated = localList.map((item) => 
      item.id === id ? { ...item, estado: newStatus } : item
    )
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  },

  // Retirar producto del catálogo
  async removeFromCatalog(id) {
    try {
      await supabase
        .from('catalogo_web')
        .delete()
        .eq('id_catalogo', id)
    } catch (err) {
      console.warn('Eliminando en local:', err.message)
    }

    const localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    const updated = localList.filter((item) => item.id !== id)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  },

  // Registrar venta y retirar de catálogo
  async markAsSold(product, customerData = {}) {
    await this.updateStatus(product.id, 'vendido')
    return {
      success: true,
      orderCode: 'HE-' + Math.floor(100000 + Math.random() * 900000)
    }
  }
}
