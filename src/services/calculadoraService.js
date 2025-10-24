// src/services/calculadoraService.js
import api from './api'

/**
 * Calcula total en el FRONT (sin llamar a la API)
 * @param {Object} p
 * @param {number} p.precioHotel   - precio base del hotel (por persona)
 * @param {number} p.precioTour    - precio base del tour  (por persona)
 * @param {number} p.pasajeros     - cantidad de pasajeros
 * @param {number} [p.promoPct=0]  - % de descuento (0-100)
 * @param {number} [p.descFijo=0]  - descuento fijo adicional (S/)
 * @param {number} [p.impuestos=0] - monto de impuestos (S/)
 * @param {number} [p.recargos=0]  - recargos/misceláneos (S/)
 * @returns {{
 *   subtotal:number, descuentoPromo:number, descuentoFijo:number,
 *   baseNeta:number, impuestos:number, recargos:number, total:number
 * }}
 */
export function calcularTotalLocal({
  precioHotel,
  precioTour,
  pasajeros,
  promoPct = 0,
  descFijo = 0,
  impuestos = 0,
  recargos = 0
}) {
  const ph = Number(precioHotel || 0)
  const pt = Number(precioTour || 0)
  const n  = Math.max(1, Number(pasajeros || 1))
  const subtotal = (ph + pt) * n

  const descuentoPromo = subtotal * (Number(promoPct || 0) / 100)
  const descuentoFijo  = Number(descFijo || 0)

  const baseNeta = Math.max(0, subtotal - descuentoPromo - descuentoFijo)
  const total = baseNeta + Number(impuestos || 0) + Number(recargos || 0)

  return { subtotal, descuentoPromo, descuentoFijo, baseNeta, impuestos, recargos, total }
}

/**
 * Payload estándar para API de cálculo.
 * Úsalo si tu backend expone un endpoint para calcular.
 */
export function buildCalculoPayload({
  hotelId,
  tourId,
  pasajeros,
  promoId = null,
  promoPct = null,
  extras = {}         // { impuestos, recargos, descFijo, etc. }
} = {}) {
  return {
    hotel_id: hotelId,
    tour_id: tourId,
    pasajeros: Number(pasajeros || 1),
    promocion_id: promoId,
    promo_pct: promoPct,
    ...extras
  }
}

/**
 * Calcula total en el BACKEND (si existe el endpoint).
 * Cambia la ruta si tu API usa otra (p.ej. '/cotizaciones/calcular').
 * Si la API responde 404/405, hace fallback al cálculo local.
 */
export async function calcularTotalAPI(payload, fallbackLocalArgs) {
  try {
    const { data } = await api.post('/calculadora/total', payload)
    // Esperado del backend: { subtotal, descuento, total, ... }
    return data
  } catch (err) {
    const status = err?.response?.status
    if (status === 404 || status === 405) {
      // No hay endpoint -> usamos cálculo local
      return {
        ...calcularTotalLocal(fallbackLocalArgs),
        _via: 'local_fallback'
      }
    }
    const msg = err?.response?.data?.message || err.message || 'Error al calcular'
    throw new Error(msg)
  }
}

/** Utilidad simple de formato */
export const money = (n) => Number(n || 0).toFixed(2)
