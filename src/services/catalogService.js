import { supabase } from '../lib/supabaseClient'

const LOCAL_STORAGE_KEY = 'hogar_elegante_curated_catalog'

export const catalogService = {
  // Verificar si la tabla catalogo_web ya existe en Supabase
  async checkTableExists() {
    try {
      const { error } = await supabase
        .from('catalogo_web')
        .select('id_catalogo')
        .limit(1)

      if (error && (error.code === 'PGRST204' || error.message?.includes('does not exist'))) {
        return false
      }
      return !error
    } catch {
      return false
    }
  },

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

  // Obtener los productos publicados y activos en catalogo_web
  async getPublishedCatalog() {
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
        .eq('activo', true)
        .eq('estado', 'disponible')
        .order('id_catalogo', { ascending: false })

      if (!error && data) {
        return data.map((item) => ({
          id: item.id_catalogo,
          id_producto: item.id_producto, // Puede ser null si es directo
          titulo: item.titulo_comercial,
          descripcion: item.descripcion_detallada || '',
          precio: parseFloat(item.precio) || 0,
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

      // Si la tabla no existe aún en Supabase, consultar almacenamiento local
      console.warn('Tabla catalogo_web no encontrada en Supabase, usando respaldo local')
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
      return localData ? JSON.parse(localData).filter((item) => item.estado === 'disponible') : []
    } catch (err) {
      console.warn('Error al consultar catalogo_web:', err)
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
      return localData ? JSON.parse(localData).filter((item) => item.estado === 'disponible') : []
    }
  },

  // Obtener todos los productos del catálogo web (para el panel de administración)
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
          descripcion: item.descripcion_detallada || '',
          precio: parseFloat(item.precio) || 0,
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

      const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
      return localData ? JSON.parse(localData) : []
    } catch {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY)
      return localData ? JSON.parse(localData) : []
    }
  },

  // Guardar o publicar producto en la tabla catalogo_web
  async saveProductToCatalog(productData) {
    try {
      const payload = {
        id_producto: productData.id_producto || null, // null si se sube directo sin producto en almacén
        titulo_comercial: productData.titulo,
        descripcion_detallada: productData.descripcion || '',
        precio: parseFloat(productData.precio) || 0,
        precio_anterior: productData.precioAnterior ? parseFloat(productData.precioAnterior) : null,
        id_categoria: productData.id_categoria || null,
        fotos: Array.isArray(productData.fotos) ? productData.fotos : [],
        video_url: productData.videoUrl || '',
        qr_pago_url: productData.qrPagoUrl || '',
        estado: productData.estado || 'disponible',
        activo: true
      }

      let supabaseSuccess = false

      if (productData.id && typeof productData.id === 'number') {
        // Actualizar registro existente
        const { error } = await supabase
          .from('catalogo_web')
          .update(payload)
          .eq('id_catalogo', productData.id)

        if (!error) supabaseSuccess = true
        else console.error('Error al actualizar en catalogo_web:', error.message)
      } else {
        // Insertar nuevo registro
        const { data, error } = await supabase
          .from('catalogo_web')
          .insert([payload])
          .select('id_catalogo')
          .single()

        if (!error && data) {
          productData.id = data.id_catalogo
          supabaseSuccess = true
        } else if (error) {
          console.error('Error al insertar en catalogo_web:', error.message)
        }
      }

      // Guardar también copia local como respaldo
      const localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
      const targetId = productData.id || 'local_' + Date.now()
      const existingIdx = localList.findIndex((item) => item.id === targetId)

      const newItem = {
        id: targetId,
        ...productData,
        id_producto: productData.id_producto || null,
        fotos: productData.fotos || [],
        estado: productData.estado || 'disponible'
      }

      if (existingIdx >= 0) {
        localList[existingIdx] = newItem
      } else {
        localList.unshift(newItem)
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localList))
      return { success: true, supabaseSuccess }
    } catch (err) {
      console.error('Error en saveProductToCatalog:', err)
      return { success: false, error: err.message }
    }
  },

  // Cambiar estado en catalogo_web
  async updateStatus(id, newStatus) {
    try {
      await supabase
        .from('catalogo_web')
        .update({ estado: newStatus })
        .eq('id_catalogo', id)
    } catch (err) {
      console.warn('Actualización de estado en catalogo_web:', err)
    }

    const localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    const updated = localList.map((item) => 
      item.id === id ? { ...item, estado: newStatus } : item
    )
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  },

  // Eliminar producto de catalogo_web
  async removeFromCatalog(id) {
    try {
      await supabase
        .from('catalogo_web')
        .delete()
        .eq('id_catalogo', id)
    } catch (err) {
      console.warn('Eliminación en catalogo_web:', err)
    }

    const localList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    const updated = localList.filter((item) => item.id !== id)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  },

  // Registrar venta y retirar del catálogo
  async markAsSold(product, customerData = {}) {
    await this.updateStatus(product.id, 'vendido')
    return {
      success: true,
      orderCode: 'HE-' + Math.floor(100000 + Math.random() * 900000)
    }
  }
}
