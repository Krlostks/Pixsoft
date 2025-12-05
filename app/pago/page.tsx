"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import axios from "axios"
import { 
  CheckCircleIcon, 
  CreditCardIcon, 
  ShoppingCartIcon, 
  TrashIcon, 
  TruckIcon,
  Loader2Icon,
  AlertCircleIcon
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import ProtectedRoute from "@/components/auth/ProtectedRoute" // Importar

interface CartItem {
  id_carrito: number
  producto_id: number
  nombre: string
  marca: string
  categoria: string
  imagen: string
  cantidad: number
  precio_unitario: string
  subtotal: string
  es_arrendamiento?: boolean
  periodo_arrendamiento?: string
  cantidad_periodos?: number
  fecha_inicio_arrendamiento?: string
  fecha_fin_arrendamiento?: string
}

interface CartResponse {
  items: CartItem[]
  total_carrito: string
  error?: string
}

interface Address {
  id: number
  alias: string
  calle: string
  numero_exterior: string
  colonia: string
  ciudad: string
  estado: string
  codigo_postal: string
}

interface ShippingRate {
  total: number
  delivery_days?: number
  days_in_transit?: number
  carrier?: string
  service?: string
}

function PaymentContent() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [loadingCart, setLoadingCart] = useState(true)
  const [cartError, setCartError] = useState<string | null>(null)
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null)
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [addressesError, setAddressesError] = useState<string | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Obtener token desde cookies
  useEffect(() => {
    const t = Cookies.get("token")
    setToken(t || null)
  }, [])

  // Obtener carrito con axios
  const fetchCart = async () => {
    if (!token) return

    try {
      setLoadingCart(true)
      setCartError(null)

      const res = await axios.get<CartResponse>(
        "http://localhost:8080/api/carrito",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = res.data

      if (data.error) {
        setCartError(data.error)
        return
      }

      setCart(data.items)
      setCartTotal(parseFloat(data.total_carrito || "0"))
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message

      setCartError(errorMsg)
    } finally {
      setLoadingCart(false)
    }
  }

  const fetchAddresses = async () => {
    if (!token) return

    try {
      setLoadingAddresses(true)
      setAddressesError(null)

      const res = await axios.get("http://localhost:8080/api/direcciones", {
        headers: { Authorization: `Bearer ${token}` }
      })

      setAddresses(res.data || [])
    } catch (error: any) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message

      setAddressesError(msg)
    } finally {
      setLoadingAddresses(false)
    }
  }

  const fetchShipping = async (direccionId: number) => {
    if (!token) return;

    try {
      setLoadingShipping(true);
      setShippingError(null);

      const res = await axios.post(
        "http://localhost:8080/api/envios/cotizar",
        { direccion_id: direccionId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;

      // Validación de error del backend
      if (data.error) {
        setShippingError(data.error);
        return;
      }

      // El backend devuelve las tarifas dentro de "rates"
      const rates = data.rates;

      if (!rates || rates.length === 0) {
        setShippingError("No se encontraron tarifas de envío.");
        setShippingCost(null);
        return;
      }

      // Filtrar tarifas válidas
      const validRates = rates.filter((r: any) => r.success === true);

      if (validRates.length === 0) {
        setShippingError("No hay tarifas válidas.");
        setShippingCost(null);
        return;
      }

      // Elegir la tarifa más barata
      const cheapest = validRates.reduce((acc: any, r: any) =>
        Number(r.total) < Number(acc.total) ? r : acc
      );

      // Actualizar estados
      setShippingRate(cheapest);
      const cost = cheapest.total ? Number(cheapest.total) : null;
      setShippingCost(cost);

    } catch (error: any) {
      setShippingError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message
      );
    } finally {
      setLoadingShipping(false);
    }
  };

  // Eliminar producto del carrito
  const removeFromCart = async (id: number) => {
    if (!token) return

    try {
      await axios.delete(`http://localhost:8080/api/carrito/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Actualizar el estado local
      setCart(cart.filter(item => item.id_carrito !== id))
      
      // Recalcular total
      const newTotal = cart
        .filter(item => item.id_carrito !== id)
        .reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
      setCartTotal(newTotal)
      
      toast.success("Producto eliminado del carrito")
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      toast.error("Error al eliminar producto")
    }
  }

  // Procesar pago con MercadoPago
  const handlePayment = async () => {
    if (!token || cart.length === 0 || !selectedAddressId || !shippingCost) {
      toast.error("Completa todos los campos para continuar")
      return
    }

    try {
      setProcessingPayment(true)

      // Obtener datos del usuario
      const userRes = await axios.get("http://localhost:8080/api/usuarios/profile", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const userData = userRes.data
      const cliente_id = userData.data.id
      console.log("Cliente ID:", cliente_id)

      // Preparar productos para la venta
      const productos = cart.map(item => ({
        id: item.producto_id,
        nombre: item.nombre,
        precio_unitario: parseFloat(item.precio_unitario),
        cantidad: item.cantidad,
        imagen_url: item.imagen,
        descuento_unitario: 0,
        es_arrendamiento: item.es_arrendamiento || false,
        periodo_arrendamiento: item.periodo_arrendamiento || null,
        cantidad_periodos: item.cantidad_periodos || null,
        fecha_inicio_arrendamiento: item.fecha_inicio_arrendamiento || null,
        fecha_fin_arrendamiento: item.fecha_fin_arrendamiento || null
      }))

      // Calcular totales
      const subtotal = cartTotal
      const envio = shippingCost
      const iva = subtotal * 0.16 // 16% IVA (ajusta según tu país)
      const total = subtotal + envio + iva

      // Crear preferencia de pago
      const paymentRes = await axios.post(
        "http://localhost:8080/api/pedidos/crear-preferencia",
        {
          total,
          subtotal,
          envio,
          iva,
          descuento: 0,
          productos,
          direccion_envio_id: selectedAddressId,
          direccion_facturacion_id: selectedAddressId,
          metodo_pago: 'mercadopago',
          notas: '',
          cliente_id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      )

      const paymentData = paymentRes.data

      if (!paymentData.success) {
        throw new Error(paymentData.message || "Error al crear el pago")
      }

      // Redirigir a MercadoPago
      window.location.href = paymentData.init_point || paymentData.sandbox_init_point

      toast.success("Redirigiendo a MercadoPago...")

    } catch (error: any) {
      console.error("Error procesando pago:", error)
      toast.error(error.response?.data?.message || "Error al procesar el pago")
    } finally {
      setProcessingPayment(false)
    }
  }

  // Verificar estado de pago pendiente (opcional)
  const checkPendingPayment = async () => {
    if (!token) return

    try {
      const res = await axios.get("http://localhost:8080/api/pedidos/webhook-debug", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log("Ventas pendientes:", res.data)
    } catch (error) {
      console.error("Error verificando pagos:", error)
    }
  }

  useEffect(() => {
    if (token) {
      fetchAddresses()
      fetchCart()
      // checkPendingPayment() // Opcional: verificar pagos pendientes
    }
  }, [token])

  useEffect(() => {
    if (selectedAddressId) {
      fetchShipping(selectedAddressId);
    }
  }, [selectedAddressId])

  const finalTotal = shippingCost !== null ? cartTotal + shippingCost + (cartTotal * 0.16) : null

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Resumen de Pago</h1>
          <p className="text-muted-foreground">Revisa tu pedido antes de finalizar la compra</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Columna izquierda - Carrito y Envío */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CARRITO */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <ShoppingCartIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Tu Carrito</h2>
                  <p className="text-sm text-muted-foreground">{cart.length} productos</p>
                </div>
              </div>

              {loadingCart && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando carrito...</p>
                </div>
              )}

              {cartError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-500">
                  <AlertCircleIcon className="w-5 h-5 inline mr-2" />
                  {cartError}
                </div>
              )}

              {!loadingCart && !cartError && cart.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                    <ShoppingCartIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium mb-2">Tu carrito está vacío</p>
                  <p className="text-muted-foreground text-sm">Agrega productos para continuar</p>
                </div>
              )}

              {/* Lista de productos */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id_carrito}
                    className="flex gap-4 p-4 bg-secondary/30 rounded-2xl hover:bg-secondary/50 transition-all"
                  >
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 truncate">{item.nombre}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{item.marca}</p>
                      <p className="text-xs text-muted-foreground mb-2">{item.categoria}</p>
                      
                      {/* Mostrar info de arrendamiento si aplica */}
                      {item.es_arrendamiento && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            🏢 Arrendamiento
                          </span>
                          {item.periodo_arrendamiento && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {item.cantidad_periodos} {item.periodo_arrendamiento}(s)
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          Cantidad: <span className="font-semibold text-foreground">{item.cantidad}</span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Precio: <span className="font-semibold text-foreground">${parseFloat(item.precio_unitario).toFixed(2)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item.id_carrito)}
                        className="p-2 hover:bg-red-500/10 rounded-xl transition-all group"
                      >
                        <TrashIcon className="w-5 h-5 text-muted-foreground group-hover:text-red-500" />
                      </button>
                      <p className="text-lg font-bold text-foreground">${parseFloat(item.subtotal).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direcciones de envío */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Selecciona dirección de envío</h3>
                
                {loadingAddresses && (
                  <div className="text-center py-4">
                    <Loader2Icon className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground mt-2">Cargando direcciones...</p>
                  </div>
                )}

                {addressesError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-500 mb-4">
                    <AlertCircleIcon className="w-5 h-5 inline mr-2" />
                    {addressesError}
                  </div>
                )}

                <div className="space-y-3">
                  {addresses.map(dir => (
                    <label
                      key={dir.id}
                      className="flex items-center gap-3 p-4 bg-secondary/40 rounded-2xl hover:bg-secondary/60 cursor-pointer transition-all"
                    >
                      <input
                        type="radio"
                        name="direccion"
                        value={dir.id}
                        checked={selectedAddressId === dir.id}
                        onChange={() => setSelectedAddressId(dir.id)}
                        className="w-5 h-5 text-primary accent-primary"
                      />

                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{dir.alias}</p>
                        <p className="text-sm text-muted-foreground">
                          {dir.calle} {dir.numero_exterior}, {dir.colonia}, {dir.ciudad}, {dir.estado} ({dir.codigo_postal})
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {addresses.length === 0 && !loadingAddresses && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No tienes direcciones registradas</p>
                    <button 
                      onClick={() => router.push("/perfil/direcciones")}
                      className="mt-2 text-primary hover:underline"
                    >
                      Agregar dirección
                    </button>
                  </div>
                )}
              </div>

              {/* Subtotal del carrito */}
              {cart.length > 0 && (
                <div className="mt-6 pt-6 border-t border-secondary">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-medium">Subtotal productos:</span>
                    <span className="text-2xl font-bold text-foreground">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ENVÍO */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <TruckIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Envío</h2>
                  <p className="text-sm text-muted-foreground">Calcula el costo de envío</p>
                </div>
              </div>

              {!selectedAddressId ? (
                <div className="text-center py-8">
                  <TruckIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Selecciona una dirección para calcular el envío</p>
                </div>
              ) : shippingCost === null ? (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Cotiza el envío para continuar con tu compra</p>
                  <button
                    onClick={() => selectedAddressId && fetchShipping(selectedAddressId)}
                    disabled={loadingShipping || cart.length === 0}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium flex items-center gap-2 mx-auto hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingShipping ? (
                      <>
                        <Loader2Icon className="w-5 h-5 animate-spin" />
                        Cotizando envío...
                      </>
                    ) : (
                      <>
                        <TruckIcon className="w-5 h-5" />
                        Cotizar Envío
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    <span className="font-semibold text-foreground">Envío cotizado exitosamente</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground ml-9">
                    ${shippingCost != null && !isNaN(shippingCost) ? shippingCost.toFixed(2) : "—"}
                  </p>
                  {shippingRate && (
                    <p className="text-sm text-muted-foreground ml-9 mt-1">
                      Entrega estimada: {shippingRate.delivery_days || shippingRate.days_in_transit || "N/D"} días
                      {shippingRate.carrier && ` • ${shippingRate.carrier}`}
                    </p>
                  )}
                </div>
              )}

              {shippingError && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-500">
                  <AlertCircleIcon className="w-5 h-5 inline mr-2" />
                  {shippingError}
                </div>
              )}
            </div>

          </div>

          {/* Columna derecha - Resumen de Pago */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <CreditCardIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Resumen</h2>
                  <p className="text-sm text-muted-foreground">Total a pagar</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold text-foreground">${cartTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Envío:</span>
                  <span className="font-semibold text-foreground">
                    {shippingCost !== null ? `$${shippingCost.toFixed(2)}` : "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">IVA (16%):</span>
                  <span className="font-semibold text-foreground">
                    ${(cartTotal * 0.16).toFixed(2)}
                  </span>
                </div>

                <div className="h-px bg-secondary"></div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold text-foreground">Total:</span>
                  <span className="text-3xl font-bold text-primary">
                    {finalTotal !== null ? `$${finalTotal.toFixed(2)}` : "—"}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={cart.length === 0 || shippingCost === null || processingPayment}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:shadow-lg text-primary-foreground rounded-2xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <Loader2Icon className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="w-5 h-5" />
                    Pagar con MercadoPago
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground mb-4">
                  Al proceder con el pago, aceptas nuestros{' '}
                  <a href="/terminos" className="text-primary hover:underline">
                    Términos y Condiciones
                  </a>
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  Compra 100% segura con MercadoPago
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  Envío con seguimiento en tiempo real
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  Soporte 24/7 para tu compra
                </div>
              </div>

              {/* Métodos de pago aceptados */}
              <div className="mt-6 pt-6 border-t border-secondary">
                <p className="text-sm text-muted-foreground mb-3">Aceptamos:</p>
                <div className="flex items-center gap-2">
                  <div className="bg-white p-2 rounded-lg">
                    <img src="/mp-logo.png" alt="MercadoPago" className="h-6" />
                  </div>
                  <div className="bg-white p-2 rounded-lg">
                    <span className="font-bold text-blue-500">VISA</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg">
                    <span className="font-bold text-red-500">MasterCard</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg">
                    <span className="font-bold text-green-500">AMEX</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <ProtectedRoute>
      <PaymentContent />
    </ProtectedRoute>
  )
}