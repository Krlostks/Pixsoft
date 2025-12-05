import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Cookies from "js-cookie"
import { X, Loader2, MapPin, Calendar, Package } from 'lucide-react';

// Definir la interfaz para las props
interface RentalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | number;
  productName: string;
  productPrice: number;
  stock: number;
}

export function RentalRequestModal({ 
  isOpen, 
  onClose, 
  productId, 
  productName, 
  productPrice,
  stock 
}: RentalRequestModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    // Dirección
    direccion_envio_id: '',
    direccion_facturacion_id: '',
    usar_misma_direccion: true,
    
    // Cantidad y precios
    cantidad: 1,
    precio_unitario: productPrice || 0,
    descuento_unitario: 0,
    
    // Arrendamiento
    es_arrendamiento: true,
    periodo_arrendamiento: 'mensual',
    cantidad_periodos: 1,
    fecha_inicio_arrendamiento: '',
    fecha_fin_arrendamiento: '',
    
    // Pago
    metodo_pago: 'tarjeta_debito',
    notas: ''
  });

  // Cargar direcciones del usuario
  useEffect(() => {
    const t = Cookies.get("token")
    setToken(t || null)
    if (isOpen) {
      fetchAddresses();
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        fecha_inicio_arrendamiento: today
      }));
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/direcciones`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAddresses(response.data);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      toast.error('Error al cargar direcciones');
    }
  };

  // Calcular fecha de fin automáticamente
  useEffect(() => {
    if (formData.fecha_inicio_arrendamiento && formData.cantidad_periodos) {
      const startDate = new Date(formData.fecha_inicio_arrendamiento);
      const endDate = new Date(startDate);

      const multipliers: Record<string, number> = {
        'diario': 1,
        'semanal': 7,
        'mensual': 30,
        'anual': 365
      };

      const days = (formData.cantidad_periodos || 1) * (multipliers[formData.periodo_arrendamiento] || 30);
      endDate.setDate(endDate.getDate() + days);

      setFormData(prev => ({
        ...prev,
        fecha_fin_arrendamiento: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.fecha_inicio_arrendamiento, formData.cantidad_periodos, formData.periodo_arrendamiento]);

  const calculateTotals = () => {
    const subtotal = (formData.precio_unitario - formData.descuento_unitario) * formData.cantidad;
    const iva = subtotal * 0.19;
    const envio = subtotal > 999 ? 0 : 50;
    return { subtotal, iva, envio, total: subtotal + iva + envio };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.direccion_envio_id) {
        toast.error('Selecciona una dirección de envío');
        return;
      }
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      const { subtotal, iva, envio, total } = calculateTotals();

      // Crear venta
      const ventaResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ventas`,
        {
          direccion_envio_id: formData.direccion_envio_id,
          direccion_facturacion_id: formData.usar_misma_direccion ? null : formData.direccion_facturacion_id,
          subtotal,
          descuento: formData.cantidad * formData.descuento_unitario,
          envio,
          iva,
          total,
          metodo_pago: formData.metodo_pago,
          notas: formData.notas
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const ventaId = ventaResponse.data.venta.id;

      // Crear venta_detalles
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/venta_detalles`,
        {
          venta_id: ventaId,
          producto_id: productId,
          cantidad: formData.cantidad,
          precio_unitario: formData.precio_unitario,
          descuento_unitario: formData.descuento_unitario,
          es_arrendamiento: true,
          periodo_arrendamiento: formData.periodo_arrendamiento,
          cantidad_periodos: formData.cantidad_periodos,
          fecha_inicio_arrendamiento: formData.fecha_inicio_arrendamiento,
          fecha_fin_arrendamiento: formData.fecha_fin_arrendamiento
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('¡Arrendamiento solicitado exitosamente!');
      onClose();
      setStep(1);
      setFormData(prev => ({
        ...prev,
        cantidad: 1,
        cantidad_periodos: 1
      }));
    } catch (err: any) {
      console.error('Error creating rental:', err);
      toast.error(err.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const { subtotal, iva, envio, total } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border/30 bg-background/95 backdrop-blur">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Solicitar Arrendamiento</h2>
            <p className="text-sm text-muted-foreground mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Dirección */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Dirección de Envío
                </h3>
                
                <div className="space-y-3">
                  {addresses.length > 0 ? (
                    addresses.map(addr => (
                      <label key={addr.id} className="flex items-start gap-3 p-4 rounded-2xl border border-border hover:bg-secondary/30 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="direccion_envio_id"
                          value={addr.id}
                          checked={formData.direccion_envio_id === String(addr.id)}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{addr.tipo_direccion}</p>
                          <p className="text-sm text-muted-foreground">{addr.calle} {addr.numero}</p>
                          <p className="text-sm text-muted-foreground">{addr.ciudad}, {addr.provincia}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-muted-foreground p-4 bg-secondary/30 rounded-2xl">
                      No tienes direcciones registradas. Por favor añade una.
                    </p>
                  )}
                </div>
              </div>

              {/* Dirección de facturación */}
              <div>
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="usar_misma_direccion"
                    checked={formData.usar_misma_direccion}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Usar la misma dirección para facturación
                  </span>
                </label>

                {!formData.usar_misma_direccion && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Dirección de Facturación</p>
                    {addresses.map(addr => (
                      <label key={addr.id} className="flex items-start gap-3 p-4 rounded-2xl border border-border hover:bg-secondary/30 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="direccion_facturacion_id"
                          value={addr.id}
                          checked={formData.direccion_facturacion_id === String(addr.id)}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{addr.tipo_direccion}</p>
                          <p className="text-sm text-muted-foreground">{addr.calle} {addr.numero}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Detalles de Arrendamiento */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Cantidad y Precio */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    name="cantidad"
                    min="1"
                    max={stock}
                    value={formData.cantidad}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Precio Unitario
                  </label>
                  <input
                    type="number"
                    name="precio_unitario"
                    step="0.01"
                    value={formData.precio_unitario}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Descuento */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Descuento por Unidad (Opcional)
                </label>
                <input
                  type="number"
                    name="descuento_unitario"
                  step="0.01"
                  min="0"
                  value={formData.descuento_unitario}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                />
              </div>

              {/* Arrendamiento */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Período de Arrendamiento
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Tipo de Período
                    </label>
                    <select
                      name="periodo_arrendamiento"
                      value={formData.periodo_arrendamiento}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                    >
                      <option value="diario">Diario</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensual">Mensual</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Cantidad de Períodos
                    </label>
                    <input
                      type="number"
                      name="cantidad_periodos"
                      min="1"
                      value={formData.cantidad_periodos}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      name="fecha_inicio_arrendamiento"
                      value={formData.fecha_inicio_arrendamiento}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Fecha de Fin (Automática)
                    </label>
                    <input
                      type="date"
                      value={formData.fecha_fin_arrendamiento}
                      disabled
                      className="w-full px-4 py-2 rounded-xl border border-border bg-secondary/30 text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Método de Pago
                </label>
                <select
                  name="metodo_pago"
                  value={formData.metodo_pago}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                >
                     <option value="tarjeta_credito">Tarjeta de Crédito</option>
                    <option value="tarjeta_debito">Tarjeta de Débito</option>
                    <option value="paypal">PayPal</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="efectivo">Efectivo</option>
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Notas Adicionales (Opcional)
                </label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  placeholder="Añade cualquier nota especial..."
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground min-h-[100px]"
                />
              </div>

              {/* Resumen */}
              <div className="bg-secondary/30 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío:</span>
                  <span className="font-medium">${envio.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA (19%):</span>
                  <span className="font-medium">${iva.toLocaleString()}</span>
                </div>
                <div className="border-t border-border/30 pt-2 flex justify-between">
                  <span className="font-semibold text-foreground">Total:</span>
                  <span className="font-bold text-primary text-lg">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 rounded-xl border border-border hover:bg-secondary transition-colors font-medium text-foreground"
              >
                Atrás
              </button>
            )}
            <button
              type="submit"
              disabled={loading || (step === 1 && !formData.direccion_envio_id)}
              className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : step === 1 ? (
                'Continuar'
              ) : (
                'Confirmar Arrendamiento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}