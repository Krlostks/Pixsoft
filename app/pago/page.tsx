"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import axios from "axios"

// Iconos
const ShoppingCartIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
)

const TruckIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
)

const CreditCardIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
  </svg>
)

const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)

const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
)

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
}

interface CartResponse {
  items: CartItem[]
  total_carrito: string
  error?: string
}

interface ShippingResponse {
  shipping_cost: number
  error?: string
}

interface PaymentPageProps {
  addressId: number
}

export default function PaymentPage({ addressId }: PaymentPageProps) {
  const [token, setToken] = useState<string | null>(null)

  const [cart, setCart] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [loadingCart, setLoadingCart] = useState(true)
  const [cartError, setCartError] = useState<string | null>(null)
const [shippingRate, setShippingRate] = useState<any | null>(null);

  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [addresses, setAddresses] = useState<any[]>([])
const [loadingAddresses, setLoadingAddresses] = useState(true)
const [addressesError, setAddressesError] = useState<string | null>(null)

const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);


  const [shippingError, setShippingError] = useState<string | null>(null)

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

    console.log("RESPUESTA COMPLETA DEL BACKEND:", res.data);

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


    console.log("Tarifa elegida:", cheapest);

    // Actualizar estados
    setShippingRate(cheapest);
    setShippingCost(cheapest.total_pricing); 
    setShippingCost(Number(cheapest.total)); // o Number(cheapest.amount)
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
    } catch (error) {
      console.error("Error al eliminar producto:", error)
    }
  }
useEffect(() => {
  if (token) fetchAddresses()
}, [token])

useEffect(() => {
  if (selectedAddressId) {
    fetchShipping(selectedAddressId);
  }
}, [selectedAddressId]);

  // Cargar carrito cuando haya token
  useEffect(() => {
    if (token) fetchCart()
  }, [token])

  const finalTotal = shippingCost !== null ? cartTotal + shippingCost : null

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
                  ❌ {cartError}
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
            <div className="space-y-4">
  {addresses.map(dir => (
    <label
      key={dir.id}
      className="flex items-center gap-3 p-4 bg-secondary/40 rounded-2xl hover:bg-secondary/60 cursor-pointer"
    >
      <input
        type="radio"
        name="direccion"
        value={dir.id}
        checked={selectedAddressId === dir.id}
        onChange={() => setSelectedAddressId(dir.id)}
        className="w-5 h-5"
      />

      <div>
        <p className="font-semibold">{dir.alias}</p>
        <p className="text-sm text-muted-foreground">
          {dir.calle} {dir.numero_exterior}, {dir.colonia}, {dir.ciudad}, {dir.estado}
        </p>
      </div>
    </label>
  ))}
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

              {shippingCost === null ? (
                <div>
                  <p className="text-muted-foreground mb-4">Cotiza el envío para continuar con tu compra</p>
                  <button
  onClick={() => selectedAddressId && fetchShipping(selectedAddressId)}
  disabled={loadingShipping || cart.length === 0 || !selectedAddressId}

                  >
                    {loadingShipping ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
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
  </p>
)}

                </div>
              )}

              {shippingError && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-500">
                  ❌ {shippingError}
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
                  <span className="text-muted-foreground">Productos:</span>
                  <span className="font-semibold text-foreground">${cartTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Envío:</span>
                  <span className="font-semibold text-foreground">
                    {shippingCost !== null ? `$${shippingCost.toFixed(2)}` : "—"}
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
                disabled={cart.length === 0 || shippingCost === null}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg text-primary-foreground rounded-2xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                Continuar al Pago
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  Compra 100% segura
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  Envío con garantía
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  Soporte 24/7
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
