import type { Localized } from '../i18n/langs';

/**
 * Formas de pago y condiciones (decisión del dueño, docs/00-brief.md
 * "DATOS Y DECISIONES FINALES"). Se muestran en Servicios y precios.
 * El recargo por tarjeta NO se menciona en la web (se habla al cerrar la venta).
 */
export interface PaymentMethod {
  id: 'zelle' | 'transferencia' | 'paypal' | 'tarjeta';
  /** Ícono del sprite (marca exacta de Simple Icons o UI propio). */
  icon: string;
  text: Localized<string>;
}

export const paymentMethods: PaymentMethod[] = [
  { id: 'zelle', icon: 'b-zelle', text: { es: 'Zelle', en: 'Zelle' } },
  { id: 'transferencia', icon: 'u-enviar', text: { es: 'Transferencia bancaria', en: 'Bank transfer' } },
  { id: 'paypal', icon: 'b-paypal', text: { es: 'PayPal', en: 'PayPal' } },
  { id: 'tarjeta', icon: 'u-tarjeta', text: { es: 'Tarjeta', en: 'Card' } },
];

/** Inicial para empezar (rango en %); el resto se paga al entregar. */
export const deposit = { minPct: 30, maxPct: 50 } as const;
