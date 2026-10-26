import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit3, Trash2, Eye, EyeOff, Check, Image as ImageIcon, Video, QrCode, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'
import { catalogService } from '../services/catalogService'

export default function AdminPanel({ onBackToCatalog, onProductSaved }) {
  const [activeTab, setActiveTab] = useState('catalog') // 'catalog' | 'warehouse'
  const [catalogItems, setCatalogItems] = useState([])
  const [warehouseItems, setWarehouseItems] = useState([])
  const [categories, setCategories] = useState([])
  const [searchWarehouse, setSearchWarehouse] = useState('')
  const [searchCatalog, setSearchCatalog] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Estado del formulario de edición / publicación
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    id_producto: null,
    titulo: '',
    descripcion: '',
    precio: '',
    precioAnterior: '',
    id_categoria: '',
    fotos: [],
    videoUrl: '',
    qrPagoUrl: '',
    estado: 'disponible'
  })
  const [newPhotoUrl, setNewPhotoUrl] = useState('')

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [cats, wh, cat] = await Promise.all([
        catalogService.getCategories(),
        catalogService.getWarehouseProducts(),
        catalogService.getAllCatalogItems()
      ])
      setCategories(cats)
      setWarehouseItems(wh)
      setCatalogItems(cat)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Iniciar curación desde producto de almacén
  const handleSelectWarehouseProduct = (prod) => {
    setEditingItem(null)
    setFormData({
      id: null,
      id_producto: prod.id_producto,
      titulo: prod.nombre,
      descripcion: prod.descripcion || '',
      precio: prod.precio || '',
      precioAnterior: '',
      id_categoria: prod.id_categoria || '',
      categoriaNombre: prod.categoriaNombre,
      fotos: prod.imagen_url ? [prod.imagen_url] : [],
      videoUrl: '',
      qrPagoUrl: '',
      estado: 'disponible'
    })
    setNewPhotoUrl('')
    setIsFormOpen(true)
  }

  // Editar producto existente del catálogo web
  const handleEditCatalogItem = (item) => {
    setEditingItem(item)
    setFormData({
      id: item.id,
      id_producto: item.id_producto,
      titulo: item.titulo,
      descripcion: item.descripcion || '',
      precio: item.precio || '',
      precioAnterior: item.precioAnterior || '',
      id_categoria: item.id_categoria || '',
      categoriaNombre: item.categoriaNombre,
      fotos: Array.isArray(item.fotos) ? [...item.fotos] : [],
      videoUrl: item.videoUrl || '',
      qrPagoUrl: item.qrPagoUrl || '',
      estado: item.estado || 'disponible'
    })
    setNewPhotoUrl('')
    setIsFormOpen(true)
  }

  // Agregar foto a la lista
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return
    setFormData((prev) => ({
      ...prev,
      fotos: [...prev.fotos, newPhotoUrl.trim()]
    }))
    setNewPhotoUrl('')
  }

  // Eliminar foto
  const handleRemovePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, idx) => idx !== index)
    }))
  }

  // Guardar formulario
  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.titulo.trim() || !formData.precio) {
      alert('El título y precio son obligatorios.')
      return
    }

    const payload = {
      ...formData,
      precio: parseFloat(formData.precio),
      precioAnterior: formData.precioAnterior ? parseFloat(formData.precioAnterior) : null,
      id_categoria: formData.id_categoria ? parseInt(formData.id_categoria) : null
    }

    const res = await catalogService.saveProductToCatalog(payload)
    if (res.success) {
      if (onProductSaved) onProductSaved()
      setIsFormOpen(false)
      loadData()
    } else {
      alert('Hubo un problema al guardar: ' + (res.error || 'Revisa la conexión'))
    }
  }

  // Cambiar estado rápido
  const handleToggleStatus = async (item) => {
    const nextStatus = item.estado === 'disponible' ? 'pausado' : 'disponible'
    await catalogService.updateStatus(item.id_producto || item.id, nextStatus)
    if (onProductSaved) onProductSaved()
    loadData()
  }

  // Eliminar de catálogo
  const handleRemove = async (id) => {
    if (confirm('¿Deseas retirar este producto del catálogo público?')) {
      await catalogService.removeFromCatalog(id)
      if (onProductSaved) onProductSaved()
      loadData()
    }
  }

  const filteredWarehouse = warehouseItems.filter((p) => {
    const q = searchWarehouse.trim().toLowerCase()
    return !q || p.nombre.toLowerCase().includes(q) || p.categoriaNombre.toLowerCase().includes(q)
  })

  const filteredCatalog = catalogItems.filter((item) => {
    const q = searchCatalog.trim().toLowerCase()
    return !q || item.titulo.toLowerCase().includes(q) || item.categoriaNombre.toLowerCase().includes(q)
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Administrador de Catálogo Web
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Selecciona productos de tu inventario, añade fotos, video y apruébalos para venta al público.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>
          <button
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 rounded hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ver Tienda</span>
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex space-x-4 mt-6 border-b border-gray-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-1 border-b-2 transition-colors ${
            activeTab === 'catalog'
              ? 'border-gray-900 text-gray-900 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Productos en Catálogo Web ({catalogItems.length})
        </button>

        <button
          onClick={() => setActiveTab('warehouse')}
          className={`pb-3 px-1 border-b-2 transition-colors ${
            activeTab === 'warehouse'
              ? 'border-gray-900 text-gray-900 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Seleccionar del Inventario de Almacén ({warehouseItems.length})
        </button>
      </div>

      {/* PESTAÑA 1: PRODUCTOS EN EL CATÁLOGO */}
      {activeTab === 'catalog' && (
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Buscar en catálogo publicado..."
                value={searchCatalog}
                onChange={(e) => setSearchCatalog(e.target.value)}
                className="w-full text-xs p-2 pl-8 border border-gray-300 rounded bg-white focus:outline-none focus:border-gray-900"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={() => setActiveTab('warehouse')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold px-3 py-2 rounded"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Nuevo Producto</span>
            </button>
          </div>

          {catalogItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200 p-6">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-900">Aún no has aprobado productos para el catálogo web</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Ve a la pestaña "Seleccionar del Inventario de Almacén" para elegir qué productos publicar, agregarles fotos adicionales y activarlos.
              </p>
              <button
                onClick={() => setActiveTab('warehouse')}
                className="mt-4 px-3.5 py-2 bg-gray-900 text-white text-xs font-medium rounded hover:bg-black"
              >
                Elegir productos del inventario
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                    <th className="p-3">Foto</th>
                    <th className="p-3">Título Comercial</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Precio Web</th>
                    <th className="p-3">Fotos / Video</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCatalog.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="p-3 w-14">
                        <img
                          src={(item.fotos && item.fotos[0]) || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200'}
                          alt=""
                          className="w-10 h-10 rounded object-contain bg-gray-50 border border-gray-200"
                        />
                      </td>
                      <td className="p-3 font-semibold text-gray-900 max-w-xs truncate">
                        {item.titulo}
                      </td>
                      <td className="p-3 text-gray-600">
                        {item.categoriaNombre}
                      </td>
                      <td className="p-3 font-bold text-gray-900">
                        Bs. {Number(item.precio).toFixed(2)}
                      </td>
                      <td className="p-3 text-gray-600">
                        <span className="inline-flex items-center gap-1 mr-2">
                          <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                          {Array.isArray(item.fotos) ? item.fotos.length : 1}
                        </span>
                        {item.videoUrl && (
                          <span className="inline-flex items-center text-red-600 font-medium">
                            <Video className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.estado === 'disponible' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : item.estado === 'vendido'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {item.estado === 'disponible' ? 'Público' : item.estado === 'vendido' ? 'Vendido' : 'Pausado'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="p-1 text-gray-500 hover:text-gray-900"
                          title={item.estado === 'disponible' ? 'Pausar' : 'Publicar'}
                        >
                          {item.estado === 'disponible' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEditCatalogItem(item)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Eliminar del catálogo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: INVENTARIO DE ALMACÉN */}
      {activeTab === 'warehouse' && (
        <div className="mt-6">
          <div className="mb-4 max-w-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre o categoría en almacén..."
                value={searchWarehouse}
                onChange={(e) => setSearchWarehouse(e.target.value)}
                className="w-full text-xs p-2 pl-8 border border-gray-300 rounded bg-white focus:outline-none focus:border-gray-900"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredWarehouse.map((prod) => (
              <div 
                key={prod.id_producto}
                className="bg-white rounded-lg border border-gray-200 p-3.5 flex flex-col justify-between hover:border-gray-300 transition-colors"
              >
                <div>
                  <div className="aspect-square bg-gray-50 rounded border border-gray-100 overflow-hidden flex items-center justify-center p-2 mb-2">
                    <img
                      src={prod.imagen_url || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200'}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <span className="text-[10px] text-gray-500 font-medium uppercase">
                    {prod.categoriaNombre}
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mt-0.5">
                    {prod.nombre}
                  </h4>
                  <div className="text-xs font-semibold text-gray-900 mt-1">
                    Precio Almacén: Bs. {Number(prod.precio).toFixed(2)}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleSelectWarehouseProduct(prod)}
                    className="w-full py-1.5 px-3 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Preparar para Catálogo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE CURACIÓN / PUBLICACIÓN */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingItem ? 'Editar Producto del Catálogo Web' : 'Preparar Producto para Venta en Catálogo'}
                </h3>
                <p className="text-xs text-gray-500">
                  Personaliza fotos de catálogo, video demostrativo y precio antes de publicar.
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Título Comercial para la Web</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:border-gray-900 focus:outline-none"
                  placeholder="Ej: Licuadora Oster Cromada 600W de Alta Potencia"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Categoría</label>
                  <select
                    value={formData.id_categoria}
                    onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:border-gray-900 focus:outline-none"
                  >
                    <option value="">Seleccionar</option>
                    {categories.map((c) => (
                      <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Precio Web (Bs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:border-gray-900 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Precio Anterior / Tachado (opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precioAnterior}
                    onChange={(e) => setFormData({ ...formData, precioAnterior: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:border-gray-900 focus:outline-none text-gray-500"
                    placeholder="Ej. 180.00"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Descripción Detallada</label>
                <textarea
                  rows="3"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:border-gray-900 focus:outline-none"
                  placeholder="Describe detalles, estado del producto, especificaciones técnicas y accesorios que incluye..."
                />
              </div>

              {/* SECCIÓN DE FOTOS MÚLTIPLES */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block font-bold text-gray-800 mb-1">
                  Galería de Fotos del Producto ({formData.fotos.length})
                </label>
                <p className="text-[11px] text-gray-500 mb-2">
                  Agrega URLs de Cloudinary o fotos en alta definición para la venta.
                </p>

                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    placeholder="https://res.cloudinary.com/... o enlace de imagen"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-gray-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="px-3 py-2 bg-gray-800 hover:bg-black text-white rounded font-semibold text-xs"
                  >
                    + Agregar Foto
                  </button>
                </div>

                {formData.fotos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.fotos.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded border bg-white p-1">
                        <img src={url} alt="" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* VIDEO */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">URL de Video (opcional)</label>
                <input
                  type="url"
                  placeholder="Enlace de YouTube, Cloudinary MP4, TikTok o video de muestra"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:border-gray-900 focus:outline-none"
                />
              </div>

              {/* CÓDIGO QR PERSONALIZADO */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">URL de Imagen QR Específica (opcional)</label>
                <input
                  type="url"
                  placeholder="Deja vacío para generar automáticamente el QR con el monto exacto"
                  value={formData.qrPagoUrl}
                  onChange={(e) => setFormData({ ...formData, qrPagoUrl: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:border-gray-900 focus:outline-none"
                />
              </div>

              {/* ESTADO DE APROBACIÓN */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Estado de Publicación</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:border-gray-900 focus:outline-none"
                >
                  <option value="disponible">Aprobado (Visible en el catálogo público)</option>
                  <option value="pausado">Borrador / Pausado (Oculto del público)</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-semibold rounded"
                >
                  Guardar y Publicar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
