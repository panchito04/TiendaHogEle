import React, { useState, useEffect, useMemo } from 'react'
import Navbar from './components/Navbar'
import CategoryBar from './components/CategoryBar'
import ProductCard from './components/ProductCard'
import ProductDetailModal from './components/ProductDetailModal'
import QrPaymentModal from './components/QrPaymentModal'
import AdminPanel from './components/AdminPanel'
import AdminLoginModal from './components/AdminLoginModal'
import Footer from './components/Footer'
import { catalogService } from './services/catalogService'
import { RefreshCw, Package } from 'lucide-react'

export default function App() {
  const [currentView, setCurrentView] = useState('catalog') // 'catalog' | 'admin'
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('he_admin_authenticated') === 'true'
  })
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false)

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeProduct, setActiveProduct] = useState(null)
  const [paymentProduct, setPaymentProduct] = useState(null)

  // Detección de ruta secreta: si la URL termina en #admin o /admin
  useEffect(() => {
    const checkHashOrPath = () => {
      const hash = window.location.hash
      const path = window.location.pathname
      if (hash === '#admin' || path === '/admin') {
        if (sessionStorage.getItem('he_admin_authenticated') === 'true') {
          setCurrentView('admin')
        } else {
          setShowAdminLoginModal(true)
        }
      }
    }

    checkHashOrPath()
    window.addEventListener('hashchange', checkHashOrPath)
    return () => window.removeEventListener('hashchange', checkHashOrPath)
  }, [])

  const loadPublishedCatalog = async () => {
    setIsLoading(true)
    try {
      const [cats, prods] = await Promise.all([
        catalogService.getCategories(),
        catalogService.getPublishedCatalog()
      ])
      setCategories(cats)
      setProducts(prods)
    } catch (err) {
      console.error('Error al cargar catálogo:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPublishedCatalog()
  }, [])

  // Al volver del panel de administración
  const handleBackToCatalog = () => {
    setCurrentView('catalog')
    window.location.hash = ''
    loadPublishedCatalog()
  }

  // Login de Administrador
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true)
    setShowAdminLoginModal(false)
    setCurrentView('admin')
    window.location.hash = 'admin'
  }

  // Logout de Administrador
  const handleAdminLogout = () => {
    sessionStorage.removeItem('he_admin_authenticated')
    setIsAdminAuthenticated(false)
    setCurrentView('catalog')
    window.location.hash = ''
    loadPublishedCatalog()
  }

  // Abrir login de administrador
  const handleOpenAdminLogin = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin')
      window.location.hash = 'admin'
    } else {
      setShowAdminLoginModal(true)
    }
  }

  // Retirar producto tras confirmación de pago
  const handlePaymentSuccess = (soldId) => {
    setProducts((prev) => prev.filter((p) => p.id !== soldId))
  }

  // Conteo de productos por categoría
  const countsByCategory = useMemo(() => {
    const counts = {}
    products.forEach((p) => {
      if (p.id_categoria) {
        counts[p.id_categoria] = (counts[p.id_categoria] || 0) + 1
      }
    })
    return counts
  }, [products])

  // Filtrado
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === null || p.id_categoria === selectedCategory
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch = !query || 
        p.titulo?.toLowerCase().includes(query) || 
        p.descripcion?.toLowerCase().includes(query) ||
        p.categoriaNombre?.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, searchQuery])

  // Si estamos en la vista de administración
  if (currentView === 'admin' && isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentView={currentView}
          setCurrentView={setCurrentView}
          onLogoutAdmin={handleAdminLogout}
          catalogCount={products.length}
        />
        <main className="flex-1">
          <AdminPanel onBackToCatalog={handleBackToCatalog} />
        </main>
        <Footer onOpenAdminLogin={handleOpenAdminLogin} />
      </div>
    )
  }

  // Vista de Catálogo Público
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      
      {/* Encabezado */}
      <div>
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentView={currentView}
          setCurrentView={setCurrentView}
          onLogoutAdmin={handleAdminLogout}
          catalogCount={products.length}
        />

        <CategoryBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          countsByCategory={countsByCategory}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Barra de estado del catálogo */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
            <h1 className="text-base sm:text-lg font-bold text-gray-900">
              {selectedCategory 
                ? categories.find(c => c.id_categoria === selectedCategory)?.nombre || 'Catálogo'
                : 'Catálogo de Artículos Disponibles'}
              <span className="text-xs font-normal text-gray-500 ml-2">
                ({filteredProducts.length} {filteredProducts.length === 1 ? 'artículo' : 'artículos'})
              </span>
            </h1>

            <button
              onClick={loadPublishedCatalog}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualizar</span>
            </button>
          </div>

          {/* Estado de carga */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded border border-gray-200 p-3 animate-pulse">
                  <div className="aspect-square bg-gray-100 rounded mb-3" />
                  <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                  <div className="h-7 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Estado Vacío */
            <div className="text-center py-16 px-4 bg-white rounded-lg border border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900">
                {products.length === 0 
                  ? 'No hay productos disponibles en este momento'
                  : 'No se encontraron artículos con el criterio seleccionado'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                {products.length === 0 
                  ? 'Estamos actualizando el inventario de piezas disponibles para venta directa.'
                  : 'Prueba seleccionando otra categoría o borrando el término del buscador.'}
              </p>
              
              {products.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    setSearchQuery('')
                  }}
                  className="mt-4 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded transition-colors"
                >
                  Ver todos los artículos
                </button>
              )}
            </div>
          ) : (
            /* Grilla de Productos */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={(p) => setActiveProduct(p)}
                  onStartPayment={(p) => setPaymentProduct(p)}
                />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Modal de Detalle */}
      {activeProduct && (
        <ProductDetailModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onStartPayment={(p) => {
            setActiveProduct(null)
            setPaymentProduct(p)
          }}
        />
      )}

      {/* Modal de Pago con QR */}
      {paymentProduct && (
        <QrPaymentModal
          product={paymentProduct}
          onClose={() => setPaymentProduct(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Modal de Login de Administrador */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Pie de página con acceso discreto de administración */}
      <Footer onOpenAdminLogin={handleOpenAdminLogin} />

    </div>
  )
}
